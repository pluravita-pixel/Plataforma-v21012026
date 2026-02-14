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
    X,
    Info,
    CheckCircle2
} from "lucide-react";
import Image from "next/image";
import { updateOyenteSettings } from "@/app/actions/oyentes";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

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
        meetingLink?: string | null;
        studies?: string | null;
        benefits?: string[] | null;
        experience?: string | null;
    };
}

const AVAILABLE_LANGUAGES = ["Español", "Inglés", "Francés", "Alemán"];

export function ProfileClient({ psychologist }: ProfileClientProps) {
    const [profile, setProfile] = useState({
        fullName: psychologist.fullName,
        description: psychologist.description || "",
        specialty: psychologist.specialty || "Oyente",
        username: psychologist.username || "",
        image: psychologist.image || "",
        price: psychologist.price || "35.00",
        languages: psychologist.languages || ["Español"],
        tags: psychologist.tags || [],
        meetingLink: psychologist.meetingLink || "",
        studies: psychologist.studies || "",
        benefits: psychologist.benefits || [
            "Escucha activa y sin juicios.",
            "Espacio seguro y confidencial.",
            "Apoyo emocional cercano."
        ],
        experience: psychologist.experience || ""
    });
    const [newTag, setNewTag] = useState("");
    const [newBenefit, setNewBenefit] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [copied, setCopied] = useState(false);
    const [baseUrl, setBaseUrl] = useState("");

    useEffect(() => {
        setBaseUrl(window.location.origin);
    }, []);

    const publicUrl = psychologist.refCode
        ? `${baseUrl}/api/ref/${psychologist.refCode}`
        : `${baseUrl}/usuario/search?search=${profile.username || 'tu-username'}`;

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

    const addBenefit = () => {
        if (newBenefit.trim() && !profile.benefits.includes(newBenefit.trim())) {
            setProfile({
                ...profile,
                benefits: [...profile.benefits, newBenefit.trim()]
            });
            setNewBenefit("");
        }
    };

    const removeBenefit = (benefitToRemove: string) => {
        setProfile({
            ...profile,
            benefits: profile.benefits.filter(b => b !== benefitToRemove)
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (file.size > 2 * 1024 * 1024) {
            toast.error("La imagen es demasiado grande. Máximo 2MB.");
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast.error("Por favor, sube un archivo de imagen válido.");
            return;
        }

        setIsSaving(true);
        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${psychologist.id}/${Date.now()}.${fileExt}`;
            const { data, error } = await supabase.storage
                .from("profile-photos")
                .upload(fileName, file, {
                    cacheControl: "3600",
                    upsert: true,
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from("profile-photos")
                .getPublicUrl(data.path);

            setProfile({ ...profile, image: publicUrl });
            toast.success("Imagen subida con éxito. No olvides guardar los cambios.");
        } catch (error: any) {
            console.error("Error uploading image:", error);
            toast.error("No se pudo subir la imagen.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = async () => {
        if (!profile.username || profile.username.trim() === "") {
            toast.error("El nombre de usuario es obligatorio");
            return;
        }

        // Validate username format
        const cleanUsername = profile.username.toLowerCase().replace(/\s+/g, '-');
        const usernameRegex = /^[a-z0-9-]+$/;
        if (!usernameRegex.test(cleanUsername)) {
            toast.error("El nombre de usuario solo puede contener letras, números y guiones");
            return;
        }

        if (cleanUsername.length < 3) {
            toast.error("El nombre de usuario debe tener al menos 3 caracteres");
            return;
        }

        if (profile.languages.length === 0) {
            toast.error("Selecciona al menos un idioma");
            return;
        }

        const priceNum = parseFloat(profile.price);
        if (isNaN(priceNum) || priceNum < 35 || priceNum > 305) {
            toast.error("El precio debe estar entre 35€ y 305€");
            return;
        }

        setIsSaving(true);
        try {
            const result = await updateOyenteSettings(psychologist.userId, {
                description: profile.description,
                specialty: profile.specialty,
                price: profile.price,
                username: cleanUsername,
                languages: profile.languages,
                tags: profile.tags,
                image: profile.image || undefined,
                meetingLink: profile.meetingLink,
                studies: profile.studies,
                benefits: profile.benefits,
                experience: profile.experience,
                fullName: profile.fullName
            });

            if (result && 'error' in result) {
                toast.error(result.error);
            } else {
                toast.success("Perfil actualizado con éxito");
                // Update local state with clean username
                setProfile({ ...profile, username: cleanUsername });
            }
        } catch (error: any) {
            console.error("Error saving profile:", error);
            toast.error(error.message || "Error al actualizar el perfil");
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
                        <p className="text-gray-500 mt-1">Esta información será visible para tus usuarios potenciales.</p>
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
                                <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-[#A68363] cursor-pointer hover:bg-gray-50 transition-all">
                                    <Camera className="h-4 w-4" />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={isSaving}
                                    />
                                </label>
                            </div>

                            <p className="text-[10px] text-gray-400 mt-2">Formatos: JPG, PNG. Máx. 2MB</p>

                            <div className="space-y-2 mt-6 mb-6">
                                <label className="text-[10px] uppercase font-bold text-gray-400 block">URL de Imagen (Opcional)</label>
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
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Nombre Público *</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#A68363]/20 transition-all font-bold"
                                        value={profile.fullName}
                                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                        placeholder="Tu nombre completo"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Nombre de Usuario *</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#A68363]/20 transition-all"
                                        value={profile.username}
                                        onChange={(e) => setProfile({ ...profile, username: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        placeholder=""
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
                                            placeholder=""
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Precio Base por sesión (€) *</label>
                                    <div className="relative">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="number"
                                            min="35"
                                            max="305"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#A68363]/20 transition-all font-bold text-[#4A3C31]"
                                            value={profile.price}
                                            onChange={(e) => setProfile({ ...profile, price: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-[#A68363] bg-[#A68363]/10 px-3 py-2 rounded-lg">
                                        <Info className="h-3 w-3" />
                                        <span>
                                            Precio Final (con +21% IVA): €{(Number(profile.price || 0) * 1.21).toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-400">El precio mínimo base es de 35€.</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">Link de Zoom / Sesión (PMI) *</label>
                                <div className="relative">
                                    <Camera className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#A68363]/20 transition-all font-mono"
                                        value={profile.meetingLink}
                                        onChange={(e) => setProfile({ ...profile, meetingLink: e.target.value })}
                                        placeholder=""
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 italic">Aquí debes poner tu Sala de Reunión Personal habitual de Zoom o Google Meet.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Estudios y Formación</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#A68363]/20 transition-all"
                                        value={profile.studies}
                                        onChange={(e) => setProfile({ ...profile, studies: e.target.value })}
                                        placeholder="Ej: Acompañamiento emocional, Desarrollo Personal..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600">Experiencia Breve (Resumen)</label>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#A68363]/20 transition-all"
                                        value={profile.experience}
                                        onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                                        placeholder="Ej: Acompañando a personas en su crecimiento..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">Descripción del perfil *</label>
                                <textarea
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#A68363]/20 transition-all min-h-[150px]"
                                    value={profile.description}
                                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                                    placeholder=""
                                />
                                <p className="text-[10px] text-gray-400">Te recomendamos un mínimo de 300 caracteres para un perfil completo.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">¿Por qué elegirme? (Beneficios/Puntos fuertes) *</label>
                                <div className="space-y-3">
                                    {profile.benefits.map((benefit, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 group">
                                            <CheckCircle2 className="h-4 w-4 text-[#A68363] shrink-0" />
                                            <span className="flex-1 text-sm text-gray-700">{benefit}</span>
                                            <button
                                                onClick={() => removeBenefit(benefit)}
                                                className="p-1 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#A68363]/20 transition-all"
                                            placeholder="Añade un beneficio o punto fuerte..."
                                            value={newBenefit}
                                            onChange={(e) => setNewBenefit(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                                        />
                                        <button
                                            type="button"
                                            onClick={addBenefit}
                                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
                                        >
                                            Añadir
                                        </button>
                                    </div>
                                </div>
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
                                        placeholder=""
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
                            {/* Preview Card - Como lo vería un usuario */}
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

                                        {profile.studies && (
                                            <div className="mb-4">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Formación</h4>
                                                <p className="text-sm text-gray-600">{profile.studies}</p>
                                            </div>
                                        )}

                                        <button className="w-full md:w-auto px-6 py-3 bg-[#A68363] text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg">
                                            Reservar Sesión
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-8 bg-amber-50 p-6 rounded-[2rem] border border-amber-100">
                                    <h4 className="font-bold text-[#A68363] mb-4 text-sm uppercase tracking-wider">¿Por qué elegirme?</h4>
                                    <ul className="space-y-3">
                                        {profile.benefits.map((benefit, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-sm text-amber-900 font-medium">
                                                <CheckCircle2 className="h-4 w-4 text-[#A68363] mt-0.5 shrink-0" />
                                                {benefit}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                                <p className="text-sm text-blue-900">
                                    <strong>💡 Nota:</strong> Así es como los usuarios verán tu perfil cuando visiten tu página pública.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
