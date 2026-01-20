import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
                <p className="text-gray-500 mt-1">Gestiona los detalles de tu cuenta y preferencias.</p>
            </div>

            <SettingsClient
                user={{
                    id: user.id,
                    email: user.email,
                    phone: user.phone
                }}
            />
        </div>
    );
}
