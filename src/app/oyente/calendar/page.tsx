export const dynamic = 'force-dynamic';
import { getCurrentUser } from "@/app/actions/auth";
import { getOyenteStatus, getUpcomingAppointments } from "@/app/actions/oyentes";
import { getAvailabilitySlots } from "@/app/actions/booking";
import { redirect } from "next/navigation";
import { CalendarClient } from "./CalendarClient";

export default async function CalendarPage() {
    const user = await getCurrentUser();

    if (!user || user.role !== 'oyente') {
        redirect("/login");
    }

    const oyente = await getOyenteStatus(user.id);

    if (!oyente) {
        return (
            <div className="p-8 text-center bg-white rounded-3xl border border-gray-100">
                <p className="text-gray-500">No se encontraron datos de coach para este usuario.</p>
            </div>
        );
    }

    const appointments = await getUpcomingAppointments(oyente.id);
    const slots = await getAvailabilitySlots(oyente.id);

    return (
        <CalendarClient
            oyenteId={oyente.id}
            initialAppointments={appointments.map(app => ({
                id: app.id,
                date: app.date,
                patientName: app.usuario?.fullName || 'Usuario sin nombre',
                status: app.status
            }))}
            initialSlots={slots.map(s => ({
                id: s.id,
                startTime: s.startTime,
                endTime: s.endTime,
                isBooked: s.isBooked
            }))}
        />
    );
}
