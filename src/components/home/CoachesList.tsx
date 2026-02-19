"use client";

import { BookingModal } from "@/components/booking/BookingModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Psychologist {
    id: string;
    fullName: string;
    specialty: string | null;
    image: string | null;
    price: string | number | null;
    rating: string | number | null;
    licenseNumber?: string | null;
}

interface CoachesListProps {
    coaches: Psychologist[];
    currentUser: any;
}

export function CoachesList({ coaches, currentUser }: CoachesListProps) {
    if (coaches.length === 0) return null;

    return (
        <section className="bg-white py-24">
            <div className="container mx-auto px-6 md:px-12 lg:px-20">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-2xl text-left">
                        <h2 className="text-4xl md:text-5xl font-black text-[#4A3C31] uppercase tracking-tighter mb-4 leading-none">
                            Nuestros Psicólogos <br />
                            <span className="text-[#A68363]">Colegiados</span>
                        </h2>
                        <p className="text-lg text-[#6B6B6B] font-medium">
                            Profesionales verificados, listos para escucharte hoy mismo. Sin listas de espera y a un precio justo.
                        </p>
                    </div>
                    <Link href="/affinity-test" className="text-[#A68363] font-black uppercase tracking-widest text-xs flex items-center gap-2 group border-b-2 border-[#A68363] pb-1 hover:text-[#4A3C31] hover:border-[#4A3C31] transition-all">
                        Ver todos los profesionales
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {coaches.slice(0, 3).map((coach) => (
                        <Card key={coach.id} className="overflow-hidden border-none neo-shadow hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] bg-[#FDFCFB] group flex flex-col">
                            {/* Photo Section */}
                            <div className="relative h-72 w-full overflow-hidden">
                                {coach.image ? (
                                    <Image
                                        src={coach.image}
                                        alt={coach.fullName}
                                        fill
                                        className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#F2EDE7] flex items-center justify-center font-black text-4xl text-[#A68363]">
                                        {coach.fullName[0]}
                                    </div>
                                )}
                                <div className="absolute top-6 right-6">
                                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#F2EDE7] shadow-sm flex items-center gap-2">
                                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                        <span className="font-black text-[#4A3C31] text-sm">{coach.rating || "5.0"}</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-6 left-6">
                                    <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        Disponible Hoy
                                    </div>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="mb-6">
                                    <span className="text-[10px] font-black text-[#A68363] uppercase tracking-[0.2em] mb-2 block">
                                        {coach.specialty || "Psicólogo Generalista"}
                                    </span>
                                    <h3 className="text-2xl font-black text-[#4A3C31] uppercase tracking-tight italic mb-1">
                                        {coach.fullName}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[#6B6B6B] text-xs font-bold uppercase tracking-wider">
                                        <ShieldCheck className="h-3 w-3" />
                                        Col. {coach.licenseNumber || "COP-28741"}
                                    </div>
                                </div>

                                <div className="flex gap-4 mb-8">
                                    <div className="bg-white border-2 border-[#F2EDE7] p-4 rounded-3xl flex-1 text-center">
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Sesión</div>
                                        <div className="text-xl font-black text-[#4A3C31]">{coach.price || "35"}€</div>
                                    </div>
                                    <div className="bg-white border-2 border-[#F2EDE7] p-4 rounded-3xl flex-1 text-center">
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Duración</div>
                                        <div className="text-xl font-black text-[#4A3C31]">60 min</div>
                                    </div>
                                </div>

                                <BookingModal
                                    listenerId={coach.id}
                                    listenerName={coach.fullName}
                                    price={Number(coach.price) || 35}
                                    currentUser={currentUser}
                                    customTrigger={
                                        <Button className="w-full bg-[#4A3C31] hover:bg-[#3A2E26] text-white rounded-2xl h-14 font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-xl group-hover:scale-[1.02]">
                                            Reservar Cita Ahora
                                        </Button>
                                    }
                                />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
