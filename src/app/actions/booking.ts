"use server";

import { db, client } from "@/db";
import { psychologists, availabilitySlots, appointments, users } from "@/db/schema";
import { eq, and, gte, lte, desc, sql, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { refreshPsychologistStats } from "./psychologists";

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
    isAnonymous?: boolean;
}) {
    try {
        // 1. Ensure user exists (using raw client to avoid pooler issues)
        const userResults = await client`SELECT id FROM users WHERE email = ${data.patientEmail} LIMIT 1`;
        let userId = userResults[0]?.id;

        if (!userId) {
            // Check again inside a small retry or just try to insert
            try {
                const newUserResults = await client`
                    INSERT INTO users (email, full_name, role)
                    VALUES (${data.patientEmail}, ${data.patientName}, 'patient')
                    RETURNING id
                `;
                userId = newUserResults[0].id;
            } catch (insErr) {
                // If it fails with duplicate key, fetch again
                const finalCheck = await client`SELECT id FROM users WHERE email = ${data.patientEmail} LIMIT 1`;
                userId = finalCheck[0]?.id;
                if (!userId) throw insErr;
            }
        }

        // 2. Mark slot as booked
        await client`
            UPDATE availability_slots 
            SET is_booked = true 
            WHERE id = ${data.slotId}
        `;

        // 3. Create Appointment with 'pending_payment' status
        const apptResults = await client`
            INSERT INTO appointments (
                patient_id, psychologist_id, patient_name, date, price, status, discount_code_id, is_anonymous
            ) VALUES (
                ${userId}, ${data.psychologistId}, ${data.patientName || null}, ${data.startTime.toISOString()}, 
                ${data.finalPrice || null}, 'pending_payment', ${data.discountCodeId || null}, ${data.isAnonymous || false}
            )
            RETURNING id
        `;

        return { success: true, appointmentId: apptResults[0].id };

    } catch (error: any) {
        console.error("Booking error details:", error);
        return { error: `No se pudo crear la reserva: ${error.message || 'Error desconocido'}. Por favor intenta de nuevo.` };
    }
}

export async function confirmAppointmentPayment(appointmentId: string) {
    try {
        // 1. Mark as scheduled using raw client
        await client`
            UPDATE appointments 
            SET status = 'scheduled' 
            WHERE id = ${appointmentId}
        `;

        // 2. Fetch psychologist_id to refresh stats
        const results = await client`SELECT psychologist_id FROM appointments WHERE id = ${appointmentId} LIMIT 1`;
        if (results[0]) {
            await refreshPsychologistStats(results[0].psychologist_id);
        }

        revalidatePath("/patient/dashboard");
        revalidatePath("/psychologist/dashboard");
        revalidatePath("/psychologist/patients");
    } catch (error) {
        console.error("Error confirming payment:", error);
    }
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
