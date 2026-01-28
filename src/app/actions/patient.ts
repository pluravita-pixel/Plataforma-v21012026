"use server";

import { db, client } from "@/db"; // Use drizzle db and raw client
import { appointments, psychologists } from "@/db/schema";
import { eq, and, gte, asc } from "drizzle-orm";
import { getCurrentUser } from "./auth";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function getPatientDashboardData() {
    try {
        const user = await getCurrentUser();
        if (!user) return null;

        // Fetch data in parallel to reduce total roundtrip time
        const [nextApptResults, coachesResults] = await Promise.all([
            client`
                SELECT a.*, 
                       p.id as p_id, p.user_id as p_user_id, p.full_name as p_full_name, p.email as p_email,
                       p.total_sessions as p_total_sessions, p.total_patients as p_total_patients,
                       p.active_patients as p_active_patients, p.rating as p_rating,
                       p.specialty as p_specialty, p.image as p_image, p.price as p_price
                FROM appointments a
                LEFT JOIN psychologists p ON a.psychologist_id = p.id
                WHERE a.patient_id = ${user.id}
                AND a.status = 'scheduled'
                AND a.date >= ${new Date().toISOString()}
                ORDER BY a.date ASC
                LIMIT 1
            `,
            client`
                SELECT * FROM psychologists 
                ORDER BY rating DESC 
                LIMIT 3
            `
        ]);

        const nextAppt = nextApptResults[0] ? {
            ...nextApptResults[0],
            psychologist: {
                id: nextApptResults[0].p_id,
                fullName: nextApptResults[0].p_full_name,
                specialty: nextApptResults[0].p_specialty,
                rating: nextApptResults[0].p_rating,
                image: nextApptResults[0].p_image,
            }
        } : null;

        const coaches = coachesResults.map((p: any) => ({
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
            recommendedCoaches: coaches
        };
    } catch (error: any) {
        console.error("Error in getPatientDashboardData:", error);
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
                   p.total_sessions as p_total_sessions, p.total_patients as p_total_patients,
                   p.active_patients as p_active_patients, p.rating as p_rating,
                   p.specialty as p_specialty, p.experience as p_experience,
                   p.image as p_image, p.description as p_description, p.price as p_price, p.tags as p_tags
            FROM appointments a
            LEFT JOIN psychologists p ON a.psychologist_id = p.id
            WHERE a.patient_id = ${user.id} 
            AND a.status = 'completed'
            ORDER BY a.date DESC
        `;

        return sessions.map((s: any) => ({
            id: s.id,
            patientId: s.patient_id,
            psychologistId: s.psychologist_id,
            date: s.date,
            reason: s.reason,
            status: s.status,
            price: s.price,
            discountCodeId: s.discount_code_id,
            psychologistNotes: s.psychologist_notes,
            improvementTips: s.improvement_tips,
            rating: s.rating,
            createdAt: s.created_at,
            psychologist: s.p_id ? {
                id: s.p_id,
                userId: s.p_user_id,
                fullName: s.p_full_name,
                email: s.p_email,
                totalSessions: s.p_total_sessions,
                totalPatients: s.p_total_patients,
                activePatients: s.p_active_patients,
                rating: s.p_rating,
                specialty: s.p_specialty,
                experience: s.p_experience,
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
        // Get appointment details
        // We select psychologist_id and date to match the availability slot
        const appointmentResult = await client`
            SELECT * FROM appointments 
            WHERE id = ${appointmentId} 
            AND patient_id = ${user.id}
            LIMIT 1
        `;

        const appointment = appointmentResult[0];

        if (!appointment) {
            return { error: "Cita no encontrada" };
        }

        if (appointment.status !== "scheduled") {
            return { error: "Esta cita no puede ser cancelada" };
        }

        // Update appointment status to cancelled
        await client`
            UPDATE appointments 
            SET status = 'cancelled' 
            WHERE id = ${appointmentId}
        `;

        // CRITICAL FIX: Free up the availability slot
        // We match by psychologist_id and start_time (which corresponds to appointment.date)
        await client`
            UPDATE availability_slots
            SET is_booked = false
            WHERE psychologist_id = ${appointment.psychologist_id}
            AND start_time = ${new Date(appointment.date).toISOString()}
        `;

        // Special logic for priority user "sanmiguelgil1@gmail.com"
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

export async function getAllPatientAppointments() {
    const user = await getCurrentUser();
    if (!user) return [];

    try {
        const appointments = await client`
            SELECT a.*, 
                   p.id as p_id, p.user_id as p_user_id, p.full_name as p_full_name, p.email as p_email,
                   p.total_sessions as p_total_sessions, p.total_patients as p_total_patients,
                   p.active_patients as p_active_patients, p.rating as p_rating,
                   p.specialty as p_specialty, p.experience as p_experience,
                   p.image as p_image, p.description as p_description, p.price as p_price, p.tags as p_tags
            FROM appointments a
            LEFT JOIN psychologists p ON a.psychologist_id = p.id
            WHERE a.patient_id = ${user.id} 
            AND a.status = 'scheduled'
            ORDER BY a.date ASC
        `;

        const enriched = await Promise.all(appointments.map(async (appt: any) => {
            const files = await getSessionFiles(appt.id);
            return {
                id: appt.id,
                patientId: appt.patient_id,
                psychologistId: appt.psychologist_id,
                date: appt.date,
                reason: appt.reason,
                status: appt.status,
                price: appt.price,
                discountCodeId: appt.discount_code_id,
                psychologistNotes: appt.psychologist_notes,
                improvementTips: appt.improvement_tips,
                rating: appt.rating,
                createdAt: appt.created_at,
                psychologist: appt.p_id ? {
                    id: appt.p_id,
                    userId: appt.p_user_id,
                    fullName: appt.p_full_name,
                    email: appt.p_email,
                    totalSessions: appt.p_total_sessions,
                    totalPatients: appt.p_total_patients,
                    activePatients: appt.p_active_patients,
                    rating: appt.p_rating,
                    specialty: appt.p_specialty,
                    experience: appt.p_experience,
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
        console.error("Error in getAllPatientAppointments optimized:", error);
        return [];
    }
}

export async function updatePatientProfile(data: { fullName?: string; phone?: string; email?: string }) {
    const user = await getCurrentUser();
    if (!user) {
        return { error: "No autenticado" };
    }

    try {
        let emailUpdateMessage = "";

        // Si se proporciona un email y es diferente al actual, actualizamos en Supabase Auth
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

        // Actualizamos la base de datos local
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
        // Verify ownership and get files with joining uploader in one go
        const results = await client`
            SELECT f.*, 
                   u.id as u_id, u.email as u_email, u.full_name as u_full_name, u.phone as u_phone, u.role as u_role
            FROM session_files f
            JOIN appointments a ON f.appointment_id = a.id
            LEFT JOIN users u ON f.uploader_id = u.id
            WHERE f.appointment_id = ${appointmentId}
            AND a.patient_id = ${user.id}
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
