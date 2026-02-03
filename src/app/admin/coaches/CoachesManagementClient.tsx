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
    Briefcase
} from "lucide-react";
import Image from "next/image";
import { deletePsychologist } from "@/app/actions/admin";
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

interface Coach {
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
}

export function CoachesManagementClient({ coaches: initialCoaches }: { coaches: Coach[] }) {
    const [coaches, setCoaches] = useState(initialCoaches);
    const [search, setSearch] = useState("");
    const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [isPending, startTransition] = useTransition();

    const filteredCoaches = coaches.filter(c =>
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.specialty?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = () => {
        if (!selectedCoach) return;

        startTransition(async () => {
            const result = await deletePsychologist(selectedCoach.id);
            if (result.success) {
                toast.success("Coach eliminado correctamente");
                setCoaches(coaches.filter(c => c.id !== selectedCoach.id));
                setIsDeleteDialogOpen(false);
                setConfirmText("");
                setSelectedCoach(null);
            } else {
                toast.error(result.error || "Error al eliminar coach");
            }
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black p-8 text-white neo-border">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                        <Users className="h-8 w-8 text-[#A68363]" />
                        Gestionar Coaches
                    </h1>
                    <p className="text-gray-400 mt-2 font-bold uppercase text-[10px] tracking-[0.2em]">Administración de profesionales y rendimiento</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="BUSCAR COACH POR NOMBRE O EMAIL..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-white border-4 border-white text-black font-black uppercase text-xs rounded-none pl-12 pr-6 py-4 w-full md:w-80 shadow-[4px_4px_0px_0px_rgba(166,131,99,1)] focus:outline-none transition-all placeholder:text-gray-300"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCoaches.map((coach) => (
                    <div
                        key={coach.id}
                        className="bg-white border-4 border-black hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 flex flex-col group"
                    >
                        <div className="p-6 border-b-4 border-black flex items-start gap-4 bg-gray-50 group-hover:bg-white transition-colors">
                            <div className="relative w-20 h-20 flex-shrink-0 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
                                {coach.image ? (
                                    <Image src={coach.image} alt={coach.fullName} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 italic font-black text-2xl">
                                        {coach.fullName[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-black uppercase tracking-tight truncate mb-1 italic leading-none">
                                    {coach.fullName}
                                </h3>
                                <p className="text-[#A68363] text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mb-2">
                                    <Briefcase className="h-3 w-3" /> {coach.specialty || 'Generalist'}
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1 bg-black text-white text-[8px] font-black uppercase tracking-tighter">
                                        RATING: {coach.rating || '5.0'}
                                    </div>
                                    <div className="px-3 py-1 border-2 border-black text-black text-[8px] font-black uppercase tracking-tighter italic">
                                        SINCE: {new Date(coach.createdAt).getFullYear()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4 flex-1">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all">
                                    <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-2">Sesiones</p>
                                    <p className="text-2xl font-black text-black italic">
                                        {coach.totalSessions || 0}
                                    </p>
                                </div>
                                <div className="bg-gray-50 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all">
                                    <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-2">Saldo</p>
                                    <p className="text-2xl font-black text-emerald-600 italic">
                                        €{coach.balance || '0'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all">
                                    <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-2">Usuarios</p>
                                    <p className="text-2xl font-black text-black italic">
                                        {coach.totalPatients || 0}
                                    </p>
                                </div>
                                <div className="bg-gray-50 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all">
                                    <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-2">Completas</p>
                                    <p className="text-2xl font-black text-blue-600 italic">
                                        {coach.completedSessions || 0}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 space-y-2 border-t-2 border-dashed border-gray-200">
                                <div className="flex items-center gap-2 text-[10px] font-black text-black truncate lowercase">
                                    <Mail className="h-3 w-3 text-[#A68363]" /> {coach.email}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400">
                                    <Calendar className="h-3 w-3" /> REGISTERED: {new Date(coach.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t-4 border-black flex gap-2">
                            <Button
                                className="flex-1 h-12 rounded-none border-2 border-black bg-white text-black font-black uppercase text-xs hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                                onClick={() => window.open(`/api/ref/${coach.userId}`, '_blank')}
                            >
                                <UserCircle className="h-4 w-4 mr-2" /> ver perfil
                            </Button>
                            <Button
                                variant="destructive"
                                className="h-12 w-12 rounded-none border-2 border-black bg-red-600 text-white flex items-center justify-center hover:bg-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                                onClick={() => {
                                    setSelectedCoach(coach);
                                    setIsDeleteDialogOpen(true);
                                }}
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                ))}

                {filteredCoaches.length === 0 && (
                    <div className="col-span-full py-20 bg-gray-50 border-4 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                        <Users className="h-16 w-16 text-gray-200 mb-4" />
                        <h3 className="text-xl font-black uppercase text-gray-400 italic">No se encontraron coaches</h3>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Prueba otra búsqueda o añade un profesional</p>
                    </div>
                )}
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
                if (!open && !isPending) {
                    setIsDeleteDialogOpen(false);
                    setConfirmText("");
                    setSelectedCoach(null);
                }
            }}>
                <DialogContent className="max-w-md bg-white border-4 border-black rounded-none p-0 shadow-[18px_18px_0px_0px_rgba(0,0,0,1)]">
                    <div className="bg-red-600 p-8 text-black border-b-4 border-black">
                        <AlertTriangle className="h-12 w-12 mb-4" />
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Acción Irreversible</h2>
                    </div>
                    <div className="p-8 space-y-6">
                        <p className="text-sm font-bold text-gray-600 leading-relaxed uppercase tracking-tight">
                            ESTÁS A PUNTO DE ELIMINAR EL PERFIL PROFESIONAL Y LA CUENTA DE USUARIO DE <span className="text-black font-black">"{selectedCoach?.fullName}"</span>.
                            ESTO BORRARÁ SUS DATOS, ESTADÍSTICAS Y ACCESO.
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
        </div>
    );
}
