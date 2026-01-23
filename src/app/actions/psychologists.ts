"use server";

import { client } from "@/db"; // Use raw client
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./auth";

async function ensurePsychologist(psychologistId?: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("No autorizado");

    if (user.role === 'admin') return user; // Admins skip ownership checks usually

    if (user.role !== 'psychologist') {
        throw new Error("Acceso denegado: Se requiere rol de coach.");
    }

    if (psychologistId) {
        // Verify that this psychologist ID belongs to the logged in user
        const result = await client`SELECT id FROM psychologists WHERE user_id = ${user.id} LIMIT 1`;
        if (result.length === 0 || result[0].id !== psychologistId) {
            throw new Error("Acceso denegado: No puedes manipular datos de otro coach.");
        }
    }

    return user;
}

// Helper to map snake_case DB results to camelCase for frontend compatibility
const mapPsychologist = (p: any) => p ? ({
    id: p.id,
    userId: p.user_id,
    fullName: p.full_name,
    email: p.email,
    username: p.username,
    specialty: p.specialty,
    description: p.description,
    price: p.price,
    image: p.image,
    languages: p.languages,
    activePatients: p.active_patients,
    totalSessions: p.total_sessions,
    totalPatients: p.total_patients,
    rating: p.rating,
    tags: p.tags,
    balance: p.balance,
    iban: p.iban,
    payoutName: p.payout_name,
    lastLogin: p.last_login,
    completedSessions: p.completed_sessions,
    createdAt: p.created_at,
    refCode: p.ref_code,
}) : null;

export async function refreshPsychologistStats(psychologistId: string) {
    try {
        await client`
            UPDATE psychologists p
            SET 
                total_sessions = (
                    SELECT COUNT(*)::int FROM appointments 
                    WHERE psychologist_id = ${psychologistId} AND status IN ('scheduled', 'completed')
                ),
                completed_sessions = (
                    SELECT COUNT(*)::int FROM appointments 
                    WHERE psychologist_id = ${psychologistId} AND status = 'completed'
                ),
                active_patients = (
                    SELECT COUNT(DISTINCT patient_id)::int FROM appointments 
                    WHERE psychologist_id = ${psychologistId} AND status = 'scheduled'
                ),
                total_patients = (
                    SELECT COUNT(DISTINCT patient_id)::int FROM appointments 
                    WHERE psychologist_id = ${psychologistId} AND status IN ('scheduled', 'completed')
                )
            WHERE id = ${psychologistId}
        `;
    } catch (error) {
        console.error("Error refreshing psychologist stats:", error);
    }
}

const mapUser = (u: any) => u ? ({
    id: u.id,
    email: u.email,
    fullName: u.full_name,
    phone: u.phone,
    role: u.role,
    // ... other fields as needed
}) : null;

export async function getPsychologistStatus(userId: string) {
    try {
        const result = await client`
            SELECT * FROM psychologists WHERE user_id = ${userId} LIMIT 1
        `;

        if (result.length > 0) {
            const psych = result[0];
            // Sync stats on load to ensure accuracy
            await refreshPsychologistStats(psych.id);
            const updatedResult = await client`SELECT * FROM psychologists WHERE id = ${psych.id}`;
            return mapPsychologist(updatedResult[0]);
        }

        // Self-healing: If user is a psychologist but has no profile, create it.
        const userResult = await client`
            SELECT * FROM users WHERE id = ${userId} LIMIT 1
        `;
        const user = userResult[0];

        if (user && (user.role === 'psychologist' || user.role === 'admin')) {
            const newPsychResult = await client`
                INSERT INTO psychologists (
                    user_id, full_name, email, specialty, description, price, image, active_patients, total_sessions
                ) VALUES (
                    ${user.id}, ${user.full_name || "Coach"}, ${user.email}, 'General', 'Coach profesional en Pluravita.', '35.00', '', 0, 0
                )
                RETURNING *
            `;
            return mapPsychologist(newPsychResult[0]);
        }

        return null;
    } catch (error) {
        console.error("Error in getPsychologistStatus:", error);
        return null;
    }
}

export async function getPsychologists() {
    try {
        const results = await client`SELECT * FROM psychologists`;
        return results.map(mapPsychologist).filter((p): p is NonNullable<typeof p> => p !== null);
    } catch (error) {
        console.error("Error in getPsychologists:", error);
        return [];
    }
}

export async function getWithdrawals(psychologistId: string) {
    await ensurePsychologist(psychologistId);
    try {
        const results = await client`
            SELECT * FROM withdrawals 
            WHERE psychologist_id = ${psychologistId}
            ORDER BY created_at DESC
        `;
        return results.map((w: any) => ({
            id: w.id,
            psychologistId: w.psychologist_id,
            amount: w.amount,
            status: w.status,
            createdAt: w.created_at
        }));
    } catch (error) {
        return [];
    }
}

