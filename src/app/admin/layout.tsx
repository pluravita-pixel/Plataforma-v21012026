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
        <div className="flex h-screen bg-white overflow-hidden font-bold">
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-gray-50 text-black flex flex-col transition-all duration-300 ease-in-out relative z-50 neo-border-r border-r-4 border-black",
                    isCollapsed ? "w-24" : "w-72"
                )}
            >
                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-5 top-10 w-10 h-10 bg-black rounded-none flex items-center justify-center text-white z-50 hover:bg-gray-800 transition-colors neo-border-l-0"
                >
                    {isCollapsed ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
                </button>

                <div className={cn(
                    "p-8 flex items-center gap-3 text-black font-black tracking-tighter border-b-4 border-black transition-all duration-300",
                    isCollapsed ? "justify-center px-0" : "px-8"
                )}>
                    <ShieldCheck className="h-10 w-10 shrink-0 fill-current" />
                    {!isCollapsed && <span className="text-3xl uppercase">Admin</span>}
                </div>

                <nav className="flex-1 px-4 py-10 space-y-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch={true}
                            className={cn(
                                "flex items-center gap-4 px-6 py-4 text-black hover:bg-black hover:text-white transition-all duration-200 font-black uppercase tracking-tight group relative neo-border border-2 hover:border-black",
                                isCollapsed && "justify-center px-0"
                            )}
                        >
                            <item.icon className="h-6 w-6 shrink-0" />
                            {!isCollapsed && <span className="text-sm">{item.label}</span>}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-3 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className={cn(
                    "p-6 border-t-4 border-black transition-all duration-300",
                    isCollapsed && "px-2"
                )}>
                    <LogoutButton className={cn("neo-btn-black w-full justify-center", isCollapsed && "px-0")} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto flex flex-col relative bg-white">
                <header className="bg-white border-b-4 border-black h-24 flex items-center justify-between px-10 sticky top-0 z-20">
                    <div className="flex items-center gap-6">
                        <span className="text-black/40 text-[10px] font-black uppercase tracking-widest hidden sm:inline">Portal Administrativo</span>
                        <span className="text-black/20 hidden sm:inline">/</span>
                        <span className="font-black text-black uppercase tracking-widest text-sm bg-gray-100 px-4 py-1 neo-border">
                            Pluravita
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <UserNav />
                    </div>
                </header>
                <div className="p-12 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
