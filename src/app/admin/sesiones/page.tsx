import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { getAllAppointments } from "@/app/actions/booking";
import { SesionesListClient } from "./SesionesListClient";

export default async function AdminSesionesPage() {
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
        redirect("/login");
    }

    const appointments = await getAllAppointments();

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-black uppercase italic tracking-tighter leading-none">
                        Gestión de Sesiones
                    </h1>
                    <p className="text-gray-500 mt-2 font-bold uppercase tracking-widest text-[10px]">
                        Panel de control para supervisar todas las citas de la plataforma
                    </p>
                </div>
            </div>

            <SesionesListClient appointments={appointments as any} />
        </div>
    );
}
