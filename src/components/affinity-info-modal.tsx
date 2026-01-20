"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
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
                <div className="relative p-8 sm:p-10 bg-white">

                    <div className="text-center mb-10">
                        <DialogTitle className="text-2xl sm:text-3xl font-bold text-[#1F2937] leading-tight mb-6">
                            Ir a terapia no debería de ser complicado
                        </DialogTitle>
                        <p className="text-gray-500 text-sm leading-relaxed px-2">
                            En pluravita puedes comenzar tu proceso de coaching 100% en línea, de forma fácil, segura y profesional.
                        </p>
                    </div>

                    <div className="space-y-8 mb-10">
                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <Search className="h-5 w-5 text-[#0077FF]" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-[#1F2937]">Encuentra tu coach ideal</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Responde nuestro test de afinidad y te mostraremos una selección de coaches que se ajusten a tus necesidades.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-indigo-500" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-[#1F2937]">Agenda en minutos</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Elige el día y la hora que mejor se adapte a tu rutina, realiza tu pago y recibe todos los detalles de tu cita al instante.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <Heart className="h-5 w-5 text-[#0077FF] fill-[#0077FF]" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-[#1F2937]">Conéctate y comienza tu proceso</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    El día de tu cita, solo ingresa a tu cuenta de pluravita y conéctate por videollamada con tu coach de manera fácil y privada.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => onOpenChange(false)}
                            className="w-full bg-[#0077FF] hover:bg-[#0066CC] text-white font-bold py-6 rounded-lg text-lg shadow-lg shadow-blue-500/30"
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
