import { getCurrentUser } from "@/app/actions/auth";
import { getPsychologistStatus, getPsychologistPatients } from "@/app/actions/psychologists";
import { redirect } from "next/navigation";
import { PatientsClient } from "./PatientsClient";

export default async function PatientsPage() {
    const user = await getCurrentUser();

    if (!user || user.role !== 'psychologist') {
        redirect("/login");
    }

    const psychologist = await getPsychologistStatus(user.id);

    if (!psychologist) {
        return (
            <div className="p-8 text-center bg-white rounded-3xl border border-gray-100">
                <p className="text-gray-500">No se encontraron datos de coach para este usuario.</p>
            </div>
        );
    }

    const patients = await getPsychologistPatients(psychologist.id);

    return (
        <PatientsClient
            psychologistId={psychologist.id}
            initialPatients={patients.map(p => ({
                id: p.id,
                fullName: p.fullName,
                email: p.email,
                lastSession: p.lastSession,
                reason: p.reason,
                status: p.status,
                nextAppointmentId: p.nextAppointmentId,
                nextAppDate: p.nextAppDate
            }))}
        />
    );
}
