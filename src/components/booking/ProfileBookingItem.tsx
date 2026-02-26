"use client";

import { BookingModal } from "@/components/booking/BookingModal";
import { Button } from "@/components/ui/button";
import { Star, ShieldCheck, CheckCircle2, Calendar, Languages, ArrowRight, Heart } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface Psychologist {
    id: string;
    fullName: string;
    username: string | null;
    specialty: string | null;
    image: string | null;
    price: string | number | null;
    rating: string | number | null;
    licenseNumber?: string | null;
    description?: string | null;
    tags?: string[] | null;
    experience?: string | null;
    studies?: string | null;
    completedSessions?: number | null;
    benefits?: string[] | null;
    languages?: string[] | null;
}

interface ProfileBookingItemProps {
    coach: Psychologist;
    currentUser: any;
}

export function ProfileBookingItem({ coach, currentUser }: ProfileBookingItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full bg-white rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(74,60,49,0.05)] border border-[#F2EDE7] flex flex-col lg:flex-row group hover:shadow-[0_40px_80px_rgba(74,60,49,0.1)] transition-all duration-500 mb-12"
        >
            {/* Left Column: Visual & Basic Info */}
            <div className="lg:w-1/3 relative min-h-[400px] lg:min-h-auto overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#4A3C31]/60 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {coach.image ? (
                    <Image
                        src={coach.image}
                        alt={coach.fullName}
                        fill
                        className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-[#F2EDE7] flex items-center justify-center font-black text-6xl text-[#A68363]">
                        {coach.fullName[0]}
                    </div>
                )}

                {/* Overlay Info (Mobile/Hover) */}
                <div className="absolute bottom-6 left-6 right-6 z-20">
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[#A68363] text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Perfil Verificado
                        </span>
                    </div>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-xl">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-black text-[#4A3C31]">{coach.rating || "5.0"}</span>
                </div>
            </div>

            {/* Middle Column: Description & Details */}
            <div className="lg:w-1/3 p-8 md:p-12 flex flex-col justify-center space-y-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-[#A68363] uppercase tracking-[0.2em]">{coach.specialty || "Psicólogo General"}</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black text-[#4A3C31] uppercase tracking-tighter leading-none mb-2">
                        {coach.fullName}
                    </h3>
                    <div className="flex items-center gap-2 text-[#A68363]">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Col. {coach.licenseNumber || "COP-28741"}</span>
                    </div>
                </div>

                <p className="text-gray-500 font-medium leading-relaxed text-sm line-clamp-4">
                    {coach.description || "Profesional comprometido con el bienestar emocional, especializado en terapia individual y herramientas para la gestión diaria."}
                </p>

                <div className="flex flex-wrap gap-2">
                    {(coach.tags || ["Ansiedad", "Autoestima", "Estrés"]).slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-3 py-1.5 bg-[#F9F5F0] rounded-xl text-gray-600 text-[10px] font-bold border border-[#F2EDE7]">
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="pt-4 flex items-center gap-6 border-t border-[#F2EDE7]">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-[#A68363] uppercase tracking-widest mb-1">Sesiones</span>
                        <span className="text-sm font-black text-[#4A3C31] uppercase">{coach.completedSessions || 0}+</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-[#A68363] uppercase tracking-widest mb-1">Idiomas</span>
                        <span className="text-sm font-black text-[#4A3C31] uppercase">{(coach.languages || ["ESP"]).join(", ")}</span>
                    </div>
                </div>
            </div>

            {/* Right Column: Booking Card (Matches Profile Page Vibe) */}
            <div className="lg:w-1/3 bg-[#F9F5F0] p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-[#A68363]/5 rounded-full blur-3xl group-hover:bg-[#A68363]/10 transition-all duration-700"></div>

                <div className="relative z-10 space-y-8">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-[#A68363] uppercase tracking-[0.2em]">Precio por sesión</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-[#4A3C31]">{coach.price || "15"}€</span>
                            <span className="text-gray-400 font-bold uppercase text-[10px]">/ 60 Minutos</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-[#4A3C31]/70">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                <Calendar className="h-4 w-4 text-[#A68363]" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">Citas disponibles hoy</span>
                        </div>
                        <div className="flex items-center gap-3 text-[#4A3C31]/70">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                <Heart className="h-4 w-4 text-rose-400" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">Garantía de conexión</span>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4">
                        <BookingModal
                            listenerId={coach.id}
                            listenerName={coach.fullName}
                            price={Number(coach.price) || 15}
                            currentUser={currentUser}
                            description={coach.description}
                            tags={coach.tags}
                            experience={coach.experience}
                            studies={coach.studies}
                            specialty={coach.specialty}
                            rating={coach.rating}
                            licenseNumber={coach.licenseNumber}
                            completedSessions={coach.completedSessions}
                            image={coach.image}
                            customTrigger={
                                <Button className="w-full bg-[#A68363] hover:bg-[#4A3C31] text-white rounded-2xl h-16 font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:shadow-[#A68363]/20 hover:scale-[1.02] active:scale-95 text-[10px]">
                                    Comenzar ahora
                                </Button>
                            }
                        />
                        <Button
                            variant="link"
                            className="w-full text-[#A68363] font-black uppercase tracking-widest text-[9px] h-auto p-0 hover:text-[#4A3C31] transition-colors flex items-center justify-center gap-2"
                            asChild
                        >
                            <a href={`/psicologo/${coach.username || coach.id}`}>
                                Ver perfil completo
                                <ArrowRight className="h-3 w-3" />
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
