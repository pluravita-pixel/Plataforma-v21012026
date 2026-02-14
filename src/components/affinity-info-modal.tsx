"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Search, Calendar, Heart, X } from "lucide-react"
import Link from "next/link"

interface AffinityInfoModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AffinityInfoModal({ isOpen, onOpenChange }: AffinityInfoModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-2xl shadow-2xl">
                <DialogDescription className="sr-only">Información sobre cómo funciona nuestro proceso de acompañamiento.</DialogDescription>
                <div className="relative p-8 sm:p-10 bg-white">

                    <div className="text-center mb-10">
                        <DialogTitle className="text-2xl sm:text-3xl font-bold text-[#1F2937] leading-tight mb-6">
                            Encontrar a alguien que te escuche no debería ser complicado
                        </DialogTitle>
                        <p className="text-gray-500 text-sm leading-relaxed px-2">
                            En pluravita puedes comenzar tu proceso de acompañamiento 100% en línea, de forma fácil, segura y humana.
                        </p>
                    </div>

                    <div className="space-y-8 mb-10">
                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#F2EDE7] flex items-center justify-center">
                                <Search className="h-5 w-5 text-[#A68363]" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-[#1F2937]">Encuentra a tu oyente ideal</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Responde nuestro test de afinidad y te mostraremos una selección de oyentes que se ajusten a tus necesidades.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FFF5EB] flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-[#A68363]" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-[#1F2937]">Agenda en minutos</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Elige el día y la hora que mejor se adapte a tu rutina, realiza tu pago y recibe todos los detalles de tu cita al instante.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#F2EDE7] flex items-center justify-center">
                                <Heart className="h-5 w-5 text-[#A68363] fill-[#A68363]" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-[#1F2937]">Conéctate y comienza tu proceso</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    El día de tu cita, solo ingresa a tu cuenta de pluravita y conéctate por videollamada con tu oyente de manera fácil y privada.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => onOpenChange(false)}
                            className="w-full bg-[#A68363] hover:bg-[#8C6B4D] text-white font-bold py-6 rounded-lg text-lg shadow-lg shadow-[#A68363]/30"
                            asChild
                        >
                            <Link href="/affinity-test">Comenzar test de afinidad</Link>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
