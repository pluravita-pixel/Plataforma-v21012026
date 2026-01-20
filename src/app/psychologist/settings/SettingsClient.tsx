"use client";

import { useState } from "react";
import {
    Settings as SettingsIcon,
    Lock,
    Bell,
    Shield,
    Mail,
    Smartphone,
    ChevronRight as ChevronRightIcon
} from "lucide-react";
import { updateUserAccount } from "@/app/actions/users";
import { toast } from "sonner";

interface SettingsClientProps {
    user: {
        id: string;
        email: string;
        phone: string | null;
    };
}

export function SettingsClient({ user }: SettingsClientProps) {
    const [email, setEmail] = useState(user.email);
    const [phone, setPhone] = useState(user.phone || "");
    const [isSaving, setIsSaving] = useState(false);
    const [notifications, setNotifications] = useState(true);

    const handleSaveAccount = async () => {
        setIsSaving(true);
        const result = await updateUserAccount(user.id, {
            email,
            phone
        });
        setIsSaving(false);

        if (result.success) {
            toast.success("Detalles de la cuenta actualizados");
        } else {
            toast.error(result.error || "Error al actualizar la cuenta");
        }
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="space-y-6">
                {/* Account Details */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-gray-50 rounded-xl">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Detalles de la Cuenta</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">Correo Electrónico</label>
                                <input
                                    type="email"
                                    className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">Teléfono</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        className="w-full bg-gray-50 border-gray-100 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                        placeholder="+34 600 000 000"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                onClick={handleSaveAccount}
                                disabled={isSaving}
                                className="bg-gray-900 text-white font-bold px-8 py-3 rounded-xl text-sm hover:bg-gray-800 transition-all disabled:opacity-50"
                            >
                                {isSaving ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-gray-50 rounded-xl">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Seguridad</h2>
                    </div>

                    <div className="space-y-4">
                        <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <Shield className="h-4 w-4" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-gray-900 text-sm">Cambiar Contraseña</p>
                                    <p className="text-xs text-gray-500">Mediante Supabase Auth</p>
                                </div>
                            </div>
                            <ChevronRightIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </button>
                    </div>
                </div>

                {/* Preferences */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-gray-50 rounded-xl">
                            <Bell className="h-5 w-5 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Preferencias</h2>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                        <div>
                            <p className="font-bold text-gray-900 text-sm">Notificaciones por Correo</p>
                            <p className="text-xs text-gray-500 mt-0.5">Recibe avisos sobre nuevas citas y mensajes.</p>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`w-12 h-6 rounded-full transition-all relative ${notifications ? "bg-[#0077FF]" : "bg-gray-300"
                                }`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? "left-7" : "left-1"
                                }`}></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
