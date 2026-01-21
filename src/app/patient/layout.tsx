"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Search,
    Calendar,
    UserCircle,
    Medal,
    MessageCircle,
    LogOut,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { UserNav } from "@/components/user-nav";
import { cn } from "@/lib/utils";

export default function PatientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: "Inicio", href: "/patient/dashboard" },
        { icon: Search, label: "Buscar Coach", href: "/patient/search" },
        { icon: Calendar, label: "Mis Citas", href: "/patient/appointments" },
        { icon: UserCircle, label: "Mi Cuenta", href: "/patient/profile" },
    ];

    return (
        <div className="flex h-screen bg-[#FAFAFA] font-sans overflow-hidden">
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-white border-r border-gray-100 flex flex-col shadow-sm transition-all duration-300 ease-in-out relative z-30",
                    isCollapsed ? "w-20" : "w-64"
                )}
            >
                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-12 w-6 h-6 bg-[#4A3C31] rounded-full flex items-center justify-center text-white shadow-lg z-50 hover:bg-black transition-colors"
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>

                <div className={cn(
                    "p-8 flex items-center gap-2 text-[#4A3C31] font-black transition-all duration-300",
                    isCollapsed ? "justify-center px-0" : "px-8"
                )}>
                    <MessageCircle className="h-8 w-8 fill-current shrink-0" />
                    {!isCollapsed && <span className="text-2xl tracking-tight animate-in fade-in duration-500">pluravita</span>}
                </div>

                <nav className="flex-1 px-3 py-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 font-bold tracking-wide group relative",
                                    isActive
                                        ? "bg-[#4A3C31] text-white shadow-lg shadow-[#4A3C31]/20"
                                        : "text-gray-400 hover:bg-[#A68363]/5 hover:text-[#A68363]",
                                    isCollapsed && "justify-center px-0"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-5 w-5 shrink-0 transition-transform",
                                    !isActive && "group-hover:scale-110"
                                )} />
                                {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">{item.label}</span>}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-4 px-3 py-2 bg-[#4A3C31] text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all font-black uppercase tracking-widest z-50 shadow-2xl">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className={cn(
                    "p-6 border-t border-gray-50 transition-all duration-300",
                    isCollapsed && "px-2"
                )}>
                    <LogoutButton className={cn(
                        "w-full justify-start text-red-400 hover:text-red-500 hover:bg-red-50",
                        isCollapsed && "justify-center px-0 pl-0"
                    )} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto flex flex-col relative">
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center justify-between px-10 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <span className="text-gray-300 font-medium hidden sm:inline">Panel</span>
                        <span className="text-gray-200 hidden sm:inline">/</span>
                        <span className="font-black text-[#4A3C31] uppercase tracking-[0.2em] text-[10px] bg-[#F8F6F4] px-4 py-1.5 rounded-full border border-[#A68363]/10">
                            Paciente
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="h-8 w-px bg-gray-100"></div>
                        <UserNav />
                    </div>
                </header>
                <div className="p-10 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
