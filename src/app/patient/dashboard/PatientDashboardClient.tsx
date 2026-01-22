"use client";

import {
    Calendar,
    Search,
    Sparkles,
    Clock,
    Star,
    Video,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookingModal } from "@/components/booking/BookingModal";

interface PatientDashboardClientProps {
    initialData: any;
}

export default function PatientDashboardClient({ initialData }: PatientDashboardClientProps) {
    const router = useRouter();
    const { user, nextAppointment, recommendedCoaches } = initialData;

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* ... hero section omitted ... */}
            <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#4A3C31] to-[#2C241D] p-12 text-white shadow-2xl shadow-[#4A3C31]/20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                        <Sparkles className="h-3 w-3 text-amber-400" />
                        Bienvenido de Nuevo
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 lowercase first-letter:uppercase">
                        Hola, {user.fullName?.split(' ')[0] || 'Traveler'}
                    </h1>
                    <p className="text-white/60 text-xl font-medium max-w-lg leading-relaxed">
                        Tu viaje hacia el bienestar continúa hoy. Estamos aquí para apoyarte en cada paso.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content Side: Next Appointment */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black text-[#4A3C31] tracking-tight uppercase">Tu Próxima Sesión</h2>
                        <Link href="/patient/appointments" className="text-sm font-bold text-[#A68363] hover:underline flex items-center gap-1 group">
                            Ver todas
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {nextAppointment ? (
                        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl relative group overflow-hidden transition-all hover:shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#A68363]/5 rounded-bl-[100px] transition-all group-hover:bg-[#A68363]/10"></div>

                            <div className="flex flex-col md:flex-row gap-10 items-center">
                                <div className="flex flex-col items-center justify-center bg-[#F8F6F4] rounded-[2.5rem] w-32 h-32 shrink-0 border border-[#A68363]/10 shadow-inner">
                                    <p className="text-sm font-black text-[#A68363] uppercase tracking-widest">{format(new Date(nextAppointment.date), "MMM", { locale: es })}</p>
                                    <p className="text-4xl font-black text-[#4A3C31]">{format(new Date(nextAppointment.date), "dd")}</p>
                                </div>

                                <div className="flex-1 text-center md:text-left space-y-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                                        <Clock className="h-3 w-3" />
                                        Confirmada a las {format(new Date(nextAppointment.date), "HH:mm")} hrs
                                    </div>
                                    <h3 className="text-3xl font-black text-[#4A3C31]">Sesión con {nextAppointment.psychologist.fullName}</h3>
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Acompañamiento Psicoterapéutico Online</p>
                                </div>

                                <Button
                                    onClick={() => router.push(`/session/${nextAppointment.id}`)}
                                    className="w-full md:w-auto bg-[#4A3C31] hover:bg-black text-white font-black uppercase tracking-widest text-xs rounded-2xl px-10 h-16 shadow-xl shadow-[#4A3C31]/20 transition-all hover:-translate-y-1 active:scale-95"
                                >
                                    <span className="flex items-center gap-2">
                                        <Video className="h-5 w-5" />
                                        Entrar a Sesión
                                    </span>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-[3rem] border border-dashed border-gray-200 text-center space-y-6">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <Calendar className="h-10 w-10 text-gray-200" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-[#4A3C31]">Sin sesiones próximas</h3>
                                <p className="text-gray-400 font-medium">¿Estás listo para continuar tu proceso de crecimiento?</p>
                            </div>
                            <Button asChild className="bg-[#A68363] hover:bg-[#8C6B4D] text-white font-bold rounded-2xl px-8 h-12 shadow-lg shadow-[#A68363]/20">
                                <Link href="/patient/search">Agendar mi Primera Cita</Link>
                            </Button>
                        </div>
                    )}
                </div>

                {/* Sidebar Side: Recommendations */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black text-[#4A3C31] tracking-tight uppercase">Recomendados</h2>
                        <Link href="/patient/search" className="text-sm font-bold text-[#A68363] hover:underline">Ver todos</Link>
                    </div>

                    <div className="space-y-4">
                        {recommendedCoaches.map((coach: any) => (
                            <div key={coach.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-4 group">
                                <div className="w-16 h-16 rounded-2xl bg-[#A68363]/10 flex items-center justify-center text-[#A68363] font-black text-2xl group-hover:scale-110 transition-transform shadow-inner">
                                    {coach.fullName[0]}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="font-black text-[#4A3C31] truncate group-hover:text-[#A68363] transition-colors">{coach.fullName}</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">{coach.specialty}</p>
                                    <div className="flex items-center gap-1 mt-1 text-amber-500">
                                        <Star className="h-3 w-3 fill-current" />
                                        <span className="text-[10px] font-black text-gray-900">{coach.rating}</span>
                                    </div>
                                </div>
                                <BookingModal
                                    psychologistId={coach.id}
                                    psychologistName={coach.fullName}
                                    price={Number(coach.price) || 35}
                                    currentUser={user}
                                    customTrigger={
                                        <Button variant="ghost" className="h-10 w-10 rounded-xl p-0 hover:bg-[#A68363]/10 text-[#A68363]">
                                            <ArrowRight className="h-5 w-5" />
                                        </Button>
                                    }
                                />
                            </div>
                        ))}
                    </div>

                    {/* Quick Stats/Info */}
                    <div className="bg-emerald-50 p-8 rounded-[3rem] border border-emerald-100 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
                            <Star className="h-8 w-8 text-amber-500 fill-amber-500 opacity-20" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-1">Tu Impacto</p>
                            <p className="text-emerald-800 font-bold text-sm leading-snug">
                                Has dedicado tiempo valioso a tu bienestar mental. ¡Sigue así!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
