export const dynamic = 'force-dynamic';
import { getCurrentUser } from "@/app/actions/auth";
import { getOyenteStatus, getOyenteUsuarios } from "@/app/actions/oyentes";
import { redirect } from "next/navigation";
import { UsuariosClient } from "./UsuariosClient";

export default async function PatientsPage() {
    const user = await getCurrentUser();

    if (!user || user.role !== 'oyente') {
        redirect("/login");
    }

    const oyente = await getOyenteStatus(user.id);

    if (!oyente) {
        return (
            <div className="p-8 text-center bg-white rounded-3xl border border-gray-100">
                <p className="text-gray-500">No se encontraron datos de oyente para este usuario.</p>
            </div>
        );
    }

    const patients = await getOyenteUsuarios(oyente.id);

    return (
        <UsuariosClient
            oyenteId={oyente.id}
            initialPatients={patients.map(p => ({
                id: p.id,
                fullName: p.fullName,
                email: p.email,
                lastSession: p.lastSession,
                reason: p.reason,
                status: p.status,
                nextAppointmentId: p.nextAppointmentId,
                nextAppDate: p.nextAppDate,
                isAnonymous: p.isAnonymous
            }))}
        />
    );
}
