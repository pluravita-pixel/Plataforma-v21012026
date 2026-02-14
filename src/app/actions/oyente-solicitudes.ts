"use server";

import { client } from "@/db";
import { getCurrentUser } from "./auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

export async function submitOyenteApplication(prevState: any, formData: FormData) {
    const user = await getCurrentUser();
    if (!user) return { error: "No autorizado" };

    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const studies = formData.get("studies") as string;
    const motivation = formData.get("motivation") as string;
    const languages = formData.get("languages") as string;
    const interviewAvailability = formData.get("interviewAvailability") as string;

    try {
        // Insert application
        await client`
            INSERT INTO oyente_solicitudes (user_id, full_name, email, phone, studies, motivation, languages, interview_availability)
            VALUES (${user.id}::uuid, ${fullName}::text, ${email}::text, ${phone}::text, ${studies}::text, ${motivation}::text, ${languages}::text, ${interviewAvailability}::text)
        `;

        // Update user status
        await client`
            UPDATE users 
            SET has_pending_application = true 
            WHERE id = ${user.id}
        `;

        const ticketMessage = `El usuario ${fullName} ha enviado su solicitud. Ver en el panel de Oyentes Pendientes.`;
        await client`
            INSERT INTO support_tickets (user_id, subject, message, status)
            VALUES (${user.id}::uuid, 'Nueva solicitud de Oyente', ${ticketMessage}::text, 'open')
        `;

        return { success: "Solicitud enviada correctamente. Un administrador la revisará pronto." };
    } catch (error: any) {
        console.error("Error submitting oyente application:", error);
        return { error: "Error al enviar la solicitud. Por favor, inténtalo de nuevo." };
    }
}

export async function handleOyenteApplication(applicationId: string, action: 'accept' | 'reject') {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'admin') return { error: "No autorizado" };

    try {
        const application = (await client`
            SELECT user_id, full_name, email FROM oyente_solicitudes WHERE id = ${applicationId}
        `)[0];

        if (!application) return { error: "Solicitud no encontrada" };

        if (action === 'accept') {
            await client`
                UPDATE users SET role = 'oyente', has_pending_application = false WHERE id = ${application.user_id}::uuid
            `;

            await client`
                INSERT INTO oyentes (user_id, full_name, email, specialty)
                VALUES (${application.user_id}::uuid, ${application.full_name}, ${application.email}, 'General')
            `;

            await client`
                UPDATE oyente_solicitudes SET status = 'accepted' WHERE id = ${applicationId}::uuid
            `;
        } else {
            await client`
                DELETE FROM oyente_solicitudes WHERE id = ${applicationId}::uuid
            `;

            await client`
                DELETE FROM support_tickets WHERE user_id = ${application.user_id}::uuid AND subject = 'Nueva solicitud de Oyente'
            `;

            // Eliminar de Supabase Auth
            const supabaseAdmin = await createAdminClient();
            await supabaseAdmin.auth.admin.deleteUser(application.user_id);

            await client`
                DELETE FROM users WHERE id = ${application.user_id}::uuid
            `;
        }


        revalidatePath("/admin/dashboard");
        return { success: `Solicitud ${action === 'accept' ? 'aceptada' : 'rechazada'} correctamente.` };
    } catch (error: any) {
        console.error("Error handling oyente application:", error);
        return { error: "Error al procesar la solicitud." };
    }
}

export async function getPendingApplications() {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'admin') return [];

    try {
        return await client`
            SELECT * FROM oyente_solicitudes WHERE status = 'pending' ORDER BY created_at DESC
        `;
    } catch (error) {
        console.error("Error fetching pending applications:", error);
        return [];
    }
}
