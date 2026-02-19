"use client";

import { useState, useTransition, useEffect } from "react";
import {
    Users,
    Trash2,
    TrendingUp,
    Calendar,
    MessageSquare,
    Search,
    AlertTriangle,
    X,
    UserCircle,
    Mail,
    Phone,
    Briefcase,
    Edit,
    Save,
    Plus,
    X as XIcon,
    Languages as LanguagesIcon,
    Eye,
    EyeOff
} from "lucide-react";
import Image from "next/image";
import { deleteOyente, toggleOyenteVisibility } from "@/app/actions/admin";
import { updateOyenteSettings } from "@/app/actions/oyentes";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Listener {
    id: string;
    userId: string;
    fullName: string;
    email: string | null;
    specialty: string | null;
    image: string | null;
    totalSessions: number | null;
    completedSessions: number | null;
    totalPatients: number | null;
    activePatients: number | null;
    balance: string | null;
    rating: string | null;
    createdAt: Date;
    price?: string | null;
    description?: string | null;
    languages?: string[] | null;
    tags?: string[] | null;
    isHidden?: boolean;
}

export function CoachesManagementClient({ coaches: initialListeners }: { coaches: Listener[] }) {
    const [listeners, setListeners] = useState(initialListeners);
    const [search, setSearch] = useState("");
    const [selectedListener, setSelectedListener] = useState<Listener | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editData, setEditData] = useState<{
        price: string;
        description: string;
        specialty: string;
        languages: string[];
        tags: string[];
        newLanguage: string;
        newTag: string;
    }>({
        price: "",
        description: "",
        specialty: "",
        languages: [],
        tags: [],
        newLanguage: "",
        newTag: ""
    });
    const [confirmText, setConfirmText] = useState("");
    const [isPending, startTransition] = useTransition();

    const filteredListeners = listeners.filter(l =>
        l.fullName.toLowerCase().includes(search.toLowerCase()) ||
        l.email?.toLowerCase().includes(search.toLowerCase()) ||
        l.specialty?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = () => {
        if (!selectedListener) return;

        startTransition(async () => {
            const result = await deleteOyente(selectedListener.id);
            if (result.success) {
                toast.success("Psicólogo eliminado correctamente");
                setListeners(listeners.filter(l => l.id !== selectedListener.id));
                setIsDeleteDialogOpen(false);
                setConfirmText("");
                setSelectedListener(null);
            } else {
                toast.error(result.error || "Error al eliminar psicólogo");
            }
        });
    };

    const handleOpenEdit = (listener: Listener) => {
        setSelectedListener(listener);
        setEditData({
            price: listener.price || "35.00",
            description: listener.description || "",
            specialty: listener.specialty || "",
            languages: listener.languages || [],
            tags: listener.tags || [],
            newLanguage: "",
            newTag: ""
        });
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = () => {
        if (!selectedListener) return;

        // Validación de precio frontend (double-check antes del backend)
        const priceNum = parseFloat(editData.price);
        if (editData.price !== "" && (isNaN(priceNum) || priceNum < 0 || priceNum > 30)) {
            toast.error("El precio debe ser un valor numérico entre 0€ y 30€");
            return;
        }

        startTransition(async () => {
            const result = await updateOyenteSettings(selectedListener.userId, {
                price: editData.price,
                description: editData.description,
                specialty: editData.specialty,
                languages: editData.languages,
                tags: editData.tags
            });

            if (result.success) {
                toast.success("Perfil actualizado correctamente");
                setListeners(listeners.map(l =>
                    l.id === selectedListener.id
                        ? { ...l, price: editData.price, description: editData.description, specialty: editData.specialty, languages: editData.languages, tags: editData.tags }
                        : l
                ));
                setIsEditDialogOpen(false);
                setSelectedListener(null);
            } else {
                toast.error(result.error || "Error al actualizar perfil");
            }
        });
    };

    const handleToggleVisibility = (listener: Listener) => {
        startTransition(async () => {
            const newVisibility = !listener.isHidden;
            const result = await toggleOyenteVisibility(listener.id, newVisibility);
            if (result.success) {
                toast.success(newVisibility ? "Perfil ocultado" : "Perfil visible");
                setListeners(listeners.map(l =>
                    l.id === listener.id
                        ? { ...l, isHidden: newVisibility }
                        : l
                ));
            } else {
                toast.error(result.error || "Error al cambiar visibilidad");
            }
        });
    };

    const addLanguage = () => {
        if (editData.newLanguage.trim() && !editData.languages.includes(editData.newLanguage.trim())) {
            setEditData({
                ...editData,
                languages: [...editData.languages, editData.newLanguage.trim()],
                newLanguage: ""
            });
        }
    };

    const removeLanguage = (lang: string) => {
        setEditData({
            ...editData,
            languages: editData.languages.filter(l => l !== lang)
        });
    };

    const addTag = () => {
        if (editData.newTag.trim() && !editData.tags.includes(editData.newTag.trim())) {
            setEditData({
                ...editData,
                tags: [...editData.tags, editData.newTag.trim()],
                newTag: ""
            });
        }
    };

    const removeTag = (tag: string) => {
        setEditData({
            ...editData,
            tags: editData.tags.filter(t => t !== tag)
        });
    };

    return (
        <div className="space-y-8">


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredListeners.map((listener) => (
                    <div
                        key={listener.id}
                        className="bg-white border-4 border-black hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 flex flex-col group"
                    >
                        <div className="p-6 border-b-4 border-black flex items-start gap-4 bg-gray-50 group-hover:bg-white transition-colors">
                            <div className="relative w-20 h-20 flex-shrink-0 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
                                {listener.image ? (
                                    <Image src={listener.image} alt={listener.fullName} fill className="object-cover object-top" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 italic font-black text-2xl">
                                        {listener.fullName[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-black uppercase tracking-tight truncate mb-1 italic leading-none">
                                    {listener.fullName}
                                </h3>
                                <p className="text-[#A68363] text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mb-2">
                                    <Briefcase className="h-3 w-3" /> {listener.specialty || 'Generalist'}
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1 bg-black text-white text-[8px] font-black uppercase tracking-tighter">
                                        RATING: {listener.rating || '5.0'}
                                    </div>
                                    <div className="px-3 py-1 border-2 border-black text-black text-[8px] font-black uppercase tracking-tighter italic">
                                        PRICE: €{listener.price || '35.00'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4 flex-1">
                            {/* Tags & Languages Section */}
                            <div className="space-y-3 mb-4">
                                {listener.tags && listener.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {listener.tags.map(tag => (
                                            <span key={tag} className="px-2 py-0.5 bg-blue-600 text-white text-[8px] font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{tag}</span>
                                        ))}
                                    </div>
                                )}
                                {listener.languages && listener.languages.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {listener.languages.map(lang => (
                                            <span key={lang} className="px-2 py-0.5 bg-white text-black text-[8px] font-black uppercase border border-black">{lang}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all">
                                    <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-2">Sesiones</p>
                                    <p className="text-2xl font-black text-black italic">
                                        {listener.totalSessions || 0}
                                    </p>
                                </div>
                                <div className="bg-gray-50 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all">
                                    <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-2">Saldo</p>
                                    <p className="text-2xl font-black text-emerald-600 italic">
                                        €{listener.balance || '0'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all">
                                    <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-2">Usuarios</p>
                                    <p className="text-2xl font-black text-black italic">
                                        {listener.totalPatients || 0}
                                    </p>
                                </div>
                                <div className="bg-gray-50 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all">
                                    <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-2">Completas</p>
                                    <p className="text-2xl font-black text-blue-600 italic">
                                        {listener.completedSessions || 0}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 space-y-2 border-t-2 border-dashed border-gray-200">
                                <div className="flex items-center gap-2 text-[10px] font-black text-black truncate lowercase">
                                    <Mail className="h-3 w-3 text-[#A68363]" /> {listener.email}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400">
                                    <Calendar className="h-3 w-3" /> REGISTERED: {new Date(listener.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t-4 border-black flex gap-2">
                            <Button
                                className="flex-1 h-12 rounded-none border-2 border-black bg-white text-black font-black uppercase text-xs hover:bg-[#A68363] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                                onClick={() => handleOpenEdit(listener)}
                            >
                                <Edit className="h-4 w-4 mr-2" /> editar
                            </Button>
                            <Button
                                className={`flex-1 h-12 rounded-none border-2 border-black ${listener.isHidden ? 'bg-gray-200 text-gray-500' : 'bg-white text-black'} font-black uppercase text-xs hover:bg-[#A68363] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1`}
                                onClick={() => handleToggleVisibility(listener)}
                            >
                                {listener.isHidden ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                                {listener.isHidden ? "Oculto" : "Visible"}
                            </Button>
                            <Button
                                className="flex-1 h-12 rounded-none border-2 border-black bg-white text-black font-black uppercase text-xs hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                                onClick={() => window.open(`/api/ref/${listener.userId}`, '_blank')}
                            >
                                <UserCircle className="h-4 w-4 mr-2" /> perfil
                            </Button>
                            <Button
                                variant="destructive"
                                className="h-12 w-12 rounded-none border-2 border-black bg-red-600 text-white flex items-center justify-center hover:bg-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                                onClick={() => {
                                    setSelectedListener(listener);
                                    setIsDeleteDialogOpen(true);
                                }}
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                ))}

                {filteredListeners.length === 0 && (
                    <div className="col-span-full py-20 bg-gray-50 border-4 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                        <Users className="h-16 w-16 text-gray-200 mb-4" />
                        <h3 className="text-xl font-black uppercase text-gray-400 italic">No se encontraron psicólogos</h3>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Prueba otra búsqueda o añade un profesional</p>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <Dialog open={isEditDialogOpen} onOpenChange={(open) => !open && !isPending && setIsEditDialogOpen(false)}>
                <DialogContent className="max-w-2xl bg-white border-4 border-black rounded-none p-0 shadow-[18px_18px_0px_0px_rgba(0,0,0,1)] overflow-y-auto max-h-[90vh]">
                    <div className="bg-[#A68363] p-8 text-black border-b-4 border-black flex justify-between items-center">
                        <div>
                            <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter leading-none">Editar Perfil</DialogTitle>
                            <DialogDescription className="text-black font-bold uppercase text-[10px] tracking-[0.2em] mt-2">{selectedListener?.fullName}</DialogDescription>
                        </div>
                        <Edit className="h-8 w-8" />
                    </div>
                    <div className="p-8 space-y-6">
                        {/* Price */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Especialidad</label>
                                <Input
                                    value={editData.specialty}
                                    onChange={(e) => setEditData({ ...editData, specialty: e.target.value })}
                                    className="h-14 border-4 border-black rounded-none font-black text-xs focus:ring-0 uppercase"
                                    placeholder="EJ: ACOMPAÑAMIENTO EMOCIONAL"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Precio de sesión (€) <span className="text-red-500">máx. 30€</span></label>
                                <Input
                                    value={editData.price}
                                    onChange={(e) => {
                                        // Solo dígitos y punto decimal, clamp a 30
                                        const raw = e.target.value.replace(/[^0-9.]/g, '');
                                        const num = parseFloat(raw);
                                        if (!isNaN(num) && num > 30) return;
                                        setEditData({ ...editData, price: raw });
                                    }}
                                    onKeyDown={(e) => {
                                        const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '.'];
                                        if (!allowed.includes(e.key) && !/^[0-9]$/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    className="h-14 border-4 border-black rounded-none font-black text-lg focus:ring-0"
                                    type="number"
                                    min="0"
                                    max="30"
                                    step="0.5"
                                />
                                <p className="text-[10px] text-gray-400 font-bold">Máximo 30€. Solo números.</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Descripción del perfil</label>
                            <Textarea
                                value={editData.description}
                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                className="min-h-[150px] border-4 border-black rounded-none font-bold text-sm focus:ring-0 p-4"
                                placeholder="Escribe la descripción pública del psicólogo..."
                            />
                        </div>

                        {/* Languages */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                                <LanguagesIcon className="h-3 w-3" /> Idiomas que habla
                            </label>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {editData.languages.map(lang => (
                                    <div key={lang} className="bg-black text-white px-3 py-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                        {lang}
                                        <button onClick={() => removeLanguage(lang)} className="hover:text-red-400">
                                            <XIcon className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                {editData.languages.length === 0 && (
                                    <p className="text-xs text-gray-400 font-bold uppercase">No se han añadido idiomas</p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={editData.newLanguage}
                                    onChange={(e) => setEditData({ ...editData, newLanguage: e.target.value })}
                                    onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                                    placeholder="NUEVO IDIOMA..."
                                    className="h-12 border-2 border-black rounded-none font-black uppercase text-xs"
                                />
                                <Button
                                    onClick={addLanguage}
                                    type="button"
                                    className="h-12 px-6 rounded-none bg-black text-white font-black"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                                <TrendingUp className="h-3 w-3" /> Etiquetas de Experiencia
                            </label>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {editData.tags.map(tag => (
                                    <div key={tag} className="bg-blue-600 text-white px-3 py-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        {tag}
                                        <button onClick={() => removeTag(tag)} className="hover:text-red-200">
                                            <XIcon className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                {editData.tags.length === 0 && (
                                    <p className="text-xs text-gray-400 font-bold uppercase">No se han añadido etiquetas</p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={editData.newTag}
                                    onChange={(e) => setEditData({ ...editData, newTag: e.target.value })}
                                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                    placeholder="NUEVA ETIQUETA..."
                                    className="h-12 border-2 border-black rounded-none font-black uppercase text-xs"
                                />
                                <Button
                                    onClick={addTag}
                                    type="button"
                                    className="h-12 px-6 rounded-none bg-black text-white font-black"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-8 bg-gray-50 border-t-4 border-black flex gap-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                            className="flex-1 h-14 rounded-none border-4 border-black font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                            disabled={isPending}
                        >
                            CANCELAR
                        </Button>
                        <Button
                            onClick={handleSaveEdit}
                            disabled={isPending}
                            className="flex-1 h-14 rounded-none border-4 border-black bg-[#A68363] text-black font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 disabled:opacity-30"
                        >
                            {isPending ? "GUARDANDO..." : "GUARDAR CAMBIOS"} <Save className="ml-2 h-4 w-4" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
                if (!open && !isPending) {
                    setIsDeleteDialogOpen(false);
                    setConfirmText("");
                    setSelectedListener(null);
                }
            }}>
                <DialogContent className="max-w-md bg-white border-4 border-black rounded-none p-0 shadow-[18px_18px_0px_0px_rgba(0,0,0,1)]">
                    <div className="bg-red-600 p-8 text-black border-b-4 border-black">
                        <AlertTriangle className="h-12 w-12 mb-4" />
                        <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter leading-none">Acción Irreversible</DialogTitle>
                        <DialogDescription className="sr-only">Confirmación para eliminar al oyente</DialogDescription>
                    </div>
                    <div className="p-8 space-y-6">
                        <p className="text-sm font-bold text-gray-600 leading-relaxed uppercase tracking-tight">
                            ESTÁS A PUNTO DE ELIMINAR EL PERFIL PROFESIONAL Y LA CUENTA DE USUARIO DE <span className="text-black font-black">"{selectedListener?.fullName}"</span>.
                            ESTO BORRARÁ SUS DATOS, ESTADÍSTICAS Y ACCESO A LA PLATAFORMA COMO PSICÓLOGO.
                        </p>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                ESCRIBE <span className="text-red-600">ELIMINAR</span> PARA CONFIRMAR:
                            </label>
                            <Input
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                placeholder="ESCRIBE AQUÍ..."
                                className="h-14 border-4 border-black rounded-none text-center font-black uppercase tracking-widest focus:ring-0"
                                disabled={isPending}
                            />
                        </div>
                    </div>
                    <DialogFooter className="p-8 bg-gray-50 border-t-4 border-black flex gap-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="flex-1 h-14 rounded-none border-4 border-black font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                            disabled={isPending}
                        >
                            CANCELAR
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={confirmText !== "ELIMINAR" || isPending}
                            className="flex-1 h-14 rounded-none border-4 border-black bg-red-600 text-white font-black uppercase tracking-widest hover:bg-black transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 disabled:opacity-30 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                        >
                            {isPending ? "BORRANDO..." : "SÍ, ELIMINAR"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
