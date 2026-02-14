"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
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
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData);
                if (userData) {
                    // Pre-fetch or handle user data if needed
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = () => {
        startTransition(async () => {
            await logout();
        });
    };


    const initials = user?.fullName
        ? user.fullName.split(" ").filter(Boolean).map((n: string) => n[0]).join("").toUpperCase()
        : (user?.email ? user.email[0].toUpperCase() : "U");

    return (
        <div className="relative">
            {loading ? (
                <div className="flex items-center gap-2 animate-pulse">
                    <div className="h-8 w-8 bg-gray-200 rounded-full" />
                    <div className="hidden sm:block space-y-1">
                        <div className="h-3 w-20 bg-gray-200 rounded" />
                        <div className="h-2 w-16 bg-gray-200 rounded" />
                    </div>
                </div>
            ) : !user ? (
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="border-[#A68363] text-[#A68363] hover:bg-[#F2EDE7] font-semibold rounded-full px-6" asChild>
                        <Link href="/login">Iniciar sesión</Link>
                    </Button>
                    <Button className="bg-[#A68363] hover:opacity-90 text-white font-semibold rounded-full px-6 shadow-lg shadow-[#A68363]/20" asChild>
                        <Link href="/register">Regístrate</Link>
                    </Button>
                </div>
            ) : (
                <>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <Avatar className="h-8 w-8 border border-gray-200">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                            <AvatarFallback className="bg-[#F2EDE7] text-[#A68363] text-xs font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="hidden sm:block text-left">
                            <p className="text-xs font-bold text-gray-900 line-clamp-1">{user.fullName || "Usuario"}</p>
                            <p className="text-[10px] text-gray-500 line-clamp-1 uppercase tracking-wider">
                                {user.role === 'oyente' ? 'OYENTE' : (user.role === 'admin' ? 'ADMIN' : 'USUARIO')}
                            </p>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-[60] bg-black/20"
                                onClick={() => setIsOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[70] opacity-100">
                                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Iniciado como</p>
                                    <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                                </div>

                                {user.role === 'admin' ? (
                                    <Link
                                        href="/admin/dashboard"
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#F2EDE7] hover:text-[#A68363] transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        Panel de Admin
                                    </Link>
                                ) : user.role === 'oyente' ? (
                                    <>
                                        <Link
                                            href="/oyente/dashboard"
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#F2EDE7] hover:text-[#A68363] transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <LayoutDashboard className="h-4 w-4" />
                                            Panel de Oyente
                                        </Link>
                                        <Link
                                            href="/oyente/settings"
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#F2EDE7] hover:text-[#A68363] transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Settings className="h-4 w-4" />
                                            Ajustes de cuenta
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/usuario/dashboard"
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#F2EDE7] hover:text-[#A68363] transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <LayoutDashboard className="h-4 w-4" />
                                            Mi Dashboard
                                        </Link>
                                        <Link
                                            href="/usuario/profile"
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[#F2EDE7] hover:text-[#A68363] transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Settings className="h-4 w-4" />
                                            Ajustes de cuenta
                                        </Link>
                                    </>
                                )}

                                <div className="h-px bg-gray-50 my-1" />

                                <button
                                    onClick={() => {
                                        setShowLogoutConfirm(true);
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Cerrar sesión
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}


            {/* Logout Confirm Dialog */}
            <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
                <DialogContent className="sm:max-w-[400px] rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900 border-none">¿Cerrar sesión?</DialogTitle>
                        <p className="text-gray-500 font-medium text-sm mt-2">
                            ¿Estás seguro que quieres cerrar sesión?
                        </p>
                    </DialogHeader>
                    <DialogFooter className="flex gap-3 sm:justify-end mt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setShowLogoutConfirm(false)}
                            disabled={isPending}
                            className="rounded-xl font-bold hover:bg-gray-100"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleLogout}
                            disabled={isPending}
                            className="rounded-xl font-bold bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 flex items-center gap-2"
                        >
                            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            Aceptar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
