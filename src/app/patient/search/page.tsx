"use client";

import { useState, useEffect } from "react";
import { Search, Star, MessageSquare, Filter, SlidersHorizontal, Sparkles, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { getPsychologists } from "@/app/actions/psychologists";
import { getCurrentUser } from "@/app/actions/auth";
import { BookingModal } from "@/components/booking/BookingModal";
import { PsychologistProfileModal } from "@/components/psychologist/ProfileModal";
import { useSearchParams } from "next/navigation";

export default function PatientSearchPage() {
    const [selectedPsychologist, setSelectedPsychologist] = useState<any>(null);
    const [isProfileDesktopOpen, setIsProfileDesktopOpen] = useState(false);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [psychData, userData] = await Promise.all([
                    getPsychologists(),
                    getCurrentUser()
                ]);
                setCoaches(psychData);
                setCurrentUser(userData);

                if (refId && psychData) {
                    const referred = psychData.find((p: any) => p.id === refId || p.userId === refId || p.refCode === refId);
                    if (referred) {
                        setSelectedPsychologist(referred);
                        setIsProfileDesktopOpen(true);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [refId]);

    const filteredCoaches = coaches.filter(c =>
        c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.specialty && c.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1">
                    <h1 className="text-4xl font-black text-[#4A3C31] tracking-tight flex items-center gap-3 lowercase first-letter:uppercase">
                        <Search className="h-10 w-10 text-[#A68363]" />
                        Buscar tu Coach
                    </h1>
                    <p className="text-[#8C8C8C] mt-2 font-medium text-lg uppercase tracking-widest text-[10px]">Encuentra al profesional ideal para tu proceso de crecimiento</p>

                    <div className="mt-8 relative max-w-2xl group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-[#A68363] transition-colors" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nombre, especialidad o síntoma..."
                            className="h-16 pl-14 pr-6 rounded-[2rem] bg-white border-gray-100 shadow-xl focus:ring-8 focus:ring-[#A68363]/5 focus:border-[#A68363] transition-all text-lg font-medium"
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="h-14 rounded-2xl border-gray-100 bg-white text-gray-400 font-bold px-6 border-none shadow-md hover:bg-[#A68363]/5 hover:text-[#A68363]">
                        <Filter className="h-5 w-5 mr-2" />
                        Filtros
                    </Button>
                    <Button variant="outline" className="h-14 rounded-2xl border-gray-100 bg-white text-gray-400 font-bold px-6 border-none shadow-md hover:bg-[#A68363]/5 hover:text-[#A68363]">
                        <SlidersHorizontal className="h-5 w-5 mr-2" />
                        Ordenar
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-[3rem] p-8 border border-gray-50 h-80 animate-pulse">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl mb-6"></div>
                            <div className="h-6 bg-gray-100 rounded-full w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-50 rounded-full w-1/2 mb-8"></div>
                            <div className="h-12 bg-gray-100 rounded-2xl w-full"></div>
                        </div>
                    ))
                ) : filteredCoaches.map((coach) => (
                    <div
                        key={coach.id}
                        onClick={() => {
                            setSelectedPsychologist(coach);
                            setIsProfileDesktopOpen(true);
                        }}
                        className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden cursor-pointer"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#A68363]/5 rounded-bl-[60px] group-hover:bg-[#A68363]/10 transition-colors"></div>

                        <div className="flex justify-between items-start mb-6">
                            <div className="w-20 h-20 bg-[#A68363]/10 rounded-[2rem] flex items-center justify-center text-[#A68363] font-black text-3xl shadow-inner group-hover:scale-110 transition-transform">
                                {coach.fullName[0]}
                            </div>
                            <div className="flex items-center gap-1 bg-amber-50 px-4 py-2 rounded-full text-amber-600 font-black text-xs shadow-sm">
                                <Star className="h-3.5 w-3.5 fill-current" />
                                {coach.rating}
                            </div>
                        </div>

                        <div className="space-y-1 mb-6">
                            <h3 className={`text-2xl font-black transition-colors ${refId && (coach.id === refId || coach.userId === refId) ? "text-[#A68363]" : "text-[#4A3C31] group-hover:text-[#A68363]"}`}>
                                {coach.fullName}
                            </h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{coach.specialty}</p>
                        </div>

                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-8 font-medium">
                            {coach.description}
                        </p>

                        <div className="flex items-center justify-between pt-6 border-t border-gray-50 relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Desde</p>
                                <p className="text-xl font-black text-[#4A3C31]">${coach.price}<span className="text-xs text-gray-400 font-bold ml-1">/sesión</span></p>
                            </div>
                            <Button className="bg-[#4A3C31] hover:bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-2xl px-6 h-12 shadow-lg shadow-[#4A3C31]/20 transition-all active:scale-95">
                                Ver Perfil
                            </Button>
                        </div>
                    </div>
                ))}

                {!loading && filteredCoaches.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="h-10 w-10 text-gray-200" />
                        </div>
                        <h3 className="text-2xl font-black text-[#4A3C31] mb-2">No encontramos coincidencias</h3>
                        <p className="text-gray-400 font-medium max-w-xs mx-auto">Prueba buscando con otros términos o especialidades.</p>
                    </div>
                )}
            </div>

            <PsychologistProfileModal
                psychologist={selectedPsychologist}
                isOpen={isProfileDesktopOpen}
                onClose={() => setIsProfileDesktopOpen(false)}
                currentUser={currentUser}
            />
        </div>
    );
}
