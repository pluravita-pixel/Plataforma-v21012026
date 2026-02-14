"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Languages } from "lucide-react";
import Image from "next/image";
import { BookingModal } from "@/components/booking/BookingModal";

interface ListenerProfileModalProps {
    listener: any;
    isOpen: boolean;
    onClose: () => void;
    currentUser: any | null;
}

export function ListenerProfileModal({ listener: psychologist, isOpen, onClose, currentUser }: ListenerProfileModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-4xl p-0 bg-white overflow-hidden rounded-[2.5rem] border-none shadow-2xl h-[90vh] md:h-auto flex flex-col md:flex-row">
                {!psychologist ? (
                    <div className="p-20 text-center w-full">Cargando perfil...</div>
                ) : (
                    <>
                        {/* Left Side: Visual & Quick Info */}
                        <div className="w-full md:w-[40%] bg-[#F2EDE7] p-8 md:p-10 flex flex-col items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-20 -mt-20"></div>

                            <div className="relative w-40 h-40 mb-6 bg-white p-1 rounded-[2.5rem] shadow-xl shadow-[#A68363]/10">
                                {psychologist.image ? (
                                    <Image
                                        src={psychologist.image}
                                        alt={psychologist.fullName}
                                        fill
                                        priority
                                        className="object-cover rounded-[2rem] object-top"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#A68363]/10 rounded-[2rem] flex items-center justify-center text-[#A68363] text-5xl font-black">
                                        {psychologist.fullName[0]}
                                    </div>
                                )}
                            </div>

                            <h2 className="text-2xl font-black text-[#4A3C31] mb-2 leading-tight">
                                {psychologist.fullName}
                            </h2>
                            <p className="text-[#A68363] font-bold uppercase tracking-widest text-xs mb-6">
                                {psychologist.specialty}
                            </p>

                            <div className="flex flex-wrap justify-center gap-2 mb-8">
                                {psychologist.tags?.map((tag: string) => (
                                    <span key={tag} className="px-3 py-1 bg-white/60 rounded-lg text-[10px] font-bold text-[#4A3C31] uppercase tracking-wider">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-auto w-full space-y-3">
                                <div className="bg-white/50 p-4 rounded-2xl flex items-center justify-between">
                                    <div className="text-left">
                                        <p className="text-[10px] uppercase font-bold text-gray-400">Precio Sesión</p>
                                        <p className="text-xl font-black text-[#4A3C31]">{psychologist.price}€</p>
                                    </div>
                                    <BookingModal
                                        listenerId={psychologist.id}
                                        listenerName={psychologist.fullName}
                                        price={Number(psychologist.price)}
                                        currentUser={currentUser}
                                        defaultOpen={false}
                                        customTrigger={
                                            <Button className="bg-[#4A3C31] hover:bg-black text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#4A3C31]/20">
                                                Reservar
                                            </Button>
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Details */}
                        <div className="flex-1 p-8 md:p-10 overflow-y-auto">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-black text-[#4A3C31] mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-[#A68363]/10 flex items-center justify-center text-[#A68363]">
                                            <Languages className="h-4 w-4" />
                                        </span>
                                        Idiomas
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {psychologist.languages?.map((lang: string) => (
                                            <span key={lang} className="px-4 py-2 border border-gray-100 rounded-xl text-sm font-bold text-gray-600">
                                                {lang}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-black text-[#4A3C31] mb-4">Sobre mí</h3>
                                    <p className="text-gray-500 leading-relaxed font-medium text-sm md:text-base mb-6">
                                        {psychologist.description || "Este especialista aún no ha añadido una descripción detallada."}
                                    </p>

                                    {psychologist.studies && (
                                        <div className="mb-6">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Formación</h4>
                                            <p className="text-sm font-bold text-[#4A3C31]">{psychologist.studies}</p>
                                        </div>
                                    )}
                                </div>

                                {psychologist.benefits && psychologist.benefits.length > 0 && (
                                    <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100">
                                        <h4 className="font-bold text-[#A68363] mb-4 text-sm uppercase tracking-wider">¿Por qué elegirme?</h4>
                                        <ul className="space-y-3">
                                            {psychologist.benefits.map((benefit: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-amber-900 font-medium">
                                                    <CheckCircle2 className="h-4 w-4 text-[#A68363] mt-0.5 shrink-0" />
                                                    {benefit}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
