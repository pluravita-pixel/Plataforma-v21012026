"use server";

import { db, client } from "@/db"; // Use drizzle db and raw client
import { appointments, oyentes } from "@/db/schema";
import { eq, and, gte, asc } from "drizzle-orm";
import { getCurrentUser } from "./auth";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function getUsuarioDashboardData() {
    try {
        const user = await getCurrentUser();
        if (!user) return null;

        // Fetch data in parallel to reduce total roundtrip time
        const [nextApptResults, coachesResults] = await Promise.all([
            client`
                SELECT a.*, 
                       p.id as p_id, p.user_id as p_user_id, p.full_name as p_full_name, p.email as p_email,
                       p.total_sessions as p_total_sessions, p.total_usuarios as p_total_usuarios,
                       p.active_usuarios as p_active_usuarios, p.rating as p_rating,
                       p.specialty as p_specialty, p.image as p_image, p.price as p_price
                FROM appointments a
                LEFT JOIN oyentes p ON a.oyente_id = p.id
                WHERE a.usuario_id = ${user.id}
                AND a.status = 'scheduled'
                AND a.date >= ${new Date().toISOString()}
                ORDER BY a.date ASC
                LIMIT 1
            `,
            client`
                SELECT * FROM oyentes 
                ORDER BY rating DESC 
                LIMIT 3
            `
        ]);

        const nextAppt = nextApptResults[0] ? {
            ...nextApptResults[0],
            oyente: {
                id: nextApptResults[0].p_id,
                fullName: nextApptResults[0].p_full_name,
                specialty: nextApptResults[0].p_specialty,
                rating: nextApptResults[0].p_rating,
                image: nextApptResults[0].p_image,
            }
        } : null;

        const oyentesList = coachesResults.map((p: any) => ({
            id: p.id,
            fullName: p.full_name,
            rating: p.rating,
            specialty: p.specialty,
            price: p.price,
            image: p.image
        }));

        return {
            user,
            nextAppointment: nextAppt,
            recommendedListeners: oyentesList
        };
    } catch (error: any) {
        if (error.digest === 'DYNAMIC_SERVER_USAGE' || (error.message && error.message.includes('Dynamic server usage'))) {
            throw error;
        }
        console.error("Error in getUsuarioDashboardData:", error);
        return null;
    }
}

export async function getCompletedSessions() {
    const user = await getCurrentUser();
    if (!user) return [];

    try {
        const sessions = await client`
            SELECT a.*, 
                   p.id as p_id, p.user_id as p_user_id, p.full_name as p_full_name, p.email as p_email,
                   p.total_sessions as p_total_sessions, p.total_usuarios as p_total_usuarios,
                   p.active_usuarios as p_active_usuarios, p.rating as p_rating,
                   p.specialty as p_specialty,
                   p.image as p_image, p.description as p_description, p.price as p_price, p.tags as p_tags
            FROM appointments a
            LEFT JOIN oyentes p ON a.oyente_id = p.id
            WHERE a.usuario_id = ${user.id} 
            AND a.status = 'completed'
            ORDER BY a.date DESC
        `;

        return sessions.map((s: any) => ({
            id: s.id,
            usuarioId: s.usuario_id,
            oyenteId: s.oyente_id,
            date: s.date,
            reason: s.reason,
            status: s.status,
            price: s.price,
            discountCodeId: s.discount_code_id,
            oyenteNotas: s.oyente_notas,
            improvementTips: s.improvement_tips,
            rating: s.rating,
            createdAt: s.created_at,
            oyente: s.p_id ? {
                id: s.p_id,
                userId: s.p_user_id,
                fullName: s.p_full_name,
                email: s.p_email,
                totalSessions: s.p_total_sessions,
                totalUsers: s.p_total_usuarios,
                activeUsers: s.p_active_usuarios,
                rating: s.p_rating,
                specialty: s.p_specialty,
                image: s.p_image,
                description: s.p_description,
                price: s.p_price,
                tags: s.p_tags,
            } : null
        }));
    } catch (error) {
        console.error("Error in getCompletedSessions optimized:", error);
        return [];
    }
}

export async function cancelAppointment(appointmentId: string) {
    const user = await getCurrentUser();
    if (!user) {
        return { error: "No autenticado" };
    }

    try {
        const appointmentResult = await client`
            SELECT * FROM appointments 
            WHERE id = ${appointmentId} 
            AND usuario_id = ${user.id}
            LIMIT 1
        `;

        const appointment = appointmentResult[0];

        if (!appointment) {
            return { error: "Cita no encontrada" };
        }

        if (appointment.status !== "scheduled") {
            return { error: "Esta cita no puede ser cancelada" };
        }

        await client`
            UPDATE appointments 
            SET status = 'cancelled' 
            WHERE id = ${appointmentId}
        `;

        await client`
            UPDATE availability_slots
            SET is_booked = false
            WHERE oyente_id = ${appointment.oyente_id}
            AND start_time = ${new Date(appointment.date).toISOString()}
        `;

        const isPriorityUser = user.email === 'sanmiguelgil1@gmail.com';

        if (isPriorityUser) {
            return {
                success: true,
                message: "Cita cancelada. Sin penalización (Usuario Prioritario). Puedes reservar otra cita inmediatamente."
            };
        }

        return {
            success: true,
            message: "Cita cancelada. Se procesará un reembolso del 50%."
        };
    } catch (error) {
        console.error("Error canceling appointment:", error);
        return { error: "Error al cancelar la cita" };
    }
}

