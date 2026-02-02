"use client";

import { useEffect, useState, useTransition } from "react";
import { getPendingApplications, handleCoachApplication } from "@/app/actions/coaches";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Clock, Mail, Phone, GraduationCap, Heart, User, ChevronDown, CalendarClock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function CoachesPendingPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const fetchApplications = async () => {
        const apps = await getPendingApplications();
        setApplications(apps);
        setLoading(false);
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const onAction = (id: string, action: 'accept' | 'reject') => {
        startTransition(async () => {
            const result = await handleCoachApplication(id, action);
            if (result.success) {
                fetchApplications();
            } else {
                alert(result.error);
            }
        });
    };

    if (loading) return <div>Cargando solicitudes...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-[#4A3C31] uppercase tracking-tighter">
                    Solicitudes de Coaches
                </h1>
                <p className="text-gray-500 mt-2 font-medium">
                    Revisa y aprueba a los nuevos profesionales que quieren unirse a la plataforma.
                </p>
            </div>

            <div className="grid gap-6">
                <AnimatePresence mode="popLayout">
                    {applications.length > 0 ? applications.map((app) => (
                        <motion.div
                            key={app.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            layout
                            className="overflow-hidden"
                        >
                            <Card
                                onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                                className={`cursor-pointer border-4 border-black rounded-none transition-all duration-300 ${expandedId === app.id
                                    ? "p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white scale-[1.01]"
                                    : "p-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:bg-gray-50/50"
                                    }`}
                            >
                                {expandedId === app.id ? (
                                    // VISTA EXPANDIDA (DETALLADA)
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex flex-col lg:flex-row gap-8"
                                    >
                                        <div className="flex-1 space-y-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-none border-2 border-black flex items-center justify-center">
                                                        <User className="h-8 w-8" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-black uppercase tracking-tight">{app.fullName}</h3>
                                                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 font-bold">
                                                            <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {app.email}</span>
                                                            <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {app.phone}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 border-2 border-black font-black text-xs uppercase tracking-widest">
                                                    <Clock className="h-4 w-4" /> Pendiente
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-8 pt-4">
                                                <div className="space-y-2">
                                                    <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#A68363]">
                                                        <GraduationCap className="h-4 w-4" /> Estudios y Experiencia
                                                    </h4>
                                                    <p className="text-sm leading-relaxed text-gray-700 font-medium bg-gray-50 p-4 border-2 border-dashed border-gray-200">
                                                        {app.studies}
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#A68363]">
                                                        <Heart className="h-4 w-4" /> Motivación
                                                    </h4>
                                                    <p className="text-sm leading-relaxed text-gray-700 font-medium bg-gray-50 p-4 border-2 border-dashed border-gray-200">
                                                        {app.motivation}
                                                    </p>
                                                </div>
                                                <div className="space-y-2 col-span-2">
                                                    <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#A68363]">
                                                        Idiomas
                                                    </h4>
                                                    <p className="text-sm leading-relaxed text-gray-700 font-medium bg-gray-50 p-4 border-2 border-dashed border-gray-200">
                                                        {app.languages || "No especificado"}
                                                    </p>
                                                </div>
                                                <div className="space-y-2 col-span-2">
                                                    <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#A68363]">
                                                        <Clock className="h-4 w-4" /> Disponibilidad Entrevista
                                                    </h4>
                                                    <p className="text-sm leading-relaxed text-gray-700 font-medium bg-gray-50 p-4 border-2 border-dashed border-gray-200">
                                                        {app.interview_availability || "No especificado"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-4 border-t border-gray-100">
                                                Recibida el {app.created_at ? format(new Date(app.created_at), "PPP 'a las' HH:mm", { locale: es }) : format(new Date(), "PPP 'a las' HH:mm", { locale: es })}
                                            </div>
                                        </div>

                                        <div className="flex lg:flex-col gap-4 justify-center lg:border-l-4 lg:border-black lg:pl-8">
                                            <Button
                                                onClick={(e) => { e.stopPropagation(); onAction(app.id, 'accept'); }}
                                                disabled={isPending}
                                                className="bg-green-500 hover:bg-green-600 text-white font-black uppercase tracking-widest h-16 px-8 rounded-none border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
                                            >
                                                <Check className="h-6 w-6" /> Aceptar
                                            </Button>
                                            <Button
                                                onClick={(e) => { e.stopPropagation(); onAction(app.id, 'reject'); }}
                                                disabled={isPending}
                                                className="bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest h-16 px-8 rounded-none border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
                                            >
                                                <X className="h-6 w-6" /> Rechazar
                                            </Button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    // VISTA COMPACTA (RESUMEN)
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center">
                                                <User className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[#4A3C31] uppercase text-sm tracking-tight">{app.fullName}</h3>
                                                <p className="text-xs text-gray-400 font-medium truncate max-w-[200px]">{app.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="hidden md:flex items-center gap-1 text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                <CalendarClock className="h-3 w-3" />
                                                {app.created_at ? format(new Date(app.created_at), "dd MMM", { locale: es }) : "Hoy"}
                                            </div>
                                            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 font-bold text-[10px] uppercase tracking-wider rounded">
                                                <Clock className="h-3 w-3" /> Pendiente
                                            </div>
                                            <ChevronDown className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </motion.div>
                                )}
                            </Card>
                        </motion.div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center bg-gray-50 border-4 border-dashed border-gray-200">
                            <ShieldCheck className="h-16 w-16 text-gray-200 mb-4" />
                            <p className="text-gray-400 font-black uppercase tracking-widest">No hay solicitudes pendientes</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function ShieldCheck(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