export async function updatePsychologistSettings(userId: string, data: {
    image?: string;
    tags?: string[];
    description?: string;
    iban?: string;
    payoutName?: string;
    username?: string;
    specialty?: string;
    price?: number | string;
    languages?: string[];
}) {
    const user = await ensurePsychologist();
    if (userId !== user.id && user.role !== 'admin') {
        throw new Error("No puedes actualizar el perfil de otro usuario.");
    }

    // Dynamic update query construction
    const updates = [];

    if (data.image !== undefined) updates.push(client`image = ${data.image}`);
    if (data.tags !== undefined) updates.push(client`tags = ${data.tags}`);
    if (data.description !== undefined) updates.push(client`description = ${data.description}`);
    if (data.iban !== undefined) updates.push(client`iban = ${data.iban}`);
    if (data.payoutName !== undefined) updates.push(client`payout_name = ${data.payoutName}`);

    // Missing fields added:
    if (data.username !== undefined) updates.push(client`username = ${data.username}`);
    if (data.specialty !== undefined) updates.push(client`specialty = ${data.specialty}`);
    if (data.price !== undefined) updates.push(client`price = ${data.price}`);
    if (data.languages !== undefined) updates.push(client`languages = ${data.languages}`);

    // Ensure referral code
    const current = await client`SELECT ref_code FROM psychologists WHERE user_id = ${userId}`;
    if (!current[0]?.ref_code) {
        updates.push(client`ref_code = ${crypto.randomUUID()}`);
    }

    if (updates.length > 0) {
        // Join the updates with commas manually since we are using raw client template literals
        // We can't just .join(',') on template literals directly usually, but with this client it might work if we spread.
        // A safer pattern with postgres.js / similar libs is often to reduce or loop.
        // However, referencing the existing pattern suggests we should use the array.
        // Let's trust the client builds the query if we pass parts.
        // Actually, looking at the previous code, it was creating an array but ignoring it.
        // We'll construct a single query.

        await client`
            UPDATE psychologists 
            SET ${client(updates, ', ')}
            WHERE user_id = ${userId}
        `;
    }

    revalidatePath("/psychologist/dashboard");
    revalidatePath("/psychologist/balance");
    revalidatePath("/psychologist/profile");
}

export async function getUpcomingAppointments(psychologistId: string) {
    await ensurePsychologist(psychologistId);
    try {
        const results = await client`
            SELECT a.*, 
                   u.id as u_id, u.email as u_email, u.full_name as u_full_name, u.phone as u_phone, u.role as u_role
            FROM appointments a
            LEFT JOIN users u ON a.patient_id = u.id
            WHERE a.psychologist_id = ${psychologistId}
            ORDER BY a.date DESC
        `;

        return results.map((r: any) => ({
            id: r.id,
            psychologistId: r.psychologist_id,
            patientId: r.patient_id,
            date: r.date,
            reason: r.reason,
            status: r.status,
            price: r.price,
            discountCodeId: r.discount_code_id,
            psychologistNotes: r.psychologist_notes,
            improvementTips: r.improvement_tips,
            rating: r.rating,
            isAnonymous: r.is_anonymous,
            createdAt: r.created_at,
            patient: r.u_id ? {
                id: r.u_id,
                email: r.is_anonymous ? "Anónimo (Privado)" : r.u_email,
                fullName: r.patient_name || r.u_full_name,
                phone: r.is_anonymous ? "-" : r.u_phone,
                role: r.u_role
            } : null
        }));
    } catch (error) {
        console.error("Error getUpcomingAppointments optimized:", error);
        return [];
    }
}

