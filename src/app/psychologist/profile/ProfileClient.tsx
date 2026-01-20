"use client";

import { useState } from "react";
import {
    User,
    Camera,
    BookOpen,
    Briefcase,
    Languages,
    Tag,
    Save,
    ExternalLink,
    Eye
} from "lucide-react";
import Image from "next/image";
import { updatePsychologistSettings } from "@/app/actions/psychologists";
import { toast } from "sonner";

interface ProfileClientProps {
    psychologist: {
        id: string;
        userId: string;
        fullName: string;
        description: string | null;
        specialty: string | null;
        experience: string | null;
        image: string | null;
        price: string | null;
        tags: string[] | null;
    };
}

export function ProfileClient({ psychologist }: ProfileClientProps) {
    const [profile, setProfile] = useState({
        fullName: psychologist.fullName,
        description: psychologist.description || "",
        specialty: psychologist.specialty || "Coach",
        experience: psychologist.experience || "0 años",
        image: psychologist.image || null,
        price: psychologist.price || "35.00",
        tags: psychologist.tags || []
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updatePsychologistSettings(psychologist.userId, {
                description: profile.description,
            });
            toast.success("Perfil actualizado con éxito");
        } catch (error) {
            toast.error("Error al actualizar el perfil");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Editar Perfil Público</h1>
                    <p className="text-gray-500 mt-1">Esta información será visible para tus pacientes potenciales.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all">
                        <Eye className="h-4 w-4" />
                        Vista Previa
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-[#A68363] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Picture and Quick Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            <div className="w-full h-full rounded-full bg-blue-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                                {profile.image ? (
                                    <Image src={profile.image} alt="Profile" fill className="object-cover" />
                                ) : (
                                    <User className="h-12 w-12 text-blue-200" />
                                )}
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-[#A68363] hover:text-[#4A3C31] transition-all">
                                <Camera className="h-4 w-4" />
                            </button>
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">{profile.fullName}</h3>
                        <p className="text-sm text-gray-500 mb-6">{profile.specialty}</p>

                        <div className="pt-6 border-t border-gray-50 space-y-4 text-left">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Briefcase className="h-4 w-4 text-gray-400" />
                                <span>{profile.experience} de experiencia</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Tag className="h-4 w-4 text-gray-400" />
                                <span>€{profile.price} / sesión</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#F2EDE7] p-6 rounded-2xl border border-[#F2EDE7]/50">
                        <div className="flex items-center gap-3 mb-4 text-[#A68363]">
                            <ExternalLink className="h-4 w-4" />
                            <h4 className="font-bold text-sm uppercase tracking-wider">Tu perfil público</h4>
                        </div>
                        <p className="text-xs text-[#4A3C31]/70 mb-4">Comparte este enlace con tus clientes para que puedan reservar directamente contigo.</p>
                        <code className="block bg-white p-3 rounded-lg text-xs font-mono text-[#A68363] border border-[#F2EDE7] truncate">
                            pluravita.com/coach/{psychologist.id.slice(0, 8)}
                        </code>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-8 border-b border-gray-50 pb-4">Información Profesional</h2>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Nombre Completo</label>
                                    <input
                                        type="text"
                                        readOnly
                                        className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
                                        value={profile.fullName}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Especialidad</label>
                                    <div className="relative">
                                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            readOnly
                                            className="w-full bg-gray-50 border-gray-100 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-400 cursor-not-allowed"
                                            value={profile.specialty}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">Descripción del perfil</label>
                                <textarea
                                    className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[150px]"
                                    value={profile.description}
                                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                                    placeholder="Cuéntanos sobre tu enfoque de coaching, especialidades y trayectoria..."
                                />
                                <p className="text-[10px] text-gray-400">Te recomendamos un mínimo de 300 caracteres para un perfil completo.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Precio por sesión (€)</label>
                                    <input
                                        type="text"
                                        readOnly
                                        className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
                                        value={profile.price}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Idiomas</label>
                                    <div className="relative">
                                        <Languages className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            className="w-full bg-gray-50 border-gray-100 rounded-xl pl-11 pr-4 py-3 text-sm"
                                            readOnly
                                            value="Español"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
