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

import { Suspense } from "react";

function PatientSearchContent() {
    const [coaches, setCoaches] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const searchParams = useSearchParams();
    const refId = searchParams.get("ref");

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
        <div className="space-y-12 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="flex-1">
                    <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter uppercase mb-4">
                        Buscar Coach
                    </h1>
                    <p className="text-black font-bold text-lg uppercase tracking-tight bg-accent inline-block px-4 py-1 neo-border">
                        Encuentra al profesional ideal para tu proceso
                    </p>

                    <div className="mt-10 relative max-w-2xl group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-black z-10" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="BUSCAR POR NOMBRE O ESPECIALIDAD..."
                            className="neo-input h-20 pl-16 pr-8 text-xl neo-shadow-sm uppercase"
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <button className="neo-btn bg-white hover:bg-gray-100 flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtros
                    </button>
                    <button className="neo-btn bg-white hover:bg-gray-100 flex items-center gap-2">
                        <SlidersHorizontal className="h-5 w-5" />
                        Ordenar
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="neo-card bg-white h-96 animate-pulse">
                            <div className="w-20 h-20 bg-gray-200 neo-border mb-6"></div>
                            <div className="h-8 bg-gray-200 neo-border w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-100 neo-border w-1/2 mb-8"></div>
                            <div className="h-16 bg-gray-200 neo-border w-full"></div>
                        </div>
                    ))
                ) : filteredCoaches.map((coach) => (
                    <div
                        key={coach.id}
                        onClick={() => {
                            setSelectedPsychologist(coach);
                            setIsProfileDesktopOpen(true);
                        }}
                        className="neo-card hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer group bg-white"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-24 h-24 bg-primary neo-border flex items-center justify-center text-black font-black text-4xl neo-shadow-sm group-hover:bg-accent transition-colors">
                                {coach.fullName[0]}
                            </div>
                            <div className="flex items-center gap-1 bg-secondary px-4 py-2 neo-border text-black font-black text-sm neo-shadow-sm">
                                <Star className="h-4 w-4 fill-black" />
                                {coach.rating}
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <h3 className={`text-3xl font-black uppercase leading-tight ${refId && (coach.id === refId || coach.userId === refId) ? "text-accent" : "text-black"}`}>
                                {coach.fullName}
                            </h3>
                            <p className="text-sm font-black text-black/60 uppercase tracking-widest bg-gray-100 inline-block px-2">{coach.specialty}</p>
                        </div>

                        <p className="text-black text-base leading-snug line-clamp-3 mb-10 font-bold uppercase tracking-tight">
                            {coach.description}
                        </p>

                        <div className="flex items-center justify-between pt-6 neo-border-t border-t-4 border-black relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">Desde</p>
                                <p className="text-2xl font-black text-black">€{coach.price}<span className="text-xs font-bold ml-1">/SESIÓN</span></p>
                            </div>
                            <button className="neo-btn-black">
                                Ver Perfil
                            </button>
                        </div>
                    </div>
                ))}

                {!loading && filteredCoaches.length === 0 && (
                    <div className="col-span-full py-20 text-center neo-card bg-secondary/20">
                        <div className="w-24 h-24 bg-white neo-border flex items-center justify-center mx-auto mb-6 neo-shadow">
                            <Sparkles className="h-12 w-12 text-black" />
                        </div>
                        <h3 className="text-4xl font-black text-black uppercase mb-4">Sin coincidencias</h3>
                        <p className="text-black font-bold uppercase max-w-xs mx-auto">Prueba buscando con otros términos o especialidades.</p>
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

export default function PatientSearchPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin h-16 w-16 neo-border border-b-transparent"></div>
            </div>
        }>
            <PatientSearchContent />
        </Suspense>
    );
}
