"use server";

import { client } from "@/db"; // Use raw client
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./auth";

async function ensureOyente(oyenteId?: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("No autorizado");

    if (user.role === 'admin') return user; // Admins skip ownership checks usually

    if (user.role !== 'oyente') {
        throw new Error("Acceso denegado: Se requiere rol de oyente.");
    }

    if (oyenteId) {
        // Verify that this oyente ID belongs to the logged in user
        const result = await client`SELECT id FROM oyentes WHERE user_id = ${user.id} LIMIT 1`;
        if (result.length === 0 || result[0].id !== oyenteId) {
            throw new Error("Acceso denegado: No puedes manipular datos de otro oyente.");
        }
    }

    return user;
}

// Helper to map snake_case DB results to camelCase for frontend compatibility
const mapOyente = (p: any) => p ? ({
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
    activeUsers: p.active_usuarios,
    totalSessions: p.total_sessions,
    totalUsers: p.total_usuarios,
    rating: p.rating,
    tags: p.tags,
    balance: p.balance,
    iban: p.iban,
    payoutName: p.payout_name,
    payoutCountry: p.payout_country,
    studies: p.studies,
    lastLogin: p.last_login,
    completedSessions: p.completed_sessions,
    createdAt: p.created_at,
    refCode: p.ref_code,
    meetingLink: p.meeting_link,
}) : null;

