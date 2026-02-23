"use client";

import { BookingModal } from "@/components/booking/BookingModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";

interface Psychologist {
    id: string;
    fullName: string;
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
}

interface CoachesListProps {
    coaches: Psychologist[];
    currentUser: any;
}

export function CoachesList({ coaches, currentUser }: CoachesListProps) {
    if (coaches.length === 0) return null;

    return (
        <section id="section-psychologists" className="bg-white py-24">
            <div className="container mx-auto px-6 md:px-12 lg:px-20">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-2xl text-left">
                        <h2 className="text-4xl md:text-5xl font-black text-[#4A3C31] uppercase tracking-tighter mb-4 leading-none">
                            Nuestros <br />
                            <span className="text-[#A68363]">Profesionales</span>
                        </h2>
                        <p className="text-lg text-[#6B6B6B] font-medium">
                            Perfiles verificados y comprometidos con tu crecimiento personal. Encuentra el acompañamiento que necesitas hoy mismo.
                        </p>
                    </div>
                    <Link href="/affinity-test" className="text-[#A68363] font-black uppercase tracking-widest text-xs flex items-center gap-2 group border-b-2 border-[#A68363] pb-1 hover:text-[#4A3C31] hover:border-[#4A3C31] transition-all">
                        Ver todos los profesionales
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {coaches.slice(0, 3).map((coach, index) => (
                        <motion.div
                            key={coach.id}
                            initial={{ y: 0 }}
                            animate={{
                                y: [0, -10, 0],
                                scale: [1, 1.02, 1]
                            }}
                            transition={{
                                duration: 4 + index * 0.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: index * 0.2
                            }}
                            className="bg-white p-6 rounded-[2rem] neo-shadow-sm hover:neo-shadow transition-all duration-300 flex flex-col gap-6"
                        >
                            {/* Profile Header */}
                            <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20 flex-shrink-0 rounded-full overflow-hidden border-2 border-[#F2EDE7] shadow-sm">
                                    {coach.image ? (
                                        <Image
                                            src={coach.image}
                                            alt={coach.fullName}
                                            fill
                                            className="object-cover object-top"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-[#F2EDE7] flex items-center justify-center font-black text-2xl text-[#A68363]">
                                            {coach.fullName[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-black text-[#4A3C31] uppercase tracking-tight truncate leading-none mb-1">
                                        {coach.fullName}
                                    </h3>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[9px] font-black text-[#A68363] uppercase tracking-widest">
                                            {coach.specialty || "Psicólogo General"}
                                        </span>
                                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <ShieldCheck className="h-2 w-2" />
                                            Col. {coach.licenseNumber || "COP-28741"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-2">
                                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                        <span className="text-[10px] font-black text-[#4A3C31]">{coach.rating || "5.0"}</span>
                                        <span className="text-[10px] font-bold text-gray-400 ml-2">{coach.price || "15"}€/sesión</span>
                                    </div>
                                </div>
                            </div>

                            <BookingModal
                                listenerId={coach.id}
                                listenerName={coach.fullName}
                                price={Number(coach.price) || 15}
                                currentUser={currentUser}
                                // Additional profile data
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
                                    <Button className="w-full bg-[#A68363] hover:bg-[#8C6F56] text-white rounded-xl h-12 font-black uppercase tracking-widest text-[10px] transition-all shadow-md hover:shadow-lg">
                                        Reservar ya
                                    </Button>
                                }
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
