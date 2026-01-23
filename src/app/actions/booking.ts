"use server";

import { db, client } from "@/db";
import { psychologists, availabilitySlots, appointments, users } from "@/db/schema";
import { eq, and, gte, lte, desc, sql, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { refreshPsychologistStats } from "./psychologists";
import { getCurrentUser } from "./auth";

async function verifyPsychologist(psychologistId?: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("No autorizado");

    if (user.role === 'admin') return user;

    if (user.role !== 'psychologist') {
        throw new Error("Se requiere rol de coach.");
    }

    if (psychologistId) {
        const result = await client`SELECT id FROM psychologists WHERE user_id = ${user.id} LIMIT 1`;
        if (result.length === 0 || result[0].id !== psychologistId) {
            throw new Error("No autorizado para este coach.");
        }
    }
    return user;
}

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
    await verifyPsychologist(psychologistId);
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
    const user = await verifyPsychologist();
    try {
        if (user.role !== 'admin') {
            const slotResult = await client`SELECT psychologist_id FROM availability_slots WHERE id = ${slotId} LIMIT 1`;
            const psychResult = await client`SELECT id FROM psychologists WHERE user_id = ${user.id} LIMIT 1`;
            if (slotResult[0]?.psychologist_id !== psychResult[0]?.id) {
                throw new Error("Este slot no te pertenece.");
            }
        }
        await db.delete(availabilitySlots).where(eq(availabilitySlots.id, slotId));
        revalidatePath("/psychologist/calendar");
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete slot" };
    }
}

// --- Bulk Update Action ---
export async function bulkUpdateSlots(psychologistId: string, desiredSlots: { startTime: Date | string, endTime: Date | string }[]) {
    await verifyPsychologist(psychologistId);

    try {
        // 1. Get existing UNBOOKED slots to compare
        // We only want to manage slots that are currently "future" or "relevant"?
        // Simpler: Delete all unbooked slots and re-insert.
        // Risk: If pagination exists (not yet), we might delete future slots we didn't see.
        // Assuming we loaded "next 30 days".
        // Let's rely on the client sending us what it wants to *keep* + *add*.
        // Actually, deleting ALL unbooked slots is risky if the user acts on a subset.
        // Let's try to match by ID?
        // The client generates `temp-` IDs.
        // Existing slots have UUIDs.

        // Strategy: 
        // 1. IDs present in desiredSlots that are UUIDs -> Keep (Do nothing).
        // 2. IDs present in DB but NOT in desiredSlots -> Delete.
        // 3. IDs starting with "temp-" -> Insert.

        // This requires `desiredSlots` to include IDs.
        return { error: "This function requires IDs to perform safe diffs." };
    } catch (e) {
        return { error: "Bulk update failed" };
    }
}

export async function saveSchedule(psychologistId: string, slots: { id: string, startTime: Date | string, endTime: Date | string }[]) {
    await verifyPsychologist(psychologistId);

    try {
        // 1. Identify slots to delete: present in DB (unbooked) but missing in `slots` list
        // Fetch all current unbooked slots for this psych
        const currentDbSlots = await client`
            SELECT id FROM availability_slots 
            WHERE psychologist_id = ${psychologistId} 
            AND is_booked = false
        `;

        const keptIds = new Set(slots.filter(s => !s.id.startsWith('temp-')).map(s => s.id));
        const slotsToDelete = currentDbSlots.filter(s => !keptIds.has(s.id)).map(s => s.id);

        if (slotsToDelete.length > 0) {
            await client`
                DELETE FROM availability_slots 
                WHERE id = ANY(${slotsToDelete})
            `;
        }

        // 2. Identify slots to add: start with 'temp-'
        const slotsToAdd = slots.filter(s => s.id.startsWith('temp-'));

        if (slotsToAdd.length > 0) {
            const values = slotsToAdd.map(s => ({
                psychologist_id: psychologistId,
                start_time: new Date(s.startTime).toISOString(),
                end_time: new Date(s.endTime).toISOString(),
                is_booked: false
            }));

            // Construct multi-row insert
            // Drizzle is cleaner for this
            await db.insert(availabilitySlots).values(values.map(v => ({
                psychologistId: v.psychologist_id,
                startTime: new Date(v.start_time),
                endTime: new Date(v.end_time),
                isBooked: v.is_booked
            })));
        }

        revalidatePath("/psychologist/calendar");
        return { success: true };
    } catch (error) {
        console.error("Save schedule error:", error);
        return { error: "Error al guardar el horario." };
    }
}


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
    const user = await getCurrentUser();
    // If logged in, email must match
    if (user && user.email !== data.patientEmail && user.role !== 'admin') {
        throw new Error("No puedes reservar citas para otra persona.");
    }

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
                ${userId}, ${data.psychologistId}, ${data.patientName || null}, ${new Date(data.startTime).toISOString()}, 
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
    const user = await getCurrentUser();
    if (!user || (user.id !== patientId && user.role !== 'admin')) {
        throw new Error("No autorizado.");
    }
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
