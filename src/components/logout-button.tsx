"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

export function LogoutButton({ className }: { className?: string }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleLogout = () => {
        startTransition(async () => {
            await logout();
        });
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                className={cn(
                    "flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium",
                    className
                )}
            >
                <LogOut className="h-5 w-5" />
                Cerrar sesión
            </button>

            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent className="sm:max-w-[400px] rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900">¿Cerrar sesión?</DialogTitle>
                        <DialogDescription className="text-gray-500 font-medium">
                            ¿Estás seguro que quieres cerrar sesión? Tendrás que volver a ingresar tus credenciales para acceder.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-3 sm:justify-end mt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setShowConfirm(false)}
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
        </>
    );
}
