"use client";

import { useState } from "react";
import {
    UserPlus,
    AtSign,
    User,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ArrowRight
} from "lucide-react";
import { createPsychologistProfile } from "@/app/actions/admin";

export default function AddPsychologistPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        const res = await createPsychologistProfile(name, email);
        setResult(res);
        setLoading(false);

        if (res.success) {
            setName("");
            setEmail("");
        }
    };

    return (
        <div className="max-w-4xl">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                    <div className="p-3 bg-gray-100 text-black neo-border shadow-sm">
                        <UserPlus className="h-8 w-8" />
                    </div>
                    AÑADIR COACH
                </h1>
                <p className="text-gray-500 mt-4 text-lg max-w-2xl leading-relaxed">
                    Crea un perfil profesional en la base de datos. El sistema habilitará automáticamente el acceso de coach para este correo electrónico.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-white p-10 neo-border neo-shadow">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <User className="h-3 w-3" />
                                Nombre Completo
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full bg-gray-50 border-2 border-black focus:bg-white px-6 py-4 text-base font-bold transition-all outline-none"
                                placeholder="P. ej. Dr. Alberto Mendoza"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <AtSign className="h-3 w-3" />
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full bg-gray-50 border-2 border-black focus:bg-white px-6 py-4 text-base font-bold transition-all outline-none"
                                placeholder="correo@coach.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {result?.success && (
                            <div className="p-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 animate-in fade-in slide-in-from-bottom-2">
                                <CheckCircle2 className="h-5 w-5 shrink-0" />
                                <p className="text-sm font-bold">Perfil creado correctamente y permisos asignados.</p>
                            </div>
                        )}

                        {result?.error && (
                            <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-bottom-2">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <p className="text-sm font-bold">{result.error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white font-black py-5 hover:bg-gray-800 transition-all flex items-center justify-center gap-3 neo-border-4 neo-shadow uppercase tracking-widest text-sm disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Crear Perfil Profesional
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="space-y-6">
                    <div className="bg-gray-100 p-10 neo-border neo-shadow text-black">
                        <h3 className="text-xl font-black mb-6 uppercase tracking-tight">Información de Seguridad</h3>
                        <div className="text-black/80 leading-relaxed mb-8 flex items-start gap-4 font-bold">
                            <div className="mt-1 p-2 bg-white neo-border">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                            Al añadir un coach, este se marcará con acceso especial en el sistema.
                        </div>
                        <div className="text-black/80 leading-relaxed flex items-start gap-4 font-bold">
                            <div className="mt-1 p-2 bg-white neo-border">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                            Si el usuario ya estaba registrado como paciente, su cuenta se convertirá automáticamente.
                        </div>
                    </div>

                    <div className="bg-white neo-border neo-border-dashed p-8 text-center">
                        <p className="text-gray-400 font-bold text-sm uppercase">Próximamente: Invitación automática</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
