import { getUpcomingAppointments } from "@/app/actions/psychologists";
import AppointmentDetailsClient from "./AppointmentDetailsClient";
import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { client } from "@/db";

import { getSessionFiles } from "@/app/actions/files";

export default async function AppointmentPage({ params }: { params: Promise<{ id: string }> }) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'psychologist') {
        redirect("/login");
    }

    const { id } = await params;

    // Fetch appointment and files in parallel
    const [result, files] = await Promise.all([
        client`
            SELECT a.*, u.full_name as u_full_name, u.email as u_email
            FROM appointments a
            JOIN users u ON a.patient_id = u.id
            WHERE a.id = ${id}
            LIMIT 1
        `,
        getSessionFiles(id)
    ]);

    if (result.length === 0) {
        return <div className="p-8">Cita no encontrada.</div>;
    }

    const app = result[0];
    const appointment = {
        id: app.id,
        patientId: app.patient_id,
        psychologistId: app.psychologist_id,
        date: app.date,
        reason: app.reason,
        status: app.status,
        price: app.price,
        psychologistNotes: app.psychologist_notes,
        improvementTips: app.improvement_tips,
        patient: {
            fullName: app.is_anonymous ? (app.patient_name || "Usuario Anónimo") : app.u_full_name,
            email: app.is_anonymous ? "Privado" : app.u_email
        },
        files
    };

    return <AppointmentDetailsClient appointment={appointment} coachId={user.id} />;
}
