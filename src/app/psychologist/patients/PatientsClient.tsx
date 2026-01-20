"use client";

import { useState } from "react";
import {
    Search,
    Filter,
    MoreVertical,
    MessageSquare,
    History,
    FileText,
    Brain
} from "lucide-react";

interface Patient {
    id: string;
    fullName: string | null;
    email: string;
    lastSession: Date;
    reason: string | null;
    status: string;
}

export function PatientsClient({ initialPatients }: { initialPatients: Patient[] }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredPatients = initialPatients.filter(patient =>
        patient.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mis Pacientes</h1>
                    <p className="text-gray-500 mt-1">Gestiona tus consultas y notas de sesión.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar paciente..."
                            className="bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
                        <Filter className="h-4 w-4" />
                        Filtros
                    </button>
                </div>
            </div>

            {/* Patients List */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Paciente</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Motivo de consulta</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Última Sesión</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPatients.length > 0 ? (
                                filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600">
                                                    {patient.fullName ? patient.fullName.split(' ').map((n: string) => n[0]).join('') : 'P'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{patient.fullName || 'Sin nombre'}</p>
                                                    <p className="text-xs text-gray-500">{patient.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 line-clamp-1">{patient.reason || "Sin especificar"}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(patient.lastSession).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${patient.status === 'Activo' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                                                }`}>
                                                {patient.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    title="Notas de sesión"
                                                    className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-[#0077FF] shadow-sm border border-transparent hover:border-gray-100 transition-all"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </button>
                                                <button
                                                    title="Resumen IA"
                                                    className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-purple-600 shadow-sm border border-transparent hover:border-gray-100 transition-all"
                                                >
                                                    <Brain className="h-4 w-4" />
                                                </button>
                                                <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-gray-600 shadow-sm border border-transparent hover:border-gray-100 transition-all">
                                                    <MoreVertical className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                        No hay pacientes registrados actualmente con esos criterios.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* AI Session Analysis (Preview) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#F8FAFF] p-8 rounded-3xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-[#0077FF]">
                            <Brain className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Análisis Inteligente de Sesiones</h3>
                            <p className="text-xs text-gray-500">Impulsado por pluravita AI</p>
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                        Nuestra IA analiza tus notas de sesión para identificar patrones emocionales,
                        temas recurrentes y sugerir puntos de enfoque para la próxima cita.
                    </p>
                    <button className="w-full bg-white text-[#0077FF] border border-blue-200 font-bold py-3 rounded-xl text-sm hover:bg-blue-50 transition-all shadow-sm">
                        Configurar pluravita AI
                    </button>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                        <History className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-gray-900">Historial de Pacientes</h3>
                    <p className="text-sm text-gray-500 mt-2 max-w-xs">
                        Selecciona un paciente para ver su historial completo de citas y notas compartidas.
                    </p>
                </div>
            </div>
        </div>
    );
}
