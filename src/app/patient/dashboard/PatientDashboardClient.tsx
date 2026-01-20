"use client";

import { useState } from "react";
import {
    Calendar,
    Search,
    User,
    Sparkles,
    Clock,
    Star,
    Shield,
    Video,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUploader } from "@/components/files/FileUploader";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

interface PatientDashboardClientProps {
    initialData: any;
}

export default function PatientDashboardClient({ initialData }: PatientDashboardClientProps) {
    const [activeTab, setActiveTab] = useState("overview");
    const { user, nextAppointment, recommendedCoaches } = initialData;

    const TIPS = [
        { title: "La regla de los 5 segundos", desc: "Cómo tomar decisiones rápidas y evitar la procrastinación." },
        { title: "Respiración Consciente", desc: "Una técnica simple para reducir la ansiedad en minutos." },
        { title: "Diario de Gratitud", desc: "3 cosas por las que estás agradecido hoy." },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#4A3C31] tracking-tight">Hola, {user.fullName?.split(' ')[0] || 'Traveler'}</h1>
                    <p className="text-[#8C8C8C] mt-2 font-medium text-lg">Tu viaje hacia el bienestar continúa hoy.</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex p-1.5 bg-white rounded-2xl shadow-sm border border-gray-100 w-fit">
                    {[
                        { id: "overview", label: "Mi Resumen", icon: Calendar },
                        { id: "coaches", label: "Explorar Coaches", icon: Search },
                        { id: "account", label: "Mi Cuenta", icon: User },
                        { id: "progress", label: "Tips & Progreso", icon: Sparkles },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                                ? "bg-[#4A3C31] text-white shadow-lg shadow-[#4A3C31]/20 transform scale-105"
                                : "text-gray-400 hover:text-[#4A3C31] hover:bg-gray-50"
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">

                {/* 1. OVERVIEW TAB */}
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Next Appointment Card */}
                        <div className="lg:col-span-2 bg-gradient-to-br from-[#4A3C31] to-[#2C241D] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-[#4A3C31]/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                            <div className="relative z-10 flex flex-col h-full justify-between min-h-[220px]">
                                {nextAppointment ? (
                                    <>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider mb-4">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                                    Próxima Sesión
                                                </div>
                                                <h2 className="text-3xl font-black mb-1">
                                                    {format(new Date(nextAppointment.date), "d 'de' MMMM", { locale: es })}
                                                </h2>
                                                <p className="text-white/60 font-medium text-lg flex items-center gap-2">
                                                    <Clock className="h-5 w-5" />
                                                    {format(new Date(nextAppointment.date), "HH:mm")} hrs
                                                </p>
                                            </div>
                                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                                                <Video className="h-8 w-8 text-white/80" />
                                            </div>
                                        </div>

                                        <div className="mt-8 p-6 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 flex items-center justify-between group-hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-[#A68363] flex items-center justify-center font-bold text-white shadow-lg">
                                                    {nextAppointment.psychologist.fullName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg">{nextAppointment.psychologist.fullName}</p>
                                                    <p className="text-white/50 text-sm">Sesión Online</p>
                                                </div>
                                            </div>
                                            <Button className="bg-white text-[#4A3C31] hover:bg-gray-100 font-bold rounded-xl h-11 px-6 shadow-xl">
                                                Entrar ahora
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                                            <Calendar className="h-10 w-10 text-white/40" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold">Sin citas pendientes</h3>
                                            <p className="text-white/40 text-sm">¿Estás listo para continuar tu proceso?</p>
                                        </div>
                                        <Button
                                            asChild
                                            className="bg-[#A68363] hover:bg-[#8C6B4D] text-white border-none rounded-xl"
                                        >
                                            <Link href="/affinity-results">Explorar Coaches</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Session Files & Tools */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm h-full flex flex-col">
                                {nextAppointment ? (
                                    <FileUploader
                                        appointmentId={nextAppointment.id}
                                        uploaderId={user.id}
                                        existingFiles={nextAppointment.files || []}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full py-8 text-center text-gray-400">
                                        <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
                                        <p className="text-xs font-medium">Agenda una cita para compartir archivos</p>
                                    </div>
                                )}

                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                                        <Shield className="h-4 w-4" />
                                        <span className="font-medium">Espacio Seguro y Encriptado</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. COACHES TAB */}
                {activeTab === "coaches" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-[#4A3C31]">Coaches Recomendados</h2>
                            <Link href="/affinity-results" className="text-sm font-bold text-[#A68363] hover:underline">Ver todos</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recommendedCoaches.map((coach: any) => (
                                <div key={coach.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-16 h-16 rounded-2xl bg-[#A68363]/10 flex items-center justify-center text-[#A68363] font-black text-2xl">
                                            {coach.fullName[0]}
                                        </div>
                                        <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full text-amber-600 font-bold text-xs">
                                            <Star className="h-3 w-3 fill-current" />
                                            {coach.rating}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-[#4A3C31] mb-1">{coach.fullName}</h3>
                                    <p className="text-gray-400 text-sm font-medium mb-6">{coach.specialty}</p>
                                    <Button asChild className="w-full bg-[#4A3C31] hover:bg-[#2C241D] text-white font-bold rounded-xl h-12 shadow-lg shadow-[#4A3C31]/20">
                                        <Link href="/affinity-results">Reservar Cita</Link>
                                    </Button>
                                </div>
                            ))}
                            {recommendedCoaches.length === 0 && (
                                <p className="col-span-full text-center text-gray-400 py-12">No hay coaches disponibles en este momento.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. ACCOUNT TAB */}
                {activeTab === "account" && (
                    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm max-w-2xl">
                        <h2 className="text-2xl font-bold text-[#4A3C31] mb-8">Información Personal</h2>
                        <div className="space-y-6">
                            <div className="flex flex-col space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Nombre Completo</Label>
                                    <Input defaultValue={user.fullName} className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:border-[#A68363] focus:ring-[#A68363]/20" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Email</Label>
                                <Input defaultValue={user.email} disabled className="h-12 rounded-xl bg-gray-50/50 border-gray-100 text-gray-400" />
                            </div>
                            <div className="pt-4">
                                <Button className="bg-[#A68363] hover:bg-[#8C6B4D] text-white font-bold rounded-xl px-8 h-12 shadow-lg shadow-[#A68363]/20">
                                    Guardar Cambios
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. PROGRESS TAB */}
                {activeTab === "progress" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                            <h2 className="text-2xl font-bold text-[#4A3C31] mb-6">Tips para ti</h2>
                            <div className="space-y-4">
                                {TIPS.map((tip, i) => (
                                    <div key={i} className="p-5 rounded-3xl bg-[#FAFAFA] border border-gray-50 hover:bg-[#A68363]/5 hover:border-[#A68363]/20 transition-colors cursor-default">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#A68363] border border-gray-100 shrink-0">
                                                <Sparkles className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#4A3C31] mb-1">{tip.title}</h4>
                                                <p className="text-sm text-gray-500 leading-relaxed">{tip.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