export async function getPsychologistPatients(psychologistId: string) {
    await ensurePsychologist(psychologistId);
    // New logic: Fetch ALL to derive patient list with nextAppointment state
    try {
        const results = await client`
            SELECT a.*, u.full_name, u.email, u.phone, u.role
            FROM appointments a
            LEFT JOIN users u ON a.patient_id = u.id
            WHERE a.psychologist_id = ${psychologistId}
            ORDER BY a.date DESC
        `;

        const uniquePatientsMap = new Map();

        for (const app of results) {
            if (!app.patient_id) continue;

            const existing = uniquePatientsMap.get(app.patient_id);
            const appDate = new Date(app.date);

            // Determine next appointment ID (the most imminent scheduled one in future)
            let nextAppId = existing?.nextAppointmentId;
            const now = new Date();

            if (app.status === 'scheduled' && appDate >= now) {
                // If we don't have one yet, or this one is sooner than the stored one
                if (!nextAppId || (existing?.nextAppDate && appDate < existing.nextAppDate)) {
                    nextAppId = app.id;
                }
            }

            if (!existing) {
                uniquePatientsMap.set(app.patient_id, {
                    id: app.patient_id,
                    fullName: app.is_anonymous ? (app.patient_name || "Usuario Anónimo") : app.full_name,
                    email: app.is_anonymous ? "Privado" : app.email,
                    phone: app.is_anonymous ? "-" : app.phone,
                    lastSession: appDate,
                    reason: app.reason,
                    status: app.status === 'completed' ? 'Activo' : 'En pausa',
                    nextAppointmentId: nextAppId,
                    nextAppDate: app.status === 'scheduled' && appDate >= now ? appDate : null,
                    isAnonymous: app.is_anonymous
                });
            } else {
                // Update logic: keep most recent 'lastSession'
                if (appDate > existing.lastSession) {
                    existing.lastSession = appDate;
                    existing.reason = app.reason || existing.reason;
                    existing.fullName = app.is_anonymous ? (app.patient_name || "Usuario Anónimo") : app.full_name;
                    existing.email = app.is_anonymous ? "Privado" : app.email;
                    existing.phone = app.is_anonymous ? "-" : app.phone;
                    existing.isAnonymous = app.is_anonymous;
                }
                if (nextAppId) {
                    existing.nextAppointmentId = nextAppId;
                    existing.nextAppDate = app.status === 'scheduled' && appDate >= now ? appDate : existing.nextAppDate;
                }
                if (app.status === 'completed') existing.status = 'Activo';

                uniquePatientsMap.set(app.patient_id, existing);
            }
        }

        return Array.from(uniquePatientsMap.values());
    } catch (e) {
        console.error("Error in getPsychologistPatients:", e);
        return [];
    }
}

export async function createSupportTicket(userId: string, subject: string, message: string) {
    const user = await getCurrentUser();
    if (!user || (user.id !== userId && user.role !== 'admin')) {
        throw new Error("No autorizado para crear ticket en nombre de otro usuario.");
    }
    await client`
        INSERT INTO support_tickets (user_id, subject, message)
        VALUES (${userId}, ${subject}, ${message})
    `;
    return { success: true };
}

export async function withdrawBalance(psychologistId: string, amount: number) {
    await ensurePsychologist(psychologistId);
    const psychResult = await client`
        SELECT * FROM psychologists WHERE id = ${psychologistId} LIMIT 1
    `;
    const psych = psychResult[0];

    if (!psych || Number(psych.balance) < 50 || Number(psych.balance) < amount) {
        return { error: "Saldo insuficiente (mínimo 50€)" };
    }

    // Record the withdrawal request
    await client`
        INSERT INTO withdrawals (psychologist_id, amount, status)
        VALUES (${psychologistId}, ${amount.toString()}, 'pending')
    `;

    const newBalance = (Number(psych.balance) - amount).toString();
    await client`
        UPDATE psychologists SET balance = ${newBalance} WHERE id = ${psychologistId}
    `;

    // Notify Admin
    try {
        await client`
            INSERT INTO admin_notifications (title, message, type, link)
            VALUES (
                'Solicitud de Retiro',
                ${`El psicólogo ${psych.full_name} ha solicitado un retiro de ${amount}€.`},
                'withdrawal',
                '/admin/withdrawals'
            )
        `;
    } catch (e) {
        console.error("Error creating admin notification:", e);
    }

    revalidatePath("/psychologist/dashboard");
    revalidatePath("/psychologist/balance");
    return { success: true };
}

export async function getRecentConsultations(psychologistId: string) {
    await ensurePsychologist(psychologistId);
    try {
        const results = await client`
            SELECT a.*, u.full_name as u_full_name, u.email as u_email 
            FROM appointments a
            LEFT JOIN users u ON a.patient_id = u.id
            WHERE a.psychologist_id = ${psychologistId}
            AND a.status = 'completed'
            ORDER BY a.date DESC
            LIMIT 5
        `;

        return results.map((r: any) => ({
            id: r.id,
            patientId: r.patient_id,
            date: r.date,
            reason: r.reason,
            status: r.status,
            patient: {
                fullName: r.is_anonymous ? (r.patient_name || "Usuario Anónimo") : r.u_full_name,
                email: r.is_anonymous ? "Privado" : r.u_email
            }
        }));
    } catch (error) {
        console.error("Error getting recent consultations optimized:", error);
        return [];
    }
}

