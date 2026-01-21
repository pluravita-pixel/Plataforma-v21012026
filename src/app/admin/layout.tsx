"use client";

import { useState } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    UserPlus,
    Database,
    Users,
    Settings,
    ShieldCheck,
    LogOut,
    MessageCircle,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { UserNav } from "@/components/user-nav";
import { cn } from "@/lib/utils";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: "Resumen", href: "/admin/dashboard" },
        { icon: UserPlus, label: "Añadir Coach", href: "/admin/add-psychologist" },
        { icon: MessageCircle, label: "Soporte", href: "/admin/support" },
        { icon: Settings, label: "Configuración", href: "/admin/settings" },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-gray-900 text-white flex flex-col transition-all duration-300 ease-in-out relative z-30 shadow-2xl",
                    isCollapsed ? "w-20" : "w-64"
                )}
            >
                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-10 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg z-50 hover:bg-blue-700 transition-colors"
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>

                <div className={cn(
                    "p-6 flex items-center gap-2 text-blue-400 font-black tracking-tighter border-b border-gray-800 transition-all duration-300",
                    isCollapsed ? "justify-center px-0" : "px-6"
                )}>
                    <ShieldCheck className="h-8 w-8 shrink-0 fill-current" />
                    {!isCollapsed && <span className="text-2xl animate-in fade-in duration-500">admin</span>}
                </div>

                <nav className="flex-1 px-3 py-8 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all duration-200 font-medium group relative",
                                isCollapsed && "justify-center px-0"
                            )}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">{item.label}</span>}
                            {isCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-bold whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className={cn(
                    "p-4 border-t border-gray-800 transition-all duration-300",
                    isCollapsed && "px-2"
                )}>
                    <LogoutButton className={cn(isCollapsed && "justify-center px-0")} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto flex flex-col relative">
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400 text-sm hidden sm:inline">Panel de Control</span>
                        <span className="text-gray-200 hidden sm:inline">/</span>
                        <span className="font-bold text-gray-900 uppercase tracking-widest text-[10px] bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                            Administrador
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <UserNav />
                    </div>
                </header>
                <div className="p-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
