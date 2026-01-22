"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"

interface TestCompletedModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TestCompletedModal({ isOpen, onOpenChange }: TestCompletedModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl">
                <div className="relative p-8 sm:p-10 bg-white text-center">

                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    </div>

                    <DialogTitle className="text-2xl sm:text-3xl font-black text-[#4A3C31] leading-tight mb-4">
                        Test ya completado
                    </DialogTitle>

                    <p className="text-gray-500 text-sm font-medium leading-relaxed mb-10 px-4">
                        Ya hemos analizado tu perfil y tenemos una selección personalizada de coaches para ti. No es necesario que repitas el test.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button
                            asChild
                            className="w-full bg-[#A68363] hover:bg-[#8C6B4D] text-white font-black py-7 rounded-2xl text-lg shadow-xl shadow-[#A68363]/20 transition-all hover:-translate-y-1 active:scale-95"
                        >
                            <Link href="/patient/search">
                                Ver psicólogos disponibles
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-gray-400 font-bold hover:text-[#4A3C31] transition-colors"
                        >
                            Cerrar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
