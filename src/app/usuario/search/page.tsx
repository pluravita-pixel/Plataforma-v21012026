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

function PatientSearchContent() {
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
                    [1, 2, 3].map(i => (
                        <div key={i} className="neo-card bg-white h-96 animate-pulse">
                            <div className="w-20 h-20 bg-gray-200 neo-border mb-6"></div>
                            <div className="h-8 bg-gray-200 neo-border w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-100 neo-border w-1/2 mb-8"></div>
                            <div className="h-16 bg-gray-200 neo-border w-full"></div>
                        </div>
                    ))
                ) : listeners.map((listener) => (
                    <div
                        key={listener.id}
                        onClick={() => {
                            setSelectedListener(listener);
                            setIsProfileDesktopOpen(true);
                        }}
                        className="neo-card hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer group bg-white"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-24 h-24 bg-primary neo-border overflow-hidden neo-shadow-sm group-hover:bg-accent transition-colors">
                                <Image
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${listener.email || listener.fullName}`}
                                    alt={listener.fullName}
                                    width={96}
                                    height={96}
                                    className="object-cover"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <h3 className={`text-3xl font-black uppercase leading-tight ${refId && (listener.id === refId || listener.userId === refId) ? "text-accent" : "text-black"}`}>
                                {listener.fullName}
                            </h3>
                            <p className="text-sm font-black text-black/60 uppercase tracking-widest bg-gray-100 inline-block px-2">{listener.specialty}</p>
                        </div>

                        <p className="text-black text-base leading-snug line-clamp-3 mb-10 font-bold uppercase tracking-tight">
                            {listener.description}
                        </p>

                        <div className="flex items-center justify-between pt-6 neo-border-t border-t-4 border-black relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">Desde</p>
                                <p className="text-2xl font-black text-black">€{listener.price}<span className="text-xs font-bold ml-1">/SESIÓN</span></p>
                            </div>
                            <button className="neo-btn-black">
                                Ver Perfil
                            </button>
                        </div>
                    </div>
                ))}

                {!loading && listeners.length === 0 && (
                    <div className="col-span-full py-20 text-center neo-card bg-secondary/20">
                        <div className="w-24 h-24 bg-white neo-border flex items-center justify-center mx-auto mb-6 neo-shadow">
                            <Sparkles className="h-12 w-12 text-black" />
                        </div>
                        <h3 className="text-4xl font-black text-black uppercase mb-4">No hay oyentes disponibles</h3>
                        <p className="text-black font-bold uppercase max-w-xs mx-auto">Vuelve más tarde para ver nuevos profesionales.</p>
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
