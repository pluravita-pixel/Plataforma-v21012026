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
        if (['oyente', 'psychologist', 'coach'].includes(normalizedRole)) return 'OYENTE';
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
                            <option value="oyente">Oyentes</option>
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
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            Detalles del Usuario
                        </DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-6">
                            {/* User Info */}
                            <div className="bg-gray-50 p-6 rounded-2xl space-y-3">
                                <h3 className="font-bold text-lg text-gray-900">Información Personal</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500 font-medium">Nombre</p>
                                        <p className="text-gray-900 font-bold">{selectedUser.full_name || "No especificado"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 font-medium">Email</p>
                                        <p className="text-gray-900 font-bold">{selectedUser.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 font-medium">Teléfono</p>
                                        <p className="text-gray-900 font-bold">{selectedUser.phone || "No especificado"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 font-medium">Rol</p>
                                        <p className="text-gray-900 font-bold">{selectedUser.role}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 font-medium">Sesiones totales</p>
                                        <p className="text-gray-900 font-bold">{selectedUser.sessions_count}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 font-medium">Último acceso</p>
                                        <p className="text-gray-900 font-bold">
                                            {selectedUser.last_login
                                                ? new Date(selectedUser.last_login).toLocaleDateString('es-ES')
                                                : "Nunca"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Affinity Test Results */}
                            {selectedUser.has_completed_affinity && selectedUser.responses ? (
                                <div className="bg-blue-50 p-6 rounded-2xl space-y-4">
                                    <h3 className="font-bold text-lg text-gray-900">Test de Afinidad</h3>
                                    <p className="text-sm text-gray-600">
                                        Completado el {selectedUser.affinity_date
                                            ? new Date(selectedUser.affinity_date).toLocaleDateString('es-ES')
                                            : "Fecha desconocida"}
                                    </p>
                                    <div className="space-y-3">
                                        {Object.entries(selectedUser.responses as Record<string, any>).map(([key, value]) => (
                                            <div key={key} className="bg-white p-4 rounded-xl">
                                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">{key}</p>
                                                <p className="text-sm text-gray-900">{JSON.stringify(value)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-6 rounded-2xl text-center">
                                    <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600 font-medium">Este usuario aún no ha completado el test de afinidad</p>
                                </div>
                            )}
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
                        <h2 className="text-2xl font-black uppercase tracking-tight leading-none">Acción Crítica</h2>
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
