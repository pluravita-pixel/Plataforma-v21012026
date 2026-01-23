"use client";

import { useEffect, useState } from "react";
import {
    User,
    Camera,
    BookOpen,
    Languages,
    Tag,
    Save,
    Eye,
    Copy,
    Check,
    X
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
        username: string | null;
        image: string | null;
        price: string | null;
        languages: string[] | null;
        tags: string[] | null;
        refCode?: string | null;
    };
}

const AVAILABLE_LANGUAGES = ["Español", "Inglés", "Francés", "Alemán"];

export function ProfileClient({ psychologist }: ProfileClientProps) {
    const [profile, setProfile] = useState({
        fullName: psychologist.fullName,
        description: psychologist.description || "",
        specialty: psychologist.specialty || "Coach",
        username: psychologist.username || "",
        image: psychologist.image || "",
        price: psychologist.price || "35.00",
        languages: psychologist.languages || ["Español"],
        tags: psychologist.tags || []
    });
    const [newTag, setNewTag] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [copied, setCopied] = useState(false);
    const [baseUrl, setBaseUrl] = useState("");

    useEffect(() => {
        setBaseUrl(window.location.origin);
    }, []);

    const publicUrl = psychologist.refCode
        ? `${baseUrl}/api/ref/${psychologist.refCode}`
        : `${baseUrl}/patient/search?search=${profile.username || 'tu-username'}`;

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        toast.success("URL copiada al portapapeles");
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleLanguage = (lang: string) => {
        if (profile.languages.includes(lang)) {
            setProfile({
                ...profile,
                languages: profile.languages.filter(l => l !== lang)
            });
        } else {
            setProfile({
                ...profile,
                languages: [...profile.languages, lang]
            });
        }
    };

    const addTag = () => {
        if (newTag.trim() && !profile.tags.includes(newTag.trim())) {
            setProfile({
                ...profile,
                tags: [...profile.tags, newTag.trim()]
            });
            setNewTag("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setProfile({
            ...profile,
            tags: profile.tags.filter(t => t !== tagToRemove)
        });
    };

    const handleSave = async () => {
        if (!profile.username || profile.username.trim() === "") {
            toast.error("El nombre de usuario es obligatorio");
            return;
        }

        if (profile.languages.length === 0) {
            toast.error("Selecciona al menos un idioma");
            return;
        }

        setIsSaving(true);
        try {
            await updatePsychologistSettings(psychologist.userId, {
                description: profile.description,
                specialty: profile.specialty,
                price: profile.price,
                username: profile.username.toLowerCase().replace(/\s+/g, '-'),
                languages: profile.languages,
                tags: profile.tags,
                image: profile.image || undefined
            });
            toast.success("Perfil actualizado con éxito");
        } catch (error) {
            toast.error("Error al actualizar el perfil");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="space-y-8 pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Perfil Público</h1>
                        <p className="text-gray-500 mt-1">Esta información será visible para tus pacientes potenciales.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowPreview(true)}
                            className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
                        >
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
                                <div className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-[#A68363]">
                                    <Camera className="h-4 w-4" />
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <label className="text-[10px] uppercase font-bold text-gray-400 block">URL de Imagen</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[10px] focus:ring-1 focus:ring-[#A68363] transition-all"
                                    placeholder="https://ejemplo.com/tu-foto.jpg"
                                    value={profile.image}
                                    onChange={(e) => setProfile({ ...profile, image: e.target.value })}
                                />
                            </div>

                            <h3 className="font-bold text-gray-900 text-lg">{profile.fullName}</h3>
                            <p className="text-sm text-gray-500 mb-6">{profile.specialty}</p>

                            <div className="pt-6 border-t border-gray-50 space-y-4 text-left">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Tag className="h-4 w-4 text-gray-400" />
                                    <span>€{profile.price} / sesión</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Languages className="h-4 w-4 text-gray-400" />
                                    <span>{profile.languages.join(", ")}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#F2EDE7] p-6 rounded-2xl border border-[#F2EDE7]/50">
                            <div className="flex items-center gap-3 mb-4 text-[#A68363]">
                                <Copy className="h-4 w-4" />
                                <h4 className="font-bold text-sm uppercase tracking-wider">Tu perfil público</h4>
                            </div>
                            <p className="text-xs text-[#4A3C31]/70 mb-4">Comparte este enlace con tus clientes para que puedan reservar directamente contigo.</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-white p-3 rounded-lg text-xs font-mono text-[#A68363] border border-[#F2EDE7] truncate">
                                    {publicUrl}
                                </code>
                                <button
                                    onClick={handleCopyUrl}
                                    className="p-3 bg-white rounded-lg border border-[#F2EDE7] hover:bg-[#A68363] hover:text-white transition-all"
                                >
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
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
                                        <p className="px-4 py-3 text-sm text-gray-800 font-bold bg-gray-50/50 rounded-xl border border-gray-100">
                                            {profile.fullName}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-600">Nombre de Usuario *</label>
                                        <input
                                            type="text"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#A68363]/20 transition-all"
                                            value={profile.username}
                                            onChange={(e) => setProfile({ ...profile, username: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                            placeholder="tu-nombre-unico"
                                        />
                                        <p className="text-[10px] text-gray-400">Este será tu URL público: pluravita.com/{profile.username || 'tu-username'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-600">Especialidad *</label>
                                        <div className="relative">
                                            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#A68363]/20 transition-all"
                                                value={profile.specialty}
                                                onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
                                                placeholder="Ej: Coach de Vida, Coach Ejecutivo"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-600">Precio por sesión (€) *</label>
                                        <div className="relative">
                                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#A68363]/20 transition-all"
                                                value={profile.price}
                                                onChange={(e) => setProfile({ ...profile, price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Descripción del perfil *</label>
                                    <textarea
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#A68363]/20 transition-all min-h-[150px]"
                                        value={profile.description}
                                        onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                                        placeholder="Cuéntanos sobre tu enfoque de coaching, especialidades y trayectoria..."
                                    />
                                    <p className="text-[10px] text-gray-400">Te recomendamos un mínimo de 300 caracteres para un perfil completo.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Idiomas *</label>
                                    <div className="flex flex-wrap gap-3">
                                        {AVAILABLE_LANGUAGES.map((lang) => (
                                            <button
                                                key={lang}
                                                type="button"
                                                onClick={() => toggleLanguage(lang)}
                                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${profile.languages.includes(lang)
                                                    ? 'bg-[#A68363] text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-400">Selecciona todos los idiomas en los que puedes ofrecer sesiones.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Etiquetas de Experiencia</label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {profile.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-[#A68363]/10 text-[#A68363] rounded-full text-xs font-bold"
                                            >
                                                {tag}
                                                <button
                                                    onClick={() => removeTag(tag)}
                                                    className="hover:text-red-500 transition-colors"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#A68363]/20 transition-all"
                                            placeholder="Ej: Ansiedad, Depresión, Parejas..."
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        />
                                        <button
                                            type="button"
                                            onClick={addTag}
                                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
                                        >
                                            Añadir
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-400">Añade palabras clave sobre tus áreas de especialización.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Vista Previa del Perfil</h2>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-all"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-8">
                            {/* Preview Card - Como lo vería un paciente */}
                            <div className="bg-gradient-to-br from-[#F2EDE7] to-white p-8 rounded-2xl border border-gray-100 shadow-lg">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-shrink-0">
                                        <div className="w-32 h-32 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                                            {profile.image ? (
                                                <Image src={profile.image} alt="Profile" width={128} height={128} className="object-cover" />
                                            ) : (
                                                <User className="h-12 w-12 text-blue-200" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{profile.fullName}</h3>
                                        <p className="text-[#A68363] font-medium mb-4">{profile.specialty}</p>

                                        <div className="flex flex-wrap gap-4 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Tag className="h-4 w-4 text-[#A68363]" />
                                                <span className="font-semibold">€{profile.price}</span>
                                                <span className="text-gray-400">/ sesión</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Languages className="h-4 w-4 text-[#A68363]" />
                                                <span>{profile.languages.join(", ")}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {profile.tags.map((tag) => (
                                                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                                            {profile.description || "Sin descripción"}
                                        </p>

                                        <button className="w-full md:w-auto px-6 py-3 bg-[#A68363] text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg">
                                            Reservar Sesión
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                                <p className="text-sm text-blue-900">
                                    <strong>💡 Nota:</strong> Así es como los pacientes verán tu perfil cuando visiten tu página pública.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
