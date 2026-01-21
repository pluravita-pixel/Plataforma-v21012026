"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Clock,
    User,
    FileText,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    Video,
    Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { completeAppointment } from "@/app/actions/psychologists";
import { FileUploader } from "@/components/files/FileUploader";

interface AppointmentDetailsClientProps {
    appointment: any;
    coachId: string;
}

export default function AppointmentDetailsClient({ appointment, coachId }: AppointmentDetailsClientProps) {
    const router = useRouter();
    const [notes, setNotes] = useState(appointment.psychologistNotes || "");
    const [tips, setTips] = useState(appointment.improvementTips || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleComplete = async () => {
        if (!notes.trim()) {
            toast.error("Por favor añade algunas notas antes de completar la sesión.");
            return;
        }

        setIsSubmitting(true);
        const result = await completeAppointment({
            id: appointment.id,
            notes,
            tips
        });

        setIsSubmitting(false);

        if (result.success) {
            toast.success("Sesión completada con éxito.");
            router.refresh();
        } else {
            toast.error(result.error || "Algo salió mal.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <Link
                href="/psychologist/dashboard"
                className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-[#A68363] transition-colors"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al panel
            </Link>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[#A68363]/10 flex items-center justify-center text-[#A68363] text-2xl font-black">
                            {appointment.patient.fullName[0]}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-[#4A3C31] tracking-tight">{appointment.patient.fullName}</h1>
                            <p className="text-gray-400 font-medium">{appointment.patient.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${appointment.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                            appointment.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                                'bg-amber-50 text-amber-700'
                            }`}>
                            {appointment.status === 'completed' ? 'Completada' :
                                appointment.status === 'cancelled' ? 'Cancelada' : 'Programada'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-gray-600">
                            <Clock className="h-5 w-5 text-[#A68363]" />
                            <span className="font-bold">{format(new Date(appointment.date), "EEEE d 'de' MMMM, HH:mm", { locale: es })}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <Video className="h-5 w-5 text-[#A68363]" />
                            <span className="font-bold">Sesión Online (50 min)</span>
                        </div>
                    </div>
                    {appointment.reason && (
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <p className="text-xs font-bold text-[#A68363] uppercase tracking-wider mb-1">Motivo de consulta</p>
                            <p className="text-sm text-gray-600 italic">"{appointment.reason}"</p>
                        </div>
                    )}
                </div>

                {appointment.status === 'scheduled' && (
                    <div className="flex gap-4">
                        <Button
                            onClick={() => window.open(`https://meet.jit.si/pluravita-${appointment.id}`, '_blank')}
                            className="flex-1 bg-[#4A3C31] hover:bg-[#2C241D] text-white font-bold h-12 rounded-xl shadow-lg shadow-[#4A3C31]/20"
                        >
                            <Video className="h-4 w-4 mr-2" />
                            Entrar a la sesión
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Notes and Tips Section */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-6 w-6 text-[#A68363]" />
                        <h2 className="text-2xl font-black text-[#4A3C31]">Notas y Progreso</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-bold text-[#4A3C31]">Notas de la sesión (Visibles para el paciente)</Label>
                            <Textarea
                                placeholder="Escribe aquí el resumen de la sesión..."
                                className="min-h-[150px] rounded-2xl bg-gray-50 border-gray-100 focus:border-[#A68363] focus:ring-[#A68363]/20"
                                value={notes}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                                disabled={appointment.status === 'completed'}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold text-[#4A3C31] flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-[#A68363]" />
                                Tips para mejorar (Accionables)
                            </Label>
                            <Textarea
                                placeholder="Ej: Practicar mindfulness 5 min al día, escribir en un diario..."
                                className="min-h-[100px] rounded-2xl bg-gray-50 border-gray-100 focus:border-[#A68363] focus:ring-[#A68363]/20"
                                value={tips}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTips(e.target.value)}
                                disabled={appointment.status === 'completed'}
                            />
                        </div>

                        {appointment.status === 'scheduled' && (
                            <div className="pt-4 flex gap-4">
                                <Button
                                    onClick={handleComplete}
                                    disabled={isSubmitting}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-emerald-600/20"
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    {isSubmitting ? "Completando..." : "Finalizar y Marcar como Completada"}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Files Section */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <FileUploader
                        appointmentId={appointment.id}
                        uploaderId={coachId}
                        existingFiles={appointment.files || []}
                    />
                </div>
            </div>
        </div>
    );
}

