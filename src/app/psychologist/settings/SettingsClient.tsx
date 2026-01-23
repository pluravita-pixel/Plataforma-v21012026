"use client";

import { useState } from "react";
import {
    Settings as SettingsIcon,
    Lock,
    Bell,
    Shield,
    Mail,
    Smartphone,
    ChevronRight as ChevronRightIcon,
    Lightbulb,
    CheckCircle2,
    Rocket,
    Heart,
    MessageCircle,
    FileQuestion,
    Search,
    Clock,
    Plus,
    History
} from "lucide-react";
import { updateUserAccount } from "@/app/actions/users";
import { resetPassword } from "@/app/actions/auth"; // Import resetPassword
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import NewTicketModal from "../support/NewTicketModal";

interface SettingsClientProps {
    user: {
        id: string;
        email: string;
        phone: string | null;
    };
    initialTickets?: any[];
}

export function SettingsClient({ user, initialTickets = [] }: SettingsClientProps) {
    const [email, setEmail] = useState(user.email);
    const [phone, setPhone] = useState(user.phone || "");
    const [isSaving, setIsSaving] = useState(false);
    const [notifications, setNotifications] = useState(true);

    // New state for password reset and resource popup
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [selectedResource, setSelectedResource] = useState<{ title: string, content: string } | null>(null);

    const handleResetPassword = async () => {
        setIsResettingPassword(true);
        const formData = new FormData();
        formData.append("email", user.email);

        const result = await resetPassword(null, formData);
        setIsResettingPassword(false);

        if (result.success) {
            toast.success(result.success);
        } else {
            toast.error(result.error || "Error al enviar el correo de recuperación");
        }
    };

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
                        <button
                            onClick={handleResetPassword}
                            disabled={isResettingPassword}
                            className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-[#A68363]/10 rounded-lg text-[#A68363]">
                                    <Shield className="h-4 w-4" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-gray-900 text-sm">Cambiar Contraseña</p>
                                    <p className="text-xs text-gray-500">
                                        {isResettingPassword ? "Enviando..." : "Enviar email de recuperación"}
                                    </p>
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
                            className={`w-12 h-6 rounded-full transition-all relative ${notifications ? "bg-[#A68363]" : "bg-gray-300"
                                }`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? "left-7" : "left-1"
                                }`} />
                        </button>
                    </div>
                </div>

                {/* Quick Start Guide Section */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-50 rounded-xl text-orange-500">
                                <Rocket className="h-5 w-5" />
                            </div>
                            <h2 className="text-xl font-black text-[#4A3C31] tracking-tight">GUÍA DE INICIO</h2>
                        </div>
                    </div>

                    <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest bg-gray-50 w-fit px-3 py-1 rounded-full">
                        Consejos para empezar con éxito
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            {
                                title: "Completa tu perfil al 100%",
                                description: "Los usuarios confían más en perfiles con descripciones detalladas y formación.",
                                icon: CheckCircle2,
                                color: "text-[#A68363]",
                                bg: "bg-[#A68363]/10"
                            },
                            {
                                title: "Sincroniza tu calendario",
                                description: "Asegúrate de tener tus horarios actualizados para que los clientes puedan agendar.",
                                icon: Rocket,
                                color: "text-purple-500",
                                bg: "bg-purple-50"
                            },
                            {
                                title: "La primera impresión cuenta",
                                description: "Prepara tu espacio de trabajo: buena iluminación y fondo neutral.",
                                icon: Lightbulb,
                                color: "text-orange-500",
                                bg: "bg-orange-50"
                            },
                            {
                                title: "Humaniza tu atención",
                                description: "Envía un mensaje de bienvenida a tus nuevos clientes para romper el hielo.",
                                icon: Heart,
                                color: "text-pink-500",
                                bg: "bg-pink-50"
                            }
                        ].map((tip, i) => (
                            <div key={i} className="p-5 rounded-2xl border border-gray-50 bg-[#FAFAFA] flex gap-4">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${tip.bg} ${tip.color} flex items-center justify-center`}>
                                    <tip.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm mb-1">{tip.title}</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">{tip.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Support Center Section */}
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Recent Tickets Container - Full Width */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm md:col-span-3 flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-xl">
                                        <History className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <h3 className="font-black text-gray-900 uppercase text-sm tracking-wide">Mis Tickets</h3>
                                </div>
                                <NewTicketModal />
                            </div>

                            <div className="flex-1 space-y-3">
                                {initialTickets.length > 0 ? (
                                    initialTickets.slice(0, 3).map((ticket: any) => (
                                        <div key={ticket.id} className="p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-all group flex items-center justify-between cursor-pointer border border-transparent hover:border-gray-100">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">#{ticket.id.slice(0, 6)}</span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${ticket.status === 'open' ? 'bg-[#A68363]/10 text-[#A68363]' : 'bg-gray-100 text-gray-500'}`}>
                                                        {ticket.status === 'open' ? 'Abierto' : 'Resuelto'}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-bold text-gray-900 group-hover:text-[#A68363] transition-colors">{ticket.subject}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">Enviado {format(new Date(ticket.createdAt), "d MMM, HH:mm", { locale: es })}</p>
                                            </div>
                                            <ChevronRightIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center py-8 opacity-50">
                                        <p className="text-xs font-bold text-gray-400">Sin actividad reciente</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Resources Horizontal List */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-gray-50 rounded-xl">
                                <FileQuestion className="h-4 w-4 text-gray-400" />
                            </div>
                            <h3 className="font-black text-gray-900 uppercase text-sm tracking-wide">Recursos Populares</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { title: "Optimizar Perfil", content: "Asegúrate de tener una foto profesional y una descripción clara de tu especialidad." },
                                { title: "Guía de Cobros", content: "Los pagos se procesan los días 1 y 15 de cada mes. Añade tu cuenta bancaria en Ajustes." },
                                { title: "IA en Sesiones", content: "Nuestras herramientas de IA te ayudan a tomar notas y sugerir temas, pero tú tienes el control." },
                                { title: "Cancelaciones", content: "Si cancelas con menos de 24h, se aplicará una penalización. Consulta la política completa." }
                            ].map((item, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedResource(item)}
                                    className="p-4 rounded-2xl bg-[#FAFAFA] border border-gray-50 hover:border-[#A68363]/30 text-xs font-bold text-gray-600 hover:text-[#A68363] transition-all text-center"
                                >
                                    {item.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Resource Popup (No Transition) */}
                    {selectedResource && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedResource(null)}>
                            <div className="bg-white p-8 rounded-3xl max-w-sm w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                                <h3 className="text-xl font-black text-[#4A3C31] mb-2">{selectedResource.title}</h3>
                                <p className="text-gray-600 mb-6">{selectedResource.content}</p>
                                <button
                                    onClick={() => setSelectedResource(null)}
                                    className="w-full bg-[#4A3C31] text-white font-bold py-3 rounded-xl hover:bg-[#2C241D]"
                                >
                                    Entendido
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
