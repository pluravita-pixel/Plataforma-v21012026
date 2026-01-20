"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";

import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
    return (
        <button
            onClick={() => logout()}
            className={cn(
                "flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium",
                className
            )}
        >
            <LogOut className="h-5 w-5" />
            Cerrar sesión
        </button>
    );
}
