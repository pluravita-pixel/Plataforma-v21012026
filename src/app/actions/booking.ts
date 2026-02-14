"use server";

import { db, client } from "@/db";
import { oyentes, availabilitySlots, appointments, users } from "@/db/schema";
import { eq, and, gte, lte, desc, sql, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { refreshOyenteStats } from "./oyentes";
import { getCurrentUser } from "./auth";

async function verifyOyente(oyenteId?: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("No autorizado");

    if (user.role === 'admin') return user;

    if (user.role !== 'oyente') {
        throw new Error("Se requiere rol de oyente.");
    }

    if (oyenteId) {
        const result = await client`SELECT id FROM oyentes WHERE user_id = ${user.id} LIMIT 1`;
        if (result.length === 0 || result[0].id !== oyenteId) {
            throw new Error("No autorizado para este oyente.");
        }
    }
    return user;
}

// --- Availability Actions ---

export async function getAvailabilitySlots(oyenteId: string, startDate?: Date, endDate?: Date) {
    const now = new Date();
    const minAdvance = new Date(now);
    minAdvance.setHours(now.getHours() + 48); // Enforce 48h (2 days) rule

    const start = startDate && startDate > minAdvance ? startDate : minAdvance;
    const end = endDate || new Date(new Date().setDate(new Date().getDate() + 30));

    const slots = await db
        .select()
        .from(availabilitySlots)
        .where(
            and(
                eq(availabilitySlots.oyenteId, oyenteId),
                gte(availabilitySlots.startTime, start),
                lte(availabilitySlots.endTime, end),
                eq(availabilitySlots.isBooked, false)
            )
        )
        .orderBy(availabilitySlots.startTime);

    return slots;
}

export async function createAvailabilitySlot(oyenteId: string, startTime: Date, endTime: Date) {
    await verifyOyente(oyenteId);
    try {
        await db.insert(availabilitySlots).values({
            oyenteId,
            startTime,
            endTime,
            isBooked: false,
        });
        revalidatePath("/oyente/calendar");
        return { success: true };
    } catch (error: any) {
        if (error.digest === 'DYNAMIC_SERVER_USAGE' || (error.message && error.message.includes('Dynamic server usage'))) {
            throw error;
        }
        console.error("Error creating availability slot:", error);
        return { error: "Could not create slot" };
    }
}

export async function deleteAvailabilitySlot(slotId: string) {
    const user = await verifyOyente();
    try {
        if (user.role !== 'admin') {
            const slotResult = await client`SELECT oyente_id FROM availability_slots WHERE id = ${slotId} LIMIT 1`;
            const psychResult = await client`SELECT id FROM oyentes WHERE user_id = ${user.id} LIMIT 1`;
            if (slotResult[0]?.oyente_id !== psychResult[0]?.id) {
                throw new Error("Este slot no te pertenece.");
            }
        }
        await db.delete(availabilitySlots).where(eq(availabilitySlots.id, slotId));
        revalidatePath("/oyente/calendar");
        return { success: true };
    } catch (error: any) {
        if (error.digest === 'DYNAMIC_SERVER_USAGE' || (error.message && error.message.includes('Dynamic server usage'))) {
            throw error;
        }
        return { error: "Failed to delete slot" };
    }
}

export async function saveSchedule(oyenteId: string, slots: { id: string, startTime: Date | string, endTime: Date | string }[]) {
    await verifyOyente(oyenteId);

    try {
        const currentDbSlots = await client`
            SELECT id FROM availability_slots 
            WHERE oyente_id = ${oyenteId} 
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

        const slotsToAdd = slots.filter(s => s.id.startsWith('temp-'));

        if (slotsToAdd.length > 0) {
            const values = slotsToAdd.map(s => ({
                oyente_id: oyenteId,
                start_time: new Date(s.startTime).toISOString(),
                end_time: new Date(s.endTime).toISOString(),
                is_booked: false
            }));

            await db.insert(availabilitySlots).values(values.map(v => ({
                oyenteId: v.oyente_id,
                startTime: new Date(v.start_time),
                endTime: new Date(v.end_time),
                isBooked: v.is_booked
            })));
        }

        revalidatePath("/oyente/calendar");
        return { success: true };
    } catch (error: any) {
        if (error.digest === 'DYNAMIC_SERVER_USAGE' || (error.message && error.message.includes('Dynamic server usage'))) {
            throw error;
        }
        console.error("Save schedule error:", error);
        return { error: "Error al guardar el horario." };
    }
}

export async function saveRecurringSchedule(oyenteId: string, template: { dayOfWeek: number, hours: number[] }[]) {
    await verifyOyente(oyenteId);

    try {
        const slotsToAdd: any[] = [];
        const now = new Date();
        const fourWeeksLater = new Date(now);
        fourWeeksLater.setDate(now.getDate() + 28);
        fourWeeksLater.setHours(23, 59, 59, 999);

        // Fetch existing slots to prevent duplicates
        const existingSlots = await db
            .select({ startTime: availabilitySlots.startTime })
            .from(availabilitySlots)
            .where(
                and(
                    eq(availabilitySlots.oyenteId, oyenteId),
                    gte(availabilitySlots.startTime, now),
                    lte(availabilitySlots.endTime, fourWeeksLater)
                )
            );

        const existingStartTimes = new Set(existingSlots.map(s => s.startTime.getTime()));

        // Loop for 4 weeks
        for (let week = 0; week < 4; week++) {
            for (const dayLimit of template) {
                // Find the next occurrence of dayOfWeek
                const d = new Date(now);
                d.setDate(now.getDate() + (week * 7) + ((dayLimit.dayOfWeek + 7 - now.getDay()) % 7));
                d.setHours(0, 0, 0, 0);

                // Ensure strict future dates or today later
                if (d < new Date(new Date().setHours(0, 0, 0, 0))) continue;

                for (const hour of dayLimit.hours) {
                    const start = new Date(d);
                    start.setHours(hour, 0, 0, 0);
                    const end = new Date(start);
                    end.setHours(hour + 1, 0, 0, 0);

                    // Skip if slot already exists
                    if (existingStartTimes.has(start.getTime())) continue;

                    slotsToAdd.push({
                        oyenteId,
                        startTime: start,
                        endTime: end,
                        isBooked: false
                    });
                }
            }
        }

        if (slotsToAdd.length > 0) {
            await db.insert(availabilitySlots).values(slotsToAdd);
        }

        revalidatePath("/oyente/calendar");
        return { success: true };
    } catch (error: any) {
        console.error("Recurring save error:", error);
        return { error: "Error al generar slots recurrentes." };
    }
}


export async function createPendingAppointment(data: {
    usuarioNombre: string;
    usuarioEmail: string;
    oyenteId: string;
    slotId: string;
    startTime: Date;
    discountCodeId?: string;
    finalPrice?: string;
    isAnonymous?: boolean;
}) {
    const user = await getCurrentUser();
    if (user && user.email !== data.usuarioEmail && user.role !== 'admin') {
        throw new Error("No puedes reservar citas para otra persona.");
    }

    // Double check 48h rule on server side
    const now = new Date();
    const startTime = new Date(data.startTime);
    const diff = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diff < 48) {
        return { error: "Las citas deben reservarse con al menos 48 horas de antelación." };
    }

    try {
        const userResults = await client`SELECT id FROM users WHERE email = ${data.usuarioEmail} LIMIT 1`;
        let userId = userResults[0]?.id;

        if (!userId) {
            try {
                const newUserResults = await client`
                    INSERT INTO users (email, full_name, role)
                    VALUES (${data.usuarioEmail}, ${data.usuarioNombre}, 'usuario')
                    RETURNING id
                `;
                userId = newUserResults[0].id;
            } catch (insErr) {
                const finalCheck = await client`SELECT id FROM users WHERE email = ${data.usuarioEmail} LIMIT 1`;
                userId = finalCheck[0]?.id;
                if (!userId) throw insErr;
            }
        }

        await client`
            UPDATE availability_slots 
            SET is_booked = true 
            WHERE id = ${data.slotId}
        `;

        const apptResults = await client`
            INSERT INTO appointments (
                usuario_id, oyente_id, usuario_nombre, date, price, status, discount_code_id, is_anonymous
            ) VALUES (
                ${userId}, ${data.oyenteId}, ${data.usuarioNombre || null}, ${new Date(data.startTime).toISOString()}, 
                ${data.finalPrice || null}, 'pending_payment', ${data.discountCodeId || null}, ${data.isAnonymous || false}
            )
            RETURNING id
        `;

        return { success: true, appointmentId: apptResults[0].id };

    } catch (error: any) {
        if (error.digest === 'DYNAMIC_SERVER_USAGE' || (error.message && error.message.includes('Dynamic server usage'))) {
            throw error;
        }
        console.error("Booking error details:", error);
        return { error: `No se pudo crear la reserva: ${error.message || 'Error desconocido'}. Por favor intenta de nuevo.` };
    }
}

export async function confirmAppointmentPayment(appointmentId: string) {
    try {
        await client`
            UPDATE appointments 
            SET status = 'scheduled' 
            WHERE id = ${appointmentId}
        `;

        const results = await client`SELECT oyente_id FROM appointments WHERE id = ${appointmentId} LIMIT 1`;
        if (results[0]) {
            await refreshOyenteStats(results[0].oyente_id);
        }

        revalidatePath("/usuario/dashboard");
        revalidatePath("/oyente/dashboard");
        revalidatePath("/oyente/usuarios");
    } catch (error: any) {
        if (error.digest === 'DYNAMIC_SERVER_USAGE' || (error.message && error.message.includes('Dynamic server usage'))) {
            throw error;
        }
        console.error("Error confirming payment:", error);
    }
}

export async function getUsuarioAppointments(usuarioId: string) {
    const user = await getCurrentUser();
    if (!user || (user.id !== usuarioId && user.role !== 'admin')) {
        throw new Error("No autorizado.");
    }
    const userAppointments = await db.query.appointments.findMany({
        where: eq(appointments.usuarioId, usuarioId),
        orderBy: [desc(appointments.date)],
        with: {
            oyente: true
        }
    });
    return userAppointments;
}
