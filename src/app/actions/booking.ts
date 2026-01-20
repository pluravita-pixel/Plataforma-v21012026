"use server";

import { db } from "@/db";
import { psychologists, availabilitySlots, appointments, users } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- Availability Actions ---

export async function getAvailabilitySlots(psychologistId: string, startDate?: Date, endDate?: Date) {
    // Default to next 30 days if not provided
    const start = startDate || new Date();
    const end = endDate || new Date(new Date().setDate(new Date().getDate() + 30));

    const slots = await db
        .select()
        .from(availabilitySlots)
        .where(
            and(
                eq(availabilitySlots.psychologistId, psychologistId),
                gte(availabilitySlots.startTime, start),
                lte(availabilitySlots.endTime, end),
                eq(availabilitySlots.isBooked, false) // Only fetch unbooked slots
            )
        )
        .orderBy(availabilitySlots.startTime);

    return slots;
}

export async function createAvailabilitySlot(psychologistId: string, startTime: Date, endTime: Date) {
    try {
        await db.insert(availabilitySlots).values({
            psychologistId,
            startTime,
            endTime,
            isBooked: false,
        });
        revalidatePath("/psychologist/calendar");
        return { success: true };
    } catch (error) {
        console.error("Error creating availability slot:", error);
        return { error: "Could not create slot" };
    }
}

export async function deleteAvailabilitySlot(slotId: string) {
    try {
        await db.delete(availabilitySlots).where(eq(availabilitySlots.id, slotId));
        revalidatePath("/psychologist/calendar");
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete slot" };
    }
}

// --- Booking Actions ---

export async function createPendingAppointment(data: {
    patientName: string;
    patientEmail: string;
    psychologistId: string;
    slotId: string;
    startTime: Date;
    discountCodeId?: string;
    finalPrice?: string;
}) {
    try {
        // 1. Check if user exists, if not create a temporary/guest user or link to existing
        // For simplicity, we'll try to find by email. If not found, we might need to handle registration or 
        // create a "shadow" user. For this flow, let's assume we find by email or it fails if not registered
        // BUT the requirements say "pida nombre, email", suggesting they might not be logged in. 
        // Let's search for user by email.
        const [existingUser] = await db.select().from(users).where(eq(users.email, data.patientEmail));

        let userId = existingUser?.id;

        // If no user found, technically we should create one or prompt login.
        // For this specific flow, let's return a specific status if user not found so the UI can redirect to register
        // OR creates a guest user. Let's assume we CREATE a user implicitly or require auth. 
        // Given earlier flows, let's require auth but maybe auto-create for smoother UX? 
        // User said: "coger cita que me pida mi nombre, mi email". This implies guest checkout feel.
        if (!userId) {
            // Create a lightweight user record (maybe with a temp password or just as a placeholder)
            // simplified for this interaction:
            // return { error: "User_Not_Found" }; // Let frontend handle
            const [newUser] = await db.insert(users).values({
                email: data.patientEmail,
                fullName: data.patientName,
                role: 'patient',
                // password? 
            }).returning();
            userId = newUser.id;
        }

        // 2. Mark slot as booked (optimistic locking would be better but simple for now)
        await db
            .update(availabilitySlots)
            .set({ isBooked: true })
            .where(eq(availabilitySlots.id, data.slotId));

        // 3. Create Appointment with 'pending_payment' status
        const [newAppointment] = await db.insert(appointments).values({
            patientId: userId,
            psychologistId: data.psychologistId,
            date: data.startTime,
            price: data.finalPrice, // cast if needed
            status: "pending_payment",
            discountCodeId: data.discountCodeId
        }).returning();

        return { success: true, appointmentId: newAppointment.id };

    } catch (error) {
        console.error("Booking error:", error);
        return { error: "Booking failed" };
    }
}

export async function confirmAppointmentPayment(appointmentId: string) {
    await db
        .update(appointments)
        .set({ status: "scheduled" }) // or 'paid'
        .where(eq(appointments.id, appointmentId));

    // Also likely want to update user sessionsCount etc.
    revalidatePath("/dashboard");
}

export async function getPatientAppointments(patientId: string) {
    // Assuming 'appointments' has a 'patientId' field and relation to 'psychologist'
    const userAppointments = await db.query.appointments.findMany({
        where: eq(appointments.patientId, patientId),
        orderBy: [desc(appointments.date)],
        with: {
            psychologist: true // Ensure 'psychologist' relation exists and is fetched
        }
    });
    return userAppointments;
}
