"use client";

import { useState, useEffect } from "react";
import {
    Calendar,
    Clock,
    X,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getAllPatientAppointments, cancelAppointment } from "@/app/actions/patient";

export default function PatientAppointmentsPage() {
    const router = useRouter();
    const [allAppointments, setAllAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [appointmentToCancel, setAppointmentToCancel] = useState<any>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const data = await getAllPatientAppointments();
            setAllAppointments(data);
            setIsLoading(false);
        }
        loadData();
    }, []);

    const handleCancel = async () => {
        if (!appointmentToCancel) return;
        setIsCancelling(true);
        const result = await cancelAppointment(appointmentToCancel.id);
        setIsCancelling(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.message || "Cita cancelada con éxito.");
            setAllAppointments(prev => prev.filter(a => a.id !== appointmentToCancel.id));
        }
        setShowCancelModal(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-4xl font-black text-[#4A3C31] tracking-tight flex items-center gap-3">
                    <Calendar className="h-10 w-10 text-[#A68363]" />
                    MIS CITAS
                </h1>
                <p className="text-[#8C8C8C] mt-2 font-medium text-lg uppercase tracking-widest text-xs">Gestiona tus próximas sesiones programadas</p>
            </div>

            <div className="space-y-6">
                {isLoading ? (
                    <div className="bg-white p-20 rounded-[3rem] border border-gray-100 shadow-sm text-center">
                        <div className="animate-spin w-12 h-12 border-4 border-[#A68363] border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando tus citas...</p>
                    </div>
                ) : allAppointments.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {allAppointments.map((appointment) => (
                            <div key={appointment.id} className="bg-white rounded-[2.5rem] p-1 border border-gray-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group">
                                <div className="flex flex-col md:flex-row">
                                    {/* Date/Time Section */}
                                    <div className="bg-[#4A3C31] text-white p-8 md:w-64 flex flex-col justify-center items-center text-center">
                                        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-2">Fecha</p>
                                        <p className="text-3xl font-black mb-1">{format(new Date(appointment.date), "dd")}</p>
                                        <p className="text-sm font-bold uppercase mb-4">{format(new Date(appointment.date), "MMMM", { locale: es })}</p>
                                        <div className="h-px w-12 bg-white/20 mb-4"></div>
                                        <div className="flex items-center gap-2 font-bold text-lg">
                                            <Clock className="h-4 w-4 opacity-60" />
                                            {format(new Date(appointment.date), "HH:mm")}
                                        </div>
                                    </div>

                                    {/* Info Section */}
                                    <div className="flex-1 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 rounded-2xl bg-[#A68363]/10 flex items-center justify-center text-[#A68363] text-3xl font-black shadow-inner">
                                                {appointment.psychologist.fullName[0]}
                                            </div>
                                            <div>
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                    Confirmada
                                                </div>
                                                <p className="text-2xl font-black text-[#4A3C31] mb-1">{appointment.psychologist.fullName}</p>
                                                <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">Sesión Online Individual</p>
                                                {appointment.reason && (
                                                    <p className="mt-3 text-sm text-gray-500 italic bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                        "{appointment.reason}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3">
                                            {new Date() < new Date(new Date(appointment.date).getTime() + 60 * 60 * 1000) ? (
                                                <Button
                                                    onClick={() => router.push(`/session/${appointment.id}`)}
                                                    className="bg-[#4A3C31] hover:bg-black text-white font-black uppercase tracking-tighter rounded-2xl px-8 h-14 shadow-xl shadow-[#4A3C31]/20 transition-all hover:-translate-y-1 active:scale-95"
                                                >
                                                    Ir a Sesión
                                                </Button>
                                            ) : (
                                                <div className="flex items-center justify-center bg-gray-100 text-gray-400 font-bold rounded-2xl px-8 h-14 uppercase tracking-wider text-xs border border-gray-200 cursor-not-allowed">
                                                    Finalizada
                                                </div>
                                            )}
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setAppointmentToCancel(appointment);
                                                    setShowCancelModal(true);
                                                }}
                                                className="border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 font-bold rounded-2xl px-6 h-14 transition-all"
                                            >
                                                Cancelar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-20 rounded-[4rem] border border-gray-100 shadow-sm text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <Calendar className="h-12 w-12 text-gray-200" />
                        </div>
                        <h3 className="text-3xl font-black text-[#4A3C31] mb-3">No tienes citas próximas</h3>
                        <p className="text-gray-400 max-w-sm mx-auto mb-10 font-medium">Parece que aún no tienes sesiones programadas. ¿Estás listo para dar el siguiente paso?</p>
                        <Button
                            asChild
                            className="bg-[#A68363] hover:bg-black text-white font-black uppercase tracking-widest text-xs rounded-2xl px-12 h-14 shadow-xl shadow-[#A68363]/20 transition-all hover:-translate-y-1"
                        >
                            <Link href="/patient/search">Explorar Coaches</Link>
                        </Button>
                    </div>
                )}
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300" onClick={() => setShowCancelModal(false)} />
                    <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 animate-in zoom-in-95 duration-300">
                        <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-gray-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
                                    <AlertCircle className="h-8 w-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-[#4A3C31] tracking-tight">Cancelar Cita</h3>
                                    <p className="text-sm text-gray-400 font-bold">¿Estás completamente seguro?</p>
                                </div>
                            </div>

                            <p className="text-gray-500 mb-8 leading-relaxed font-medium">
                                Al cancelar, se aplicará nuestra política de reembolso del <strong>50%</strong>. Esta acción no se puede deshacer.
                            </p>

                            <div className="flex gap-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1 h-14 rounded-2xl font-bold text-gray-400 hover:bg-gray-50"
                                >
                                    Volver
                                </Button>
                                <Button
                                    onClick={handleCancel}
                                    disabled={isCancelling}
                                    className="flex-1 h-14 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-red-200 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                                >
                                    {isCancelling ? "Cancelando..." : "Sí, Cancelar"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