export async function refreshOyenteStats(oyenteId: string) {
    try {
        await client`
            UPDATE oyentes p
            SET 
                total_sessions = (
                    SELECT COUNT(*)::int FROM appointments 
                    WHERE oyente_id = ${oyenteId} AND status IN ('scheduled', 'completed')
                ),
                completed_sessions = (
                    SELECT COUNT(*)::int FROM appointments 
                    WHERE oyente_id = ${oyenteId} AND status = 'completed'
                ),
                active_usuarios = (
                    SELECT COUNT(DISTINCT usuario_id)::int FROM appointments 
                    WHERE oyente_id = ${oyenteId} AND status = 'scheduled'
                ),
                total_usuarios = (
                    SELECT COUNT(DISTINCT usuario_id)::int FROM appointments 
                    WHERE oyente_id = ${oyenteId} AND status IN ('scheduled', 'completed')
                )
            WHERE id = ${oyenteId}
        `;
    } catch (error) {
        console.error("Error refreshing oyente stats:", error);
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

export async function getOyenteStatus(userId: string) {
    try {
        const result = await client`
            SELECT * FROM oyentes WHERE user_id = ${userId} LIMIT 1
        `;

        if (result.length > 0) {
            return mapOyente(result[0]);
        }

        // Self-healing: If user is a oyente but has no profile, create it.
        const userResult = await client`
            SELECT * FROM users WHERE id = ${userId} LIMIT 1
        `;
        const user = userResult[0];

        if (user && (user.role === 'oyente' || user.role === 'admin')) {
            const newPsychResult = await client`
                INSERT INTO oyentes (
                    user_id, full_name, email, specialty, description, price, image, active_usuarios, total_sessions
                ) VALUES (
                    ${user.id}, ${user.full_name || "Oyente"}, ${user.email}, 'General', 'Oyente profesional en Pluravita.', '35.00', '', 0, 0
                )
                RETURNING *
            `;
            return mapOyente(newPsychResult[0]);
        }

        return null;
    } catch (error: any) {
        if (error.digest === 'DYNAMIC_SERVER_USAGE' || (error.message && error.message.includes('Dynamic server usage'))) {
            throw error;
        }
        console.error("Error in getOyenteStatus:", error);
        return null;
    }
}

export async function getOyentes() {
    try {
        const results = await client`SELECT * FROM oyentes`;
        return results.map(mapOyente).filter((p): p is NonNullable<typeof p> => p !== null);
    } catch (error: any) {
        if (error.digest === 'DYNAMIC_SERVER_USAGE' || (error.message && error.message.includes('Dynamic server usage'))) {
            throw error;
        }
        console.error("Error in getOyentes:", error);
        return [];
    }
}

export async function getWithdrawals(oyenteId: string) {
    await ensureOyente(oyenteId);
    try {
        const results = await client`
            SELECT * FROM withdrawals 
            WHERE oyente_id = ${oyenteId}
            ORDER BY created_at DESC
        `;
        return results.map((w: any) => ({
            id: w.id,
            oyenteId: w.oyente_id,
            amount: w.amount,
            status: w.status,
            createdAt: w.created_at
        }));
    } catch (error) {
        return [];
    }
}

export async function updateOyenteSettings(userId: string, data: {
    image?: string;
    tags?: string[];
    description?: string;
    iban?: string;
    payoutName?: string;
    payoutCountry?: string;
    username?: string;
    specialty?: string;
    price?: number | string;
    languages?: string[];
    meetingLink?: string;
    studies?: string;
}) {
    try {
        const user = await ensureOyente();
        if (userId !== user.id && user.role !== 'admin') {
            return { error: "No puedes actualizar el perfil de otro usuario." };
        }

        // Validate username uniqueness if provided
        if (data.username) {
            const existingUsername = await client`
                SELECT id FROM oyentes 
                WHERE username = ${data.username} 
                AND user_id != ${userId}
                LIMIT 1
            `;
            if (existingUsername.length > 0) {
                return { error: "Este nombre de usuario ya está en uso. Por favor elige otro." };
            }
        }

        // Dynamic update query construction
        const updateObj: Record<string, any> = {};

        if (data.image !== undefined) updateObj.image = data.image;
        if (data.tags !== undefined) updateObj.tags = data.tags;
        if (data.description !== undefined) updateObj.description = data.description;
        if (data.iban !== undefined) updateObj.iban = data.iban;
        if (data.payoutName !== undefined) updateObj.payout_name = data.payoutName;
        if (data.payoutCountry !== undefined) updateObj.payout_country = data.payoutCountry;
        if (data.username !== undefined) updateObj.username = data.username;
        if (data.specialty !== undefined) updateObj.specialty = data.specialty;
        if (data.price !== undefined) updateObj.price = data.price;
        if (data.languages !== undefined) updateObj.languages = data.languages;
        if (data.meetingLink !== undefined) updateObj.meeting_link = data.meetingLink;
        if (data.studies !== undefined) updateObj.studies = data.studies;

        // Ensure referral code
        const current = await client`SELECT ref_code FROM oyentes WHERE user_id = ${userId}`;
        if (!current[0]?.ref_code) {
            updateObj.ref_code = crypto.randomUUID();
        }

        if (Object.keys(updateObj).length > 0) {
            await client`
                UPDATE oyentes 
                SET ${client(updateObj)}
                WHERE user_id = ${userId}
            `;
        }

        revalidatePath("/oyente/dashboard");
        revalidatePath("/oyente/balance");
        revalidatePath("/oyente/profile");

        return { success: true };
    } catch (error: any) {
        console.error("Error updating oyente settings:", error);
        return { error: error.message || "Error al actualizar el perfil. Por favor intenta de nuevo." };
    }
}

export async function getUpcomingAppointments(oyenteId: string) {
    await ensureOyente(oyenteId);
    try {
        const results = await client`
            SELECT a.*, 
                   u.id as u_id, u.email as u_email, u.full_name as u_full_name, u.phone as u_phone, u.role as u_role
            FROM appointments a
            LEFT JOIN users u ON a.usuario_id = u.id
            WHERE a.oyente_id = ${oyenteId}
            ORDER BY a.date DESC
        `;

        return results.map((r: any) => ({
            id: r.id,
            oyenteId: r.oyente_id,
            usuarioId: r.usuario_id,
            date: r.date,
            reason: r.reason,
            status: r.status,
            price: r.price,
            discountCodeId: r.discount_code_id,
            oyenteNotas: r.oyente_notas,
            improvementTips: r.improvement_tips,
            rating: r.rating,
            isAnonymous: r.is_anonymous,
            createdAt: r.created_at,
            usuario: r.u_id ? {
                id: r.u_id,
                email: r.is_anonymous ? "Anónimo (Privado)" : r.u_email,
                fullName: r.usuario_nombre || r.u_full_name,
                phone: r.is_anonymous ? "-" : r.u_phone,
                role: r.u_role
            } : null
        }));
    } catch (error: any) {
        if (error.digest === 'DYNAMIC_SERVER_USAGE' || (error.message && error.message.includes('Dynamic server usage'))) {
            throw error;
        }
        console.error("Error getUpcomingAppointments optimized:", error);
        return [];
    }
}

export async function getOyenteUsuarios(oyenteId: string) {
    await ensureOyente(oyenteId);
    try {
        const results = await client`
            SELECT a.*, u.full_name, u.email, u.phone, u.role, u.has_completed_affinity
            FROM appointments a
            LEFT JOIN users u ON a.usuario_id = u.id
            WHERE a.oyente_id = ${oyenteId}
            ORDER BY a.date DESC
        `;

        const uniqueUsersMap = new Map();

        for (const app of results) {
            if (!app.usuario_id) continue;

            const existing = uniqueUsersMap.get(app.usuario_id);
            const appDate = new Date(app.date);

            let nextAppId = existing?.nextAppointmentId;
            const now = new Date();

            if (app.status === 'scheduled' && appDate >= now) {
                if (!nextAppId || (existing?.nextAppDate && appDate < existing.nextAppDate)) {
                    nextAppId = app.id;
                }
            }

            if (!existing) {
                uniqueUsersMap.set(app.usuario_id, {
                    id: app.usuario_id,
                    fullName: app.is_anonymous ? (app.usuario_nombre || "Usuario Anónimo") : app.full_name,
                    email: app.is_anonymous ? "Privado" : app.email,
                    phone: app.is_anonymous ? "-" : app.phone,
                    lastSession: appDate,
                    reason: app.reason,
                    status: app.status === 'completed' ? 'Activo' : 'En pausa',
                    nextAppointmentId: nextAppId,
                    nextAppDate: app.status === 'scheduled' && appDate >= now ? appDate : null,
                    isAnonymous: app.is_anonymous,
                    hasCompletedAffinity: app.has_completed_affinity
                });
            } else {
                if (appDate > existing.lastSession) {
                    existing.lastSession = appDate;
                    existing.reason = app.reason || existing.reason;
                    existing.fullName = app.is_anonymous ? (app.usuario_nombre || "Usuario Anónimo") : app.full_name;
                    existing.email = app.is_anonymous ? "Privado" : app.email;
                    existing.phone = app.is_anonymous ? "-" : app.phone;
                    existing.isAnonymous = app.is_anonymous;
                }
                if (nextAppId) {
                    existing.nextAppointmentId = nextAppId;
                    existing.nextAppDate = app.status === 'scheduled' && appDate >= now ? appDate : existing.nextAppDate;
                }
                if (app.status === 'completed') existing.status = 'Activo';

                uniqueUsersMap.set(app.usuario_id, existing);
            }
        }

        return Array.from(uniqueUsersMap.values());
    } catch (e: any) {
        if (e.digest === 'DYNAMIC_SERVER_USAGE' || (e.message && e.message.includes('Dynamic server usage'))) {
            throw e;
        }
        console.error("Error in getOyenteUsuarios:", e);
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

export async function withdrawBalance(oyenteId: string, amount: number) {
    await ensureOyente(oyenteId);
    const psychResult = await client`
        SELECT * FROM oyentes WHERE id = ${oyenteId} LIMIT 1
    `;
    const psych = psychResult[0];

    if (!psych || Number(psych.balance) < 50 || Number(psych.balance) < amount) {
        return { error: "Saldo insuficiente (mínimo 50€)" };
    }

    await client`
        INSERT INTO withdrawals (oyente_id, amount, status)
        VALUES (${oyenteId}, ${amount.toString()}, 'pending')
    `;

    const newBalance = (Number(psych.balance) - amount).toString();
    await client`
        UPDATE oyentes SET balance = ${newBalance} WHERE id = ${oyenteId}
    `;

    try {
        await client`
            INSERT INTO admin_notifications (title, message, type, link)
            VALUES (
                'Solicitud de Retiro',
                ${`El oyente ${psych.full_name} ha solicitado un retiro de ${amount}€.`},
                'withdrawal',
                '/admin/withdrawals'
            )
        `;
    } catch (e) {
        console.error("Error creating admin notification:", e);
    }

    revalidatePath("/oyente/dashboard");
    revalidatePath("/oyente/balance");
    return { success: true };
}

export async function getRecentConsultations(oyenteId: string) {
    await ensureOyente(oyenteId);
    try {
        const results = await client`
            SELECT a.*, u.full_name as u_full_name, u.email as u_email 
            FROM appointments a
            LEFT JOIN users u ON a.usuario_id = u.id
            WHERE a.oyente_id = ${oyenteId}
            AND a.status = 'completed'
            ORDER BY a.date DESC
            LIMIT 5
        `;

        return results.map((r: any) => ({
            id: r.id,
            usuarioId: r.usuario_id,
            date: r.date,
            reason: r.reason,
            status: r.status,
            usuario: {
                fullName: r.is_anonymous ? (r.usuario_nombre || "Usuario Anónimo") : r.u_full_name,
                email: r.is_anonymous ? "Privado" : r.u_email
            }
        }));
    } catch (error: any) {
        if (error.digest === 'DYNAMIC_SERVER_USAGE' || (error.message && error.message.includes('Dynamic server usage'))) {
            throw error;
        }
        console.error("Error getting recent consultations optimized:", error);
        return [];
    }
}

export async function getWeeklyAppointments(oyenteId: string) {
    await ensureOyente(oyenteId);
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
            LEFT JOIN users u ON a.usuario_id = u.id
            WHERE a.oyente_id = ${oyenteId}
            AND a.date >= ${startOfWeek.toISOString()}
            AND a.date <= ${endOfWeek.toISOString()}
            AND a.status != 'cancelled'
            ORDER BY a.date ASC
        `;

        return results.map((r: any) => ({
            id: r.id,
            oyenteId: r.oyente_id,
            usuarioId: r.usuario_id,
            date: r.date,
            reason: r.reason,
            status: r.status,
            price: r.price,
            isAnonymous: r.is_anonymous,
            usuario: r.u_id ? {
                id: r.u_id,
                email: r.is_anonymous ? "Anónimo (Privado)" : r.u_email,
                fullName: r.usuario_nombre || r.u_full_name,
            } : null
        }));
    } catch (error: any) {
        if (error.digest === 'DYNAMIC_SERVER_USAGE' || (error.message && error.message.includes('Dynamic server usage'))) {
            throw error;
        }
        console.error("Error getting weekly appointments:", error);
        return [];
    }
}

export async function getWeeklyAppointmentsCount(oyenteId: string) {
    await ensureOyente(oyenteId);
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
            WHERE oyente_id = ${oyenteId}
            AND date >= ${startOfWeek.toISOString()}
            AND date <= ${endOfWeek.toISOString()}
        `;

        return Number(result[0]?.count || 0);
    } catch (error: any) {
        if (error.digest === 'DYNAMIC_SERVER_USAGE' || (error.message && error.message.includes('Dynamic server usage'))) {
            throw error;
        }
        console.error("Error getting weekly stats:", error);
        return 0;
    }
}

export async function cancelAppointmentByOyente(appointmentId: string, oyenteId: string) {
    await ensureOyente(oyenteId);
    try {
        const apptResult = await client`
            SELECT * FROM appointments 
            WHERE id = ${appointmentId} AND oyente_id = ${oyenteId}
            LIMIT 1
        `;
        const appointment = apptResult[0];

        if (!appointment) return { error: "Cita no encontrada." };
        if (appointment.status === 'cancelled') return { error: "La cita ya está cancelada." };
        if (appointment.status === 'completed') return { error: "No puedes cancelar una cita ya completada." };

        await client`
            UPDATE appointments 
            SET 
                status = 'cancelled',
                oyente_notas = ${appointment.oyente_notas ? appointment.oyente_notas + "\n[CANCELADA POR OYENTE - PENALIZACIÓN APLICADA]" : "[CANCELADA POR OYENTE - PENALIZACIÓN APLICADA]"}
            WHERE id = ${appointmentId}
        `;

        await client`
            UPDATE availability_slots
            SET is_booked = false
            WHERE oyente_id = ${oyenteId}
            AND start_time = ${new Date(appointment.date).toISOString()}
        `;

        revalidatePath("/oyente/dashboard");
        revalidatePath("/oyente/calendar");
        revalidatePath("/oyente/usuarios");

        return { success: "Cita cancelada. Se ha emitido un reembolso completo al usuario." };
    } catch (error) {
        console.error("Error cancelling appointment:", error);
        return { error: "Error al cancelar la cita." };
    }
}

export async function completeAppointment(data: { id: string, notes: string, tips: string }) {
    const user = await ensureOyente();
    try {
        const apptResultBefore = await client`SELECT * FROM appointments WHERE id = ${data.id}`;
        const apptBefore = apptResultBefore[0];

        if (!apptBefore) return { error: "Cita no encontrada" };
        if (apptBefore.status === 'completed') return { error: "La cita ya está completada" };

        const psychResult = await client`SELECT id FROM oyentes WHERE user_id = ${user.id} LIMIT 1`;
        if (user.role !== 'admin' && apptBefore.oyente_id !== psychResult[0]?.id) {
            return { error: "No autorizado: Esta cita no te pertenece." };
        }

        await client`
            UPDATE appointments 
            SET 
                status = 'completed',
                oyente_notas = ${data.notes},
                improvement_tips = ${data.tips}
            WHERE id = ${data.id}
        `;

        await client`
            UPDATE oyentes 
            SET 
                balance = balance + ${apptBefore.price || '35.00'}
            WHERE id = ${apptBefore.oyente_id}
        `;

        await refreshOyenteStats(apptBefore.oyente_id);

        revalidatePath("/oyente/dashboard");
        revalidatePath("/usuario/dashboard");

        return { success: true };
    } catch (error) {
        console.error("Error completing appointment:", error);
        return { error: "Error al completar la cita" };
    }
}

export async function updateAppointmentMeetingLink(appointmentId: string, meetingLink: string) {
    try {
        const user = await ensureOyente();

        const appt = await client`
            SELECT a.id FROM appointments a
            JOIN oyentes p ON a.oyente_id = p.id
            WHERE a.id = ${appointmentId} AND p.user_id = ${user.id}
            LIMIT 1
        `;

        if (appt.length === 0) {
            return { error: "Cita no encontrada o no autorizada" };
        }

        await client`
            UPDATE appointments
            SET meeting_link = ${meetingLink}
            WHERE id = ${appointmentId}
        `;

        revalidatePath(`/oyente/appointments/${appointmentId}`);
        revalidatePath("/oyente/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error updating meeting link:", error);
        return { error: "Error al actualizar el link de la reunión" };
    }
}