export async function getAllUserAppointments() {
    const user = await getCurrentUser();
    if (!user) return [];

    try {
        const appointmentsArr = await client`
            SELECT a.*, 
                   p.id as p_id, p.user_id as p_user_id, p.full_name as p_full_name, p.email as p_email,
                   p.total_sessions as p_total_sessions, p.total_usuarios as p_total_usuarios,
                   p.active_usuarios as p_active_usuarios, p.rating as p_rating,
                   p.specialty as p_specialty,
                   p.image as p_image, p.description as p_description, p.price as p_price, p.tags as p_tags
            FROM appointments a
            LEFT JOIN oyentes p ON a.oyente_id = p.id
            WHERE a.usuario_id = ${user.id} 
            AND a.status = 'scheduled'
            ORDER BY a.date ASC
        `;

        const enriched = await Promise.all(appointmentsArr.map(async (appt: any) => {
            const files = await getSessionFiles(appt.id);
            return {
                id: appt.id,
                usuarioId: appt.usuario_id,
                oyenteId: appt.oyente_id,
                date: appt.date,
                reason: appt.reason,
                status: appt.status,
                price: appt.price,
                discountCodeId: appt.discount_code_id,
                oyenteNotas: appt.oyente_notas,
                improvementTips: appt.improvement_tips,
                rating: appt.rating,
                createdAt: appt.created_at,
                oyente: appt.p_id ? {
                    id: appt.p_id,
                    userId: appt.p_user_id,
                    fullName: appt.p_full_name,
                    email: appt.p_email,
                    totalSessions: appt.p_total_sessions,
                    totalUsers: appt.p_total_usuarios,
                    activeUsers: appt.p_active_usuarios,
                    rating: appt.p_rating,
                    specialty: appt.p_specialty,
                    image: appt.p_image,
                    description: appt.p_description,
                    price: appt.p_price,
                    tags: appt.p_tags,
                } : null,
                files
            };
        }));

        return enriched;
    } catch (error) {
        console.error("Error in getAllUserAppointments optimized:", error);
        return [];
    }
}

export async function updateUsuarioProfile(data: { fullName?: string; phone?: string; email?: string }) {
    const user = await getCurrentUser();
    if (!user) {
        return { error: "No autenticado" };
    }

    try {
        let emailUpdateMessage = "";

        if (data.email && data.email.trim().toLowerCase() !== user.email.toLowerCase()) {
            const cookieStore = await cookies();
            const sessionId = cookieStore.get("session_id")?.value;

            if (sessionId) {
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    {
                        global: {
                            headers: {
                                Authorization: `Bearer ${sessionId}`,
                            },
                        },
                    }
                );

                const { error: authError } = await supabase.auth.updateUser({ email: data.email });

                if (authError) {
                    console.error("Error updating auth email:", authError);
                    return { error: "Error al actualizar el email: " + authError.message };
                }

                emailUpdateMessage = " Se ha enviado un enlace de confirmación a tu nuevo correo.";
            }
        }

        await client`
            UPDATE users 
            SET 
                full_name = COALESCE(${data.fullName || null}, full_name),
                phone = COALESCE(${data.phone || null}, phone),
                email = COALESCE(${data.email || null}, email)
            WHERE id = ${user.id}
        `;

        return { success: true, message: "Perfil actualizado correctamente." + emailUpdateMessage };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { error: "Error al actualizar el perfil" };
    }
}

export async function getSessionFiles(appointmentId: string) {
    const user = await getCurrentUser();
    if (!user) return [];

    try {
        const results = await client`
            SELECT f.*, 
                   u.id as u_id, u.email as u_email, u.full_name as u_full_name, u.phone as u_phone, u.role as u_role
            FROM session_files f
            JOIN appointments a ON f.appointment_id = a.id
            LEFT JOIN users u ON f.uploader_id = u.id
            WHERE f.appointment_id = ${appointmentId}
            AND a.usuario_id = ${user.id}
            ORDER BY f.created_at DESC
        `;

        return results.map((f: any) => ({
            id: f.id,
            appointmentId: f.appointment_id,
            uploaderId: f.uploader_id,
            fileName: f.file_name,
            fileUrl: f.file_url,
            fileSize: f.file_size,
            createdAt: f.created_at,
            uploader: f.u_id ? {
                id: f.u_id,
                email: f.u_email,
                fullName: f.u_full_name,
                phone: f.u_phone,
                role: f.u_role
            } : null
        }));
    } catch (error) {
        console.error("Error getting session files optimized:", error);
        return [];
    }
}
