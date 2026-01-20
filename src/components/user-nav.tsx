"use client";

import { useEffect, useState } from "react";
import {
    User,
    LogOut,
    Settings,
    LayoutDashboard,
    Loader2,
    ChevronDown,
    UserCircle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logout, getCurrentUser, updateProfile } from "@/app/actions/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function UserNav() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData);
                if (userData) setNewName(userData.fullName || "");
            } catch (error) {
                console.error("Failed to fetch user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    const handleUpdateName = async () => {
        if (!newName.trim()) return;

        setIsUpdating(true);
        const result = await updateProfile(newName);
        setIsUpdating(false);

        if ("success" in result) {
            toast.success("Nombre actualizado");
            setUser({ ...user, fullName: newName });
            setIsEditModalOpen(false);
        } else {
            toast.error(result.error);
        }
    };

    if (loading) {
        return <Loader2 className="h-5 w-5 animate-spin text-gray-400" />;
    }

    if (!user) {
        return (
            <div className="flex items-center gap-4">
                <Button variant="outline" asChild className="border-[#A68363] text-[#A68363] hover:bg-[#F2EDE7] font-semibold rounded-full px-6">
                    <Link href="/login">Iniciar sesión</Link>
                </Button>
                <Button asChild className="bg-[#A68363] hover:opacity-90 text-white font-semibold rounded-full px-6 shadow-lg shadow-[#A68363]/20">
                    <Link href="/register">Regístrate</Link>
                </Button>
            </div>
        );
    }

    const initials = user.fullName
        ? user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
        : user.email[0].toUpperCase();

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-gray-100 transition-colors"
            >
                <Avatar className="h-8 w-8 border border-gray-200">
                    <AvatarFallback className="bg-[#F2EDE7] text-[#A68363] text-xs font-bold">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-gray-900 line-clamp-1">{user.fullName || "Usuario"}</p>
                    <p className="text-[10px] text-gray-500 line-clamp-1 uppercase tracking-wider">{user.role}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[60]"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[70] animate-in fade-in zoom-in duration-200">
                        <div className="px-4 py-3 border-b border-gray-50 mb-1">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Iniciado como</p>
                            <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                        </div>

                        {user.role === 'admin' && (
                            <Link
                                href="/admin/dashboard"
                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#F2EDE7] hover:text-[#A68363] transition-colors"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Panel de Admin
                            </Link>
                        )}

                        {user.role === 'psychologist' && (
                            <Link
                                href="/psychologist/dashboard"
                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#F2EDE7] hover:text-[#A68363] transition-colors"
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Panel de Coach
                            </Link>
                        )}

                        <button
                            onClick={() => {
                                setIsEditModalOpen(true);
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <UserCircle className="h-4 w-4" />
                            Cambiar nombre
                        </button>

                        <div className="h-px bg-gray-50 my-1" />

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Cerrar sesión
                        </button>
                    </div>
                </>
            )}

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Editar perfil</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre completo</Label>
                            <Input
                                id="name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Escribe tu nombre"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                        <Button
                            onClick={handleUpdateName}
                            disabled={isUpdating}
                            className="bg-[#A68363] hover:opacity-90 text-white"
                        >
                            {isUpdating ? "Guardando..." : "Guardar cambios"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