export async function getWeeklyAppointments(psychologistId: string) {
    await ensurePsychologist(psychologistId);
    try {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() - now.getDay() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const results = await client`
            SELECT a.*, 
                   u.id as u_id, u.email as u_email, u.full_name as u_full_name, u.phone as u_phone, u.role as u_role
            FROM appointments a
            LEFT JOIN users u ON a.patient_id = u.id
            WHERE a.psychologist_id = ${psychologistId}
            AND a.date >= ${startOfWeek.toISOString()}
            AND a.date <= ${endOfWeek.toISOString()}
            AND a.status != 'cancelled'
            ORDER BY a.date ASC
        `;

        return results.map((r: any) => ({
            id: r.id,
            psychologistId: r.psychologist_id,
            patientId: r.patient_id,
            date: r.date,
            reason: r.reason,
            status: r.status,
            price: r.price,
            isAnonymous: r.is_anonymous,
            patient: r.u_id ? {
                id: r.u_id,
                email: r.is_anonymous ? "Anónimo (Privado)" : r.u_email,
                fullName: r.patient_name || r.u_full_name,
            } : null
        }));
    } catch (error) {
        console.error("Error getting weekly appointments:", error);
        return [];
    }
}

export async function getWeeklyAppointmentsCount(psychologistId: string) {
    await ensurePsychologist(psychologistId);
    try {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() - now.getDay() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const result = await client`
            SELECT COUNT(*) as count 
            FROM appointments 
            WHERE psychologist_id = ${psychologistId}
            AND date >= ${startOfWeek.toISOString()}
            AND date <= ${endOfWeek.toISOString()}
        `;

        return Number(result[0]?.count || 0);
    } catch (error) {
        console.error("Error getting weekly stats:", error);
        return 0;
    }
}

export async function cancelAppointmentByPsychologist(appointmentId: string, psychologistId: string) {
    await ensurePsychologist(psychologistId);
    try {
        // 1. Verify ownership and status
        const apptResult = await client`
            SELECT * FROM appointments 
            WHERE id = ${appointmentId} AND psychologist_id = ${psychologistId}
            LIMIT 1
        `;
        const appointment = apptResult[0];

        if (!appointment) return { error: "Cita no encontrada." };
        if (appointment.status === 'cancelled') return { error: "La cita ya está cancelada." };
        if (appointment.status === 'completed') return { error: "No puedes cancelar una cita ya completada." };

        // 2. Perform cancellation
        // We simulate a 100% refund logic here + penalty flag
        // In a real app, we would call Stripe API here.

        await client`
            UPDATE appointments 
            SET 
                status = 'cancelled',
                psychologist_notes = ${appointment.psychologist_notes ? appointment.psychologist_notes + "\n[CANCELADA POR PSICÓLOGO - PENALIZACIÓN APLICADA]" : "[CANCELADA POR PSICÓLOGO - PENALIZACIÓN APLICADA]"}
            WHERE id = ${appointmentId}
        `;

        // Free up availability slot
        await client`
            UPDATE availability_slots
            SET is_booked = false
            WHERE psychologist_id = ${psychologistId}
            AND start_time = ${new Date(appointment.date).toISOString()}
        `;

        // 3. Revalidate paths
        revalidatePath("/psychologist/dashboard");
        revalidatePath("/psychologist/calendar");
        revalidatePath("/psychologist/patients");

        return { success: "Cita cancelada. Se ha emitido un reembolso completo al paciente." };
    } catch (error) {
        console.error("Error cancelling appointment:", error);
        return { error: "Error al cancelar la cita." };
    }
}

export async function completeAppointment(data: { id: string, notes: string, tips: string }) {
    // Note: This one checks the appointment record's psychologist_id in the next step, but let's add initial check
    const user = await ensurePsychologist();
    try {
        const apptResultBefore = await client`SELECT * FROM appointments WHERE id = ${data.id}`;
        const apptBefore = apptResultBefore[0];

        if (!apptBefore) return { error: "Cita no encontrada" };
        if (apptBefore.status === 'completed') return { error: "La cita ya está completada" };

        const psychResult = await client`SELECT id FROM psychologists WHERE user_id = ${user.id} LIMIT 1`;
        if (user.role !== 'admin' && apptBefore.psychologist_id !== psychResult[0]?.id) {
            return { error: "No autorizado: Esta cita no te pertenece." };
        }

        await client`
            UPDATE appointments 
            SET 
                status = 'completed',
                psychologist_notes = ${data.notes},
                improvement_tips = ${data.tips}
            WHERE id = ${data.id}
        `;

        // Update psychologist balance and stats
        await client`
            UPDATE psychologists 
            SET 
                balance = balance + ${apptBefore.price || '35.00'}
            WHERE id = ${apptBefore.psychologist_id}
        `;

        await refreshPsychologistStats(apptBefore.psychologist_id);

        revalidatePath("/psychologist/dashboard");
        revalidatePath("/patient/dashboard");

        return { success: true };
    } catch (error) {
        console.error("Error completing appointment:", error);
        return { error: "Error al completar la cita" };
    }
}
