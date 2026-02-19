"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/logo";
import {
    LayoutDashboard,
    Users,
    Calendar,
    Wallet,
    UserCircle,
    Settings,
    LifeBuoy,
    MessageCircle,
    Lightbulb,
    ChevronLeft,
    ChevronRight,
    Menu,
    X
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { UserNav } from "@/components/user-nav";
import { cn } from "@/lib/utils";

export default function OyenteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: "Panel de Psicólogo", href: "/oyente/dashboard" },
        { icon: Users, label: "Mis Usuarios", href: "/oyente/usuarios" },
        { icon: Calendar, label: "Calendario", href: "/oyente/calendar" },
        { icon: Wallet, label: "Saldo y Pagos", href: "/oyente/balance" },
        { icon: UserCircle, label: "Editar Perfil", href: "/oyente/profile" },
        { icon: Settings, label: "Configuración", href: "/oyente/settings" },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Mobile Menu Backdrop */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out relative z-50 shadow-sm",
                    isCollapsed ? "w-20" : "w-64",
                    // Mobile: hidden by default, shown as overlay when menu is open
                    "fixed lg:relative inset-y-0 left-0",
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Collapse Toggle - Desktop only */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex absolute -right-3 top-10 w-6 h-6 bg-[#0077FF] rounded-full items-center justify-center text-white shadow-lg z-50 hover:bg-blue-600 transition-colors"
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>

                <div className={cn(
                    "p-6 flex items-center transition-all duration-300 overflow-hidden",
                    isCollapsed ? "justify-center px-0" : "px-6"
                )}>
                    {isCollapsed ? (
                        <Logo minimal className="w-10 h-10" />
                    ) : (
                        <Logo className="w-40 h-12" />
                    )}
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch={true}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-[#0077FF] rounded-xl transition-all duration-200 font-medium group relative",
                                isCollapsed && "justify-center px-0"
                            )}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">{item.label}</span>}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-bold whitespace-nowrap z-50 shadow-xl">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className={cn(
                    "p-4 border-t border-gray-100 transition-all duration-300",
                    isCollapsed && "px-2"
                )}>
                    <LogoutButton className={cn(isCollapsed && "justify-center px-0")} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto flex flex-col relative">
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-20">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 text-gray-600 hover:text-[#0077FF] transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>

                    <div className="flex items-center gap-4">
                        <span className="text-gray-400 text-sm hidden sm:inline">Panel</span>
                        <span className="text-gray-200 hidden sm:inline">/</span>
                        <span className="font-bold text-gray-900 uppercase tracking-widest text-[10px] bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                            Psicólogo
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <UserNav />
                    </div>
                </header>
                <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
