import {
    Users,
    Calendar,
    TrendingUp,
    ArrowUpRight,
    MessageSquare,
    Clock
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { getCurrentUser } from "@/app/actions/auth";
import { getPsychologistStatus, getUpcomingAppointments } from "@/app/actions/psychologists";

import { db } from "@/db";
import { appointments } from "@/db/schema";
import { eq, and, gte, lte, count, desc } from "drizzle-orm";

async function getPsychologistData() {
    const user = await getCurrentUser();

    if (!user || user.role !== 'psychologist') return null;

    const psych = await getPsychologistStatus(user.id);
    if (!psych) return null;

    // Fetch upcoming
    const upcoming = await getUpcomingAppointments(psych.id);

    // Fetch this week's appointments count
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));

    const [thisWeek] = await db.select({ value: count() })
        .from(appointments)
        .where(and(
            eq(appointments.psychologistId, psych.id),
            gte(appointments.date, startOfWeek),
            lte(appointments.date, endOfWeek)
        ));

    // Fetch recent consultations (from completed appointments)
    const recentConsultations = await db.query.appointments.findMany({
        where: and(
            eq(appointments.psychologistId, psych.id),
            eq(appointments.status, "completed")
        ),
        limit: 5,
        orderBy: [desc(appointments.date)],
        with: {
            patient: true
        }
    });

    return {
        psych,
        upcoming: upcoming.slice(0, 5),
        thisWeekCount: thisWeek.value,
        recentConsultations
    };
}

export default async function PsychologistDashboard() {
    const data = await getPsychologistData();

    const stats = [
        { label: "Pacientes Activos", value: data?.psych.activePatients?.toString() || "0", icon: Users, color: "bg-[#4A3C31]/10 text-[#4A3C31]" },
        { label: "Citas esta semana", value: data?.thisWeekCount?.toString() || "0", icon: Calendar, color: "bg-[#A68363]/10 text-[#A68363]" },
        { label: "Saldo acumulado", value: `€${data?.psych.balance || "0.00"}`, icon: TrendingUp, color: "bg-emerald-50 text-emerald-700" },
        { label: "Total Pacientes", value: data?.psych.totalPatients?.toString() || "0", icon: MessageSquare, color: "bg-orange-50 text-orange-700" },
    ];

    return (
        <div className="space-y-8 font-sans">
            <div>
                <h1 className="text-3xl font-black text-[#4A3C31] tracking-tight">¡Hola de nuevo, {data?.psych.fullName?.split(' ')[0] || 'Coach'}!</h1>
                <p className="text-gray-500 mt-2 font-medium">Aquí tienes un resumen de lo que está pasando hoy.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                0%
                            </span>
                        </div>
                        <div>
                            <p className="text-[#8C8C8C] text-sm font-bold">{stat.label}</p>
                            <p className="text-3xl font-black text-[#4A3C31] mt-1">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upcoming Appointments */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-[#4A3C31]">Próximas Citas</h2>
                        <Link href="/psychologist/calendar" className="text-sm font-bold text-[#A68363] hover:text-[#8C6B4D] transition-colors">
                            Ver todo
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {data?.upcoming && data.upcoming.length > 0 ? data.upcoming.map((app, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-[#FAFAFA] border border-gray-50 hover:border-[#A68363]/20 transition-all cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#A68363]/10 flex items-center justify-center font-black text-[#A68363]">
                                        {app.patient?.fullName ? app.patient.fullName[0] : 'P'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#4A3C31] text-sm">{app.patient?.fullName || `Cita #${app.id.slice(0, 4)}`}</p>
                                        <div className="flex items-center text-xs text-gray-400 mt-1 font-medium">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {app.date.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} (50 min)
                                        </div>
                                    </div>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 bg-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm text-[#4A3C31] transition-all">
                                    Ver detalles
                                </button>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Calendar className="h-6 w-6 text-gray-300" />
                                </div>
                                <p className="text-gray-400 text-sm font-medium">No hay próximas citas programadas.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Patient Summary */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-[#4A3C31]">Motivos de consulta recientes</h2>
                        <Link href="/psychologist/patients" className="text-sm font-bold text-[#A68363] hover:text-[#8C6B4D] transition-colors">
                            Mis pacientes
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {data?.recentConsultations && data.recentConsultations.length > 0 ? data.recentConsultations.map((app, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-[#FAFAFA] border border-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center font-black text-emerald-600">
                                        {app.patient?.fullName ? app.patient.fullName[0] : 'P'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#4A3C31] text-sm">{app.patient?.fullName || 'Paciente'}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 italic">"{app.reason || 'Seguimiento general'}"</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-[#4A3C31]">{format(new Date(app.date), "d MMM")}</p>
                                    <p className="text-[10px] text-emerald-600 font-bold">Completada</p>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare className="h-6 w-6 text-gray-300" />
                                </div>
                                <p className="text-gray-400 text-sm font-medium">No hay actividad reciente.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
