"use client";

import { useState, useEffect } from "react";
import { Search, Star, MessageSquare, Filter, SlidersHorizontal, Sparkles, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { getOyentes } from "@/app/actions/oyentes";
import { getCurrentUser } from "@/app/actions/auth";
import { BookingModal } from "@/components/booking/BookingModal";
import { ListenerProfileModal } from "@/components/oyente/ProfileModal";
import { useSearchParams } from "next/navigation";

import { Suspense } from "react";

function UsuarioSearchContent() {
    const searchParams = useSearchParams();
    const refId = searchParams.get("ref");

    const [listeners, setListeners] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedListener, setSelectedListener] = useState<any>(null);
    const [isProfileDesktopOpen, setIsProfileDesktopOpen] = useState(false);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [psychData, userData] = await Promise.all([
                    getOyentes(),
                    getCurrentUser()
                ]);
                setListeners(psychData);
                setCurrentUser(userData);

                if (refId && psychData) {
                    const referred = psychData.find((p: any) => p.id === refId || p.userId === refId || p.refCode === refId);
                    if (referred) {
                        setSelectedListener(referred);
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

    return (
        <div className="space-y-12 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="flex-1">
                    <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter uppercase mb-4">
                        Oyentes Disponibles
                    </h1>
                    <p className="text-black font-bold text-lg uppercase tracking-tight bg-accent inline-block px-4 py-1 neo-border">
                        A veces solo necesitamos a alguien que nos escuche
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20 mt-12">
                {loading ? (
                    [1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="neo-card bg-white border-gray-100 p-8 h-[400px]">
                            <div className="w-24 h-24 bg-gray-100 rounded-2xl mb-8 animate-pulse"></div>
                            <div className="h-10 bg-gray-100 rounded-xl w-3/4 mb-4 animate-pulse"></div>
                            <div className="h-4 bg-gray-50 rounded-lg w-1/2 mb-8 animate-pulse"></div>
                            <div className="mt-auto pt-6 border-t border-gray-100 flex justify-between">
                                <div className="h-8 bg-gray-100 rounded-lg w-24 animate-pulse"></div>
                                <div className="h-8 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
                            </div>
                        </div>
                    ))
                ) : listeners.map((listener, index) => (
                    <div
                        key={listener.id}
                        onClick={() => {
                            setSelectedListener(listener);
                            setIsProfileDesktopOpen(true);
                        }}
                        className="neo-card hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer group bg-white border-gray-100 p-8 flex flex-col h-full min-h-[420px]"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-24 h-24 bg-[#F2EDE7] rounded-[2rem] overflow-hidden neo-shadow-sm group-hover:bg-[#A68363] transition-colors relative border-2 border-white">
                                {listener.image ? (
                                    <Image
                                        src={listener.image}
                                        alt={listener.fullName}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover object-top"
                                        priority={index < 3}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#F2EDE7] text-[#A68363]">
                                        <UserCircle className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <h3 className={`text-3xl font-black uppercase leading-tight tracking-tighter ${refId && (listener.id === refId || listener.userId === refId) ? "text-[#A68363]" : "text-[#4A3C31]"}`}>
                                {listener.fullName}
                            </h3>
                            <p className="text-xs font-bold text-[#A68363] uppercase tracking-widest bg-[#F2EDE7] inline-block px-3 py-1 rounded-full">{listener.specialty}</p>
                        </div>

                        <p className="text-[#6B6B6B] text-sm leading-relaxed line-clamp-3 mb-8 font-medium">
                            {listener.description}
                        </p>

                        <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-100 relative z-10">
                            <div>
                                <p className="text-[10px] font-bold text-[#8C8C8C] uppercase tracking-widest">Desde</p>
                                <p className="text-2xl font-black text-[#4A3C31]">€{listener.price}<span className="text-[10px] font-bold ml-1 opacity-40">/SESIÓN</span></p>
                            </div>
                            <button className="neo-btn-black !px-6 !py-3 !text-[10px]">
                                Ver Perfil
                            </button>
                        </div>
                    </div>
                ))}

                {!loading && listeners.length === 0 && (
                    <div className="col-span-full py-20 text-center neo-card bg-white border-dashed border-2 border-gray-200">
                        <div className="w-24 h-24 bg-[#F2EDE7] rounded-[2rem] flex items-center justify-center mx-auto mb-6 neo-shadow-sm">
                            <Sparkles className="h-10 w-10 text-[#A68363]" />
                        </div>
                        <h3 className="text-3xl font-black text-[#4A3C31] uppercase tracking-tighter mb-4">No hay oyentes disponibles</h3>
                        <p className="text-[#6B6B6B] font-medium uppercase text-xs tracking-widest max-w-xs mx-auto">Vuelve más tarde para ver nuevos profesionales.</p>
                    </div>
                )}
            </div>

            <ListenerProfileModal
                listener={selectedListener}
                isOpen={isProfileDesktopOpen}
                onClose={() => setIsProfileDesktopOpen(false)}
                currentUser={currentUser}
            />
        </div>
    );
}

export default function UsuarioSearchPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin h-16 w-16 neo-border border-b-transparent"></div>
            </div>
        }>
            <UsuarioSearchContent />
        </Suspense>
    );
}
