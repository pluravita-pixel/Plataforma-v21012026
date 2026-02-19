"use client";

import { useState } from "react";
import {
    User,
    Mail,
    Phone,
    Calendar,
    Activity,
    Eye,
    Search,
    Filter,
    Download,
    CheckCircle2,
    XCircle,
    Trash2,
    AlertTriangle
} from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteUser } from "@/app/actions/admin";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UserData {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    role: string;
    sessions_count: number;
    has_completed_affinity: boolean;
    created_at: Date;
    last_login: Date | null;
    affinity_id: string | null;
    responses: any;
    affinity_date: Date | null;
}

export function UsersListClient({ users }: { users: UserData[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [showAffinityModal, setShowAffinityModal] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleDeleteUser = () => {
        if (!selectedUser) return;

        startTransition(async () => {
            const result = await deleteUser(selectedUser.id);
            if (result.success) {
                toast.success("Usuario eliminado correctamente");
                setIsDeleteDialogOpen(false);
                setConfirmText("");
                setSelectedUser(null);
                // Forzar recarga puesto que los datos vienen de servidor
                window.location.reload();
            } else {
                toast.error(result.error || "Error al eliminar usuario");
            }
        });
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === "all" || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const handleViewAffinity = (user: UserData) => {
        setSelectedUser(user);
        setShowAffinityModal(true);
    };

    const getRoleBadge = (role: string) => {
        const normalizedRole = role.toLowerCase();
        const colors: Record<string, string> = {
            admin: "bg-purple-100 text-purple-700",
            oyente: "bg-blue-100 text-blue-700",
            psychologist: "bg-blue-100 text-blue-700",
            coach: "bg-blue-100 text-blue-700",
            usuario: "bg-green-100 text-green-700",
            patient: "bg-green-100 text-green-700",
        };
        return colors[normalizedRole] || "bg-gray-100 text-gray-700";
    };

    const getRoleLabel = (role: string) => {
        const normalizedRole = role.toLowerCase();
        if (['oyente', 'psychologist', 'coach'].includes(normalizedRole)) return 'PSICÓLOGO';
        if (['usuario', 'patient'].includes(normalizedRole)) return 'USUARIO';
        return role.toUpperCase();
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar por email, nombre o ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 rounded-xl"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                        >
                            <option value="all">Todos los roles</option>
                            <option value="usuario">Usuarios</option>
                            <option value="oyente">Psicólogos</option>
                            <option value="admin">Administradores</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <p>Mostrando {filteredUsers.length} de {users.length} usuarios</p>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Sesiones</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Test Afinidad</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Registro</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <User className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{user.full_name || "Sin nombre"}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {user.email}
                                                </p>
                                                {user.phone && (
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        {user.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadge(user.role)}`}>
                                            {getRoleLabel(user.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm font-bold text-gray-900">{user.sessions_count}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.has_completed_affinity ? (
                                            <div className="flex items-center gap-2 text-green-600">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span className="text-xs font-bold">Completado</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <XCircle className="h-4 w-4" />
                                                <span className="text-xs font-bold">Pendiente</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(user.created_at).toLocaleDateString('es-ES')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewAffinity(user)}
                                            disabled={!user.has_completed_affinity}
                                            className="rounded-xl"
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            Ver detalles
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setIsDeleteDialogOpen(true);
                                            }}
                                            className="rounded-xl ml-2"
                                            disabled={user.role === 'admin'}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Affinity Test Modal */}
            <Dialog open={showAffinityModal} onOpenChange={setShowAffinityModal}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-0 border-none shadow-2xl bg-white focus:outline-none">
                    <DialogTitle className="sr-only">Detalles del Usuario y Test de Afinidad</DialogTitle>
                    <DialogDescription className="sr-only">Información detallada del usuario incluyendo sus respuestas al test de afinidad.</DialogDescription>
                    {selectedUser && (
                        <div className="flex flex-col">
                            {/* Header Section */}
                            <div className="bg-black p-8 md:p-10 text-white">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-3xl">
                                        {selectedUser.full_name ? selectedUser.full_name[0] : 'U'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-3xl font-black italic tracking-tighter uppercase">{selectedUser.full_name || "Usuario"}</h2>
                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${getRoleBadge(selectedUser.role)}`}>
                                                {getRoleLabel(selectedUser.role)}
                                            </span>
                                        </div>
                                        <p className="text-white/60 font-bold uppercase tracking-[0.2em] text-[10px]">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                                        <p className="text-[10px] uppercase font-black text-white/40 mb-1 tracking-widest">Sesiones</p>
                                        <p className="text-sm font-bold italic">{selectedUser.sessions_count || 0}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                                        <p className="text-[10px] uppercase font-black text-white/40 mb-1 tracking-widest">Registro</p>
                                        <p className="text-sm font-bold italic">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                                        <p className="text-[10px] uppercase font-black text-white/40 mb-1 tracking-widest">Teléfono</p>
                                        <p className="text-sm font-bold italic">{selectedUser.phone || "---"}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                                        <p className="text-[10px] uppercase font-black text-white/40 mb-1 tracking-widest">Último Acceso</p>
                                        <p className="text-sm font-bold italic">{selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString() : "NUNCA"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 md:p-10 space-y-10">

                                {/* Affinity Test Results */}
                                <div>
                                    <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-4">
                                        <h3 className="text-xl font-black text-black flex items-center gap-3 italic uppercase tracking-tighter">
                                            <Activity className="h-6 w-6 text-blue-600" />
                                            Test de Afinidad
                                        </h3>
                                        {selectedUser.affinity_date && (
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                Completado: {new Date(selectedUser.affinity_date).toLocaleDateString('es-ES')}
                                            </span>
                                        )}
                                    </div>

                                    {selectedUser.has_completed_affinity && selectedUser.responses ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {(() => {
                                                const questionLabels: Record<string, string> = {
                                                    therapy_type: "¿Cómo te gustaría que fuera este camino?",
                                                    first_time: "¿Ya habías probado algo parecido antes?",
                                                    gender: "¿Con qué género te identificas?",
                                                    practical_exercises: "¿Te gustaría recibir ideas para aplicar en tu día a día?",
                                                    focus_area: "¿En qué te gustaría enfocarte más?",
                                                    therapist_gender: "¿Prefieres que tu psicólogo sea hombre o mujer?",
                                                    age: "¿Qué edad tienes?"
                                                };

                                                const answerLabels: Record<string, Record<string, string>> = {
                                                    therapy_type: { individual: "Para mí (individual)", couple: "Con mi pareja" },
                                                    first_time: { yes: "Es mi primera vez", no: "Sí, ya he tenido procesos similares" },
                                                    gender: {
                                                        woman: "Mujer",
                                                        man: "Hombre",
                                                        nonbinary: "No binario",
                                                        other: "Otro",
                                                        prefer_not_to_say: "Prefiero no decir"
                                                    },
                                                    practical_exercises: {
                                                        totally: "¡Sí! Me encanta pasar a la acción",
                                                        no: "Prefiero solo conversar por ahora",
                                                        maybe: "Lo vemos según avance el proceso"
                                                    },
                                                    focus_area: {
                                                        goals: "Mis metas y crecimiento personal",
                                                        balance: "Mi equilibrio mental y emocional",
                                                        relationships: "Mis relaciones con los demás",
                                                        self_knowledge: "Simplemente conocerme mejor"
                                                    },
                                                    therapist_gender: {
                                                        woman: "Mujer",
                                                        man: "Hombre",
                                                        indifferent: "Me es totalmente igual"
                                                    }
                                                };

                                                return Object.entries(selectedUser.responses as Record<string, any>).map(([key, value]) => {
                                                    const question = questionLabels[key] || key;
                                                    let answer = value;

                                                    if (answerLabels[key] && answerLabels[key][value]) {
                                                        answer = answerLabels[key][value];
                                                    }

                                                    return (
                                                        <div key={key} className="bg-white p-6 border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group">
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-blue-500 transition-colors">{question}</p>
                                                            <p className="text-sm font-bold text-gray-900 uppercase italic tracking-tight">{answer}</p>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 p-12 text-center border-4 border-dashed border-gray-100 italic rounded-3xl">
                                            <XCircle className="h-10 w-10 text-gray-200 mx-auto mb-4" />
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">El usuario aún no ha realizado el test de afinidad</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
                if (!open && !isPending) {
                    setIsDeleteDialogOpen(false);
                    setConfirmText("");
                    setSelectedUser(null);
                }
            }}>
                <DialogContent className="max-w-md bg-white border-2 border-red-100 rounded-3xl p-0 overflow-hidden shadow-2xl">
                    <div className="bg-red-50 p-8 text-red-600 border-b border-red-100 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="h-8 w-8" />
                        </div>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight leading-none">Acción Crítica</DialogTitle>
                        <DialogDescription className="sr-only">Confirmación para eliminar permanentemente al usuario</DialogDescription>
                    </div>
                    <div className="p-8 space-y-6">
                        <p className="text-sm font-bold text-gray-600 leading-relaxed text-center">
                            ESTÁS A PUNTO DE ELIMINAR COMPLETAMENTE EL USUARIO <span className="text-black font-black">"{selectedUser?.full_name || selectedUser?.email}"</span>.
                            ESTO BORRARÁ SUS DATOS Y ACCESO DE FORMA PERMANENTE.
                        </p>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block text-center">
                                ESCRIBE <span className="text-red-600">ELIMINAR</span> PARA CONFIRMAR:
                            </label>
                            <Input
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                placeholder="Escribe aquí..."
                                className="h-12 border-2 border-black rounded-xl text-center font-black uppercase tracking-widest focus:ring-0"
                                disabled={isPending}
                            />
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest transition-all"
                            disabled={isPending}
                        >
                            CANCELAR
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteUser}
                            disabled={confirmText !== "ELIMINAR" || isPending}
                            className="flex-1 h-12 rounded-xl bg-red-600 text-white font-bold uppercase tracking-widest transition-all disabled:opacity-30"
                        >
                            {isPending ? "BORRANDO..." : "SÍ, ELIMINAR"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
