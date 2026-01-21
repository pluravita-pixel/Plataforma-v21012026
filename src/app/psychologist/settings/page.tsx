import { getCurrentUser } from "@/app/actions/auth";
import { getMyTickets } from "@/app/actions/support";
import { redirect } from "next/navigation";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    const tickets = await getMyTickets();

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-black text-[#4A3C31] tracking-tight">Configuración</h1>
                <p className="text-gray-500 mt-2 font-medium">Gestiona tu cuenta, revisa la guía de inicio y contacta con soporte.</p>
            </div>

            <SettingsClient
                user={{
                    id: user.id,
                    email: user.email,
                    phone: user.phone
                }}
                initialTickets={tickets as any}
            />
        </div>
    );
}
