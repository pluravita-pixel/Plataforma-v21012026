"use client";

import { useState } from "react";
import {
    Search,
    Filter,
    MoreVertical,
    MessageSquare,
    History,
    AlertTriangle,
    X,
    Check
} from "lucide-react";
import { cancelAppointmentByPsychologist } from "@/app/actions/psychologists";
import { useRouter } from "next/navigation";

interface Patient {
    id: string;
    fullName: string | null;
    email: string;
    lastSession: Date;
    reason: string | null;
    status: string;
    nextAppointmentId?: string; // New field
    nextAppDate?: Date;
    isAnonymous?: boolean;
}

export function PatientsClient({ initialPatients, psychologistId }: { initialPatients: Patient[], psychologistId: string }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [showCancelModal, setShowCancelModal] = useState<string | null>(null); // Stores appointmentId to cancel
    const [isCancelling, setIsCancelling] = useState(false);
    const router = useRouter();

    const filteredPatients = initialPatients.filter(patient =>
        (patient.fullName && patient.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleCancel = async () => {
        if (!showCancelModal) return;
        setIsCancelling(true);
        const res = await cancelAppointmentByPsychologist(showCancelModal, psychologistId); // We need psychologistId here. Pass it as prop.
        setIsCancelling(false);
        if (res.success) {
            alert(res.success); // Simple alert for now, or toast
            setShowCancelModal(null);
            router.refresh();
        } else {
            alert(res.error || "Error al cancelar");
        }
    };

    return (
        <div className="space-y-8 font-sans" onClick={() => setActiveMenu(null)}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#4A3C31]">Mis Pacientes</h1>
                    <p className="text-gray-500 mt-1 font-medium">Gestiona tus consultas y notas de sesión.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar paciente..."
                            className="bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A68363]/20 transition-all w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Patients List */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-visible">
                <div className="overflow-visible">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#FAF8F5] border-b border-gray-100 first:rounded-t-[2rem]">
                                <th className="px-6 py-5 text-xs font-black text-[#A68363] uppercase tracking-wider">Paciente</th>
                                <th className="px-6 py-5 text-xs font-black text-[#A68363] uppercase tracking-wider">Motivo</th>
                                <th className="px-6 py-5 text-xs font-black text-[#A68363] uppercase tracking-wider">Última Sesión</th>
                                <th className="px-6 py-5 text-xs font-black text-[#A68363] uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-5 text-xs font-black text-[#A68363] uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredPatients.length > 0 ? (
                                filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-[#FAF8F5]/50 transition-colors group relative">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#A68363]/10 flex items-center justify-center font-black text-[#A68363]">
                                                    {patient.fullName ? patient.fullName.split(' ').map((n: string) => n[0]).join('') : 'P'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#4A3C31]">{patient.fullName || 'Sin nombre'}</p>
                                                    <p className="text-xs text-gray-400 font-medium">{patient.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 line-clamp-1 italic">"{patient.reason || "Sin especificar"}"</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                            {new Date(patient.lastSession).toLocaleDateString("es-ES", { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${patient.status === 'Activo' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'
                                                }`}>
                                                {patient.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            {!patient.isAnonymous ? (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveMenu(activeMenu === patient.id ? null : patient.id);
                                                        }}
                                                        className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-[#A68363] shadow-sm border border-transparent hover:border-gray-100 transition-all"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    {activeMenu === patient.id && (
                                                        <div className="absolute right-12 top-8 z-50 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in duration-200 origin-top-right">
                                                            <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                                                <p className="text-xs font-bold text-gray-400">Acciones</p>
                                                            </div>
                                                            <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-[#FAF8F5] hover:text-[#4A3C31] font-medium transition-colors">
                                                                Ver expediente
                                                            </button>
                                                            {patient.nextAppointmentId && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setShowCancelModal(patient.nextAppointmentId!);
                                                                        setActiveMenu(null);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-medium transition-colors"
                                                                >
                                                                    Cancelar próxima cita
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-gray-300 text-xs italic">Privado</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic font-medium">
                                        No hay pacientes registrados actualmente.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl space-y-6">
                        <div className="flex items-center gap-4 text-amber-500 bg-amber-50 p-4 rounded-2xl">
                            <AlertTriangle className="h-8 w-8" />
                            <div>
                                <h3 className="font-bold text-[#4A3C31]">¿Cancelar sesión?</h3>
                                <p className="text-xs text-amber-700 font-medium opacity-80">Acción irreversible</p>
                            </div>
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed font-medium">
                            ¿Seguro que quieres cancelar la sesión? <br />
                            <span className="text-emerald-600 font-bold block mt-2">
                                Se devolverá la cantidad entera al paciente automáticamente.
                            </span>
                            <span className="text-xs text-gray-400 mt-2 block">
                                Esta acción quedará registrada en tu historial y podría conllevar penalizaciones si es recurrente.
                            </span>
                        </p>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowCancelModal(null)}
                                className="flex-1 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-xl transition-all"
                                disabled={isCancelling}
                            >
                                Volver
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isCancelling}
                                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {isCancelling ? 'Cancelando...' : 'Sí, cancelar cita'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Section (Redesigned) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center group hover:border-[#A68363]/30 transition-all cursor-pointer">
                    <div className="w-16 h-16 bg-[#F9F5F1] rounded-full flex items-center justify-center text-[#A68363] mb-4 group-hover:scale-110 transition-transform">
                        <History className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-[#4A3C31] text-lg">Historial de Pacientes</h3>
                    <p className="text-sm text-gray-400 mt-2 max-w-xs font-medium">
                        Selecciona un paciente para ver su historial completo.
                    </p>
                </div>
            </div>
        </div>
    );
}
