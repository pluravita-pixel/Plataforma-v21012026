"use server";

import { client } from "@/db";
import { getCurrentUser } from "./auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function submitCoachApplication(prevState: any, formData: FormData) {
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
            INSERT INTO coach_applications (user_id, full_name, email, phone, studies, motivation, languages, interview_availability)
            VALUES (${user.id}::uuid, ${fullName}::text, ${email}::text, ${phone}::text, ${studies}::text, ${motivation}::text, ${languages}::text, ${interviewAvailability}::text)
        `;

        // Update user status
        await client`
            UPDATE users 
            SET has_pending_application = true 
            WHERE id = ${user.id}
        `;

        // Create a support ticket for admin notification
        // Create a support ticket for admin notification
        const ticketMessage = `El usuario ${fullName} ha enviado su solicitud. Ver en el panel de Coaches Pendientes.`;
        await client`
            INSERT INTO support_tickets (user_id, subject, message, status)
            VALUES (${user.id}::uuid, 'Nueva solicitud de Coach', ${ticketMessage}::text, 'open')
        `;

        return { success: "Solicitud enviada correctamente. Un administrador la revisará pronto." };
    } catch (error: any) {
        console.error("Error submitting coach application:", error);
        return { error: "Error al enviar la solicitud. Por favor, inténtalo de nuevo." };
    }
}

export async function handleCoachApplication(applicationId: string, action: 'accept' | 'reject') {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'admin') return { error: "No autorizado" };

    try {
        const application = (await client`
            SELECT user_id, full_name, email FROM coach_applications WHERE id = ${applicationId}
        `)[0];

        if (!application) return { error: "Solicitud no encontrada" };

        if (action === 'accept') {
            // 1. Change user role to psychologist
            await client`
                UPDATE users SET role = 'psychologist', has_pending_application = false WHERE id = ${application.user_id}::uuid
            `;

            // 2. Create psychologist profile
            // We use the full name and email from the application
            await client`
                INSERT INTO psychologists (user_id, full_name, email)
                VALUES (${application.user_id}::uuid, ${application.full_name}, ${application.email})
            `;

            // 3. Update application status
            await client`
                UPDATE coach_applications SET status = 'accepted' WHERE id = ${applicationId}::uuid
            `;
        } else {
            // Reject: Delete everything mentioned
            // 1. Delete application first (foreign key)
            await client`
                DELETE FROM coach_applications WHERE id = ${applicationId}::uuid
            `;

            // 2. Delete support ticket
            await client`
                DELETE FROM support_tickets WHERE user_id = ${application.user_id}::uuid AND subject = 'Nueva solicitud de Coach'
            `;

            // 3. Delete user
            await client`
                DELETE FROM users WHERE id = ${application.user_id}::uuid
            `;

            // NOTE: Technically we could keep the application record with 'rejected' status 
            // but the user requested "que lo quite" (to remove it).
        }


        revalidatePath("/admin/dashboard");
        return { success: `Solicitud ${action === 'accept' ? 'aceptada' : 'rechazada'} correctamente.` };
    } catch (error: any) {
        console.error("Error handling coach application:", error);
        return { error: "Error al procesar la solicitud." };
    }
}

export async function getPendingApplications() {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'admin') return [];

    try {
        return await client`
            SELECT * FROM coach_applications WHERE status = 'pending' ORDER BY created_at DESC
        `;
    } catch (error) {
        console.error("Error fetching pending applications:", error);
        return [];
    }
}
