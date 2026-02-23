"use client";

import { useState } from "react";
import {
    Calendar,
    Clock,
    User,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronRight,
    Video,
    CreditCard,
    MoreVertical,
    FileText
} from "lucide-react";
import { format, isToday, isFuture, isPast, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Appointment {
    id: string;
    usuarioId: string;
    oyenteId: string;
    usuarioNombre: string | null;
    date: Date;
    status: string;
    price: string | null;
    meetingLink: string | null;
    isAnonymous: boolean;
    usuario: {
        email: string;
        fullName: string | null;
    };
    oyente: {
        fullName: string;
        email: string | null;
    };
}

export function SesionesListClient({ appointments }: { appointments: Appointment[] }) {
    const [activeTab, setActiveTab] = useState<"activas" | "futuras" | "pasadas" | "pendientes">("activas");
    const [searchTerm, setSearchTerm] = useState("");

    const now = new Date();

    const filteredAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date);

        // Tab filtering
        let matchesTab = false;
        if (activeTab === "activas") {
            // "Activas" logic: Today or scheduled for the future but we'll show Today here
            matchesTab = isToday(aptDate) && apt.status === 'scheduled';
        } else if (activeTab === "futuras") {
            matchesTab = isFuture(aptDate) && !isToday(aptDate) && apt.status === 'scheduled';
        } else if (activeTab === "pasadas") {
            matchesTab = isPast(aptDate) && (apt.status === 'completed' || apt.status === 'scheduled');
        } else if (activeTab === "pendientes") {
            matchesTab = apt.status === 'pending_payment';
        }

        // Search filtering
        const matchesSearch =
            apt.usuario?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.usuarioNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.oyente?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesTab && matchesSearch;
    });

    const getStatusStyles = (status: string, date: Date) => {
        if (status === 'pending_payment') return "bg-yellow-100 text-yellow-700 border-yellow-200";
        if (status === 'completed') return "bg-green-100 text-green-700 border-green-200";
        if (status === 'cancelled') return "bg-red-100 text-red-700 border-red-200";

        if (isPast(new Date(date))) return "bg-gray-100 text-gray-700 border-gray-200";
        return "bg-blue-100 text-blue-700 border-blue-200";
    };

    const getStatusLabel = (status: string, date: Date) => {
        if (status === 'pending_payment') return "PENDIENTE PAGO";
        if (status === 'completed') return "COMPLETADA";
        if (status === 'cancelled') return "CANCELADA";
        if (isPast(new Date(date))) return "FINALIZADA";
        return "PROGRAMADA";
    };

    const tabs = [
        { id: "activas", label: "Activas (Hoy)", icon: Clock },
        { id: "futuras", label: "Futuras", icon: Calendar },
        { id: "pasadas", label: "Pasadas", icon: HistoryIcon },
        { id: "pendientes", label: "Pendientes", icon: CreditCard },
    ];

    function HistoryIcon(props: any) {
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
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M12 7v5l4 2" />
            </svg>
        );
    }

    return (
        <div className="space-y-8">
            {/* Search and Filters */}
            <div className="bg-white p-2 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Buscar por usuario o psicólogo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-14 border-none bg-transparent font-bold text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex items-center gap-3 px-8 py-4 font-black uppercase tracking-tighter transition-all relative border-4",
                            activeTab === tab.id
                                ? "bg-black text-white border-black translate-y-[-4px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
                                : "bg-white text-black border-black hover:bg-gray-50"
                        )}
                    >
                        <tab.icon className="h-5 w-5" />
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute -bottom-1 left-0 right-0 h-1 bg-white mx-2"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="wait">
                    {filteredAppointments.length > 0 ? (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {filteredAppointments.map((apt) => (
                                <div
                                    key={apt.id}
                                    className="bg-white border-4 border-black neo-shadow hover:translate-x-[4px] hover:translate-y-[-4px] transition-all group overflow-hidden"
                                >
                                    <div className="flex flex-col md:flex-row divide-y-4 md:divide-y-0 md:divide-x-4 divide-black">
                                        {/* Time & Status Block */}
                                        <div className="p-8 md:w-64 bg-gray-50 flex flex-col justify-center items-center text-center gap-4">
                                            <div className="text-center">
                                                <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
                                                    {format(new Date(apt.date), "EEEE", { locale: es })}
                                                </p>
                                                <p className="text-4xl font-black italic tracking-tighter leading-none">
                                                    {format(new Date(apt.date), "HH:mm")}
                                                </p>
                                                <p className="text-sm font-bold uppercase mt-1">
                                                    {format(new Date(apt.date), "dd MMM", { locale: es })}
                                                </p>
                                            </div>
                                            <Badge className={cn(
                                                "rounded-none border-2 border-black font-black uppercase tracking-widest text-[9px] px-4 py-1",
                                                getStatusStyles(apt.status, apt.date)
                                            )}>
                                                {getStatusLabel(apt.status, apt.date)}
                                            </Badge>
                                        </div>

                                        {/* Participants Block */}
                                        <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                                            {/* User Info */}
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-blue-100 border-4 border-black flex items-center justify-center font-black text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    {apt.usuarioNombre ? apt.usuarioNombre[0].toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">Usuario</p>
                                                    <h3 className="text-xl font-black uppercase italic tracking-tighter truncate max-w-[200px]">
                                                        {apt.usuarioNombre || "Sin nombre"}
                                                        {apt.isAnonymous && <span className="ml-2 text-[10px] text-gray-400 font-normal">(Anónimo)</span>}
                                                    </h3>
                                                    <p className="text-xs font-bold text-gray-500 italic lowercase">{apt.usuario?.email}</p>
                                                </div>
                                            </div>

                                            {/* Psychologist Info */}
                                            <div className="flex items-center gap-6 md:border-l-2 md:border-black/5 md:pl-8">
                                                <div className="w-16 h-16 bg-purple-100 border-4 border-black flex items-center justify-center font-black text-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                                    {apt.oyente?.fullName ? apt.oyente.fullName[0].toUpperCase() : 'P'}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 mb-1">Psicólogo</p>
                                                    <h3 className="text-xl font-black uppercase italic tracking-tighter truncate max-w-[200px]">
                                                        {apt.oyente?.fullName}
                                                    </h3>
                                                    <p className="text-xs font-bold text-gray-500 italic lowercase">{apt.oyente?.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Block */}
                                        <div className="p-8 md:w-48 flex flex-col justify-center gap-3">
                                            {apt.meetingLink && (
                                                <Button className="neo-btn-black w-full text-[10px] h-10 tracking-widest" asChild>
                                                    <a href={apt.meetingLink} target="_blank" rel="noopener noreferrer">
                                                        <Video className="w-4 h-4 mr-2" />
                                                        LINK REUNIÓN
                                                    </a>
                                                </Button>
                                            )}
                                            <Button variant="outline" className="border-2 border-black rounded-none font-black uppercase text-[10px] tracking-widest h-10 hover:bg-black hover:text-white transition-all">
                                                <FileText className="w-4 h-4 mr-2" />
                                                DETALLES
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white border-4 border-dashed border-gray-200 p-20 text-center rounded-[3rem]"
                        >
                            <Calendar className="h-16 w-16 text-gray-200 mx-auto mb-6" />
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-gray-400">No se encontraron sesiones</h3>
                            <p className="text-gray-400 mt-2 font-bold uppercase tracking-widest text-[10px]">
                                Prueba a cambiar de pestaña o ajustar tu búsqueda
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
