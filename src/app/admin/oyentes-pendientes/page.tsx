"use client";

import { useEffect, useState, useTransition } from "react";
import { getPendingApplications, handleOyenteApplication } from "@/app/actions/oyente-solicitudes";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Clock, Mail, Phone, GraduationCap, Heart, User, ChevronDown, CalendarClock, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Application {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    phone: string;
    studies: string;
    motivation: string;
    languages: string;
    interviewAvailability: string;
    status: string;
    createdAt: Date;
}

export default function PendingCoachesPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [isPending, startTransition] = useTransition();

    const fetchApplications = async () => {
        try {
            const data = await getPendingApplications();
            // Map DB fields to camelCase
            const mapped = data.map((a: any) => ({
                id: a.id,
                userId: a.user_id,
                fullName: a.full_name,
                email: a.email,
                phone: a.phone,
                studies: a.studies,
                motivation: a.motivation,
                languages: a.languages,
                interviewAvailability: a.interview_availability,
                status: a.status,
                createdAt: new Date(a.created_at)
            }));
            setApplications(mapped);
        } catch (error) {
            console.error("Error fetching applications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleAction = (id: string, action: 'accept' | 'reject') => {
        startTransition(async () => {
            const res = await handleOyenteApplication(id, action);
            if (res.success) {
                fetchApplications();
            } else {
                alert(res.error || "Error al procesar la solicitud");
            }
        });
    };

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };

    if (loading) return <div>Cargando solicitudes...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-[#4A3C31] uppercase tracking-tighter">
                    Solicitudes de Psicólogos
                </h1>
                <p className="text-gray-500 mt-2 font-medium">
                    Revisa y aprueba a los nuevos psicólogos que quieren unirse a la plataforma.
                </p>
                <p className="text-gray-500 mt-2 font-medium">
                    Al añadir un psicólogo, este se marcará con acceso especial en el sistema.
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
                                onClick={() => toggleExpand(app.id)}
                                className={`cursor-pointer border-4 border-black rounded-none transition-all duration-300 ${expandedIds.has(app.id)
                                    ? "p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white scale-[1.01]"
                                    : "p-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:bg-gray-50/50"
                                    }`}
                            >
                                {expandedIds.has(app.id) ? (
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
                                                        {app.interviewAvailability || "No especificado"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-4 border-t border-gray-100">
                                                Recibida el {app.createdAt ? format(app.createdAt, "PPP 'a las' HH:mm", { locale: es }) : format(new Date(), "PPP 'a las' HH:mm", { locale: es })}
                                            </div>
                                        </div>

                                        <div className="flex lg:flex-col gap-4 justify-center lg:border-l-4 lg:border-black lg:pl-8">
                                            <Button
                                                onClick={(e) => { e.stopPropagation(); handleAction(app.id, 'accept'); }}
                                                disabled={isPending}
                                                className="bg-green-500 hover:bg-green-600 text-white font-black uppercase tracking-widest h-16 px-8 rounded-none border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
                                            >
                                                <Check className="h-6 w-6" /> Aceptar
                                            </Button>
                                            <Button
                                                onClick={(e) => { e.stopPropagation(); handleAction(app.id, 'reject'); }}
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
                                                {app.createdAt ? format(app.createdAt, "dd MMM", { locale: es }) : "Hoy"}
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
