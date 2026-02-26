"use client";

import { ProfileBookingItem } from "./ProfileBookingItem";

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

interface ProfileBookingListProps {
    coaches: Psychologist[];
    currentUser: any;
}

export function ProfileBookingList({ coaches, currentUser }: ProfileBookingListProps) {
    if (coaches.length === 0) return null;

    return (
        <section id="section-psychologists" className="bg-[#FDFBF9] py-32">
            <div className="container mx-auto px-6 md:px-12 lg:px-20">
                <div className="max-w-4xl mb-20">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-[#A68363]/10 text-[#A68363] text-xs font-black uppercase tracking-widest mb-6">
                        Reserva Directa
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-[#4A3C31] uppercase tracking-tighter leading-[0.9] mb-8">
                        Elige a tu <br />
                        <span className="text-[#A68363]">Profesional Ideal</span>
                    </h2>
                    <p className="text-xl text-gray-500 font-medium max-w-2xl leading-relaxed">
                        Explora los perfiles de nuestros expertos verificados y agenda tu primera sesión en menos de 2 minutos.
                        Tú tienes el control total de tu proceso de bienestar.
                    </p>
                </div>

                <div className="flex flex-col">
                    {coaches.map((coach) => (
                        <ProfileBookingItem
                            key={coach.id}
                            coach={coach}
                            currentUser={currentUser}
                        />
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                        ¿No sabes a quién elegir? <a href="/affinity-test" className="text-[#A68363] underline underline-offset-4 hover:text-[#4A3C31] transition-colors">Haz nuestro test de afinidad</a>
                    </p>
                </div>
            </div>
        </section>
    );
}
