import Link from "next/link";
import {
    LayoutDashboard,
    Search,
    Calendar,
    UserCircle,
    Medal,
    MessageCircle,
    LogOut
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { UserNav } from "@/components/user-nav";

export default function PatientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const navItems = [
        { icon: LayoutDashboard, label: "Inicio", href: "/patient/dashboard" },
        { icon: Search, label: "Buscar Coach", href: "/patient/search" },
        { icon: Calendar, label: "Mis Citas", href: "/patient/appointments" },
        { icon: Medal, label: "Mi Progreso", href: "/patient/progress" },
        { icon: UserCircle, label: "Mi Cuenta", href: "/patient/profile" },
    ];

    return (
        <div className="flex h-screen bg-[#FAFAFA] font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm z-20">
                <div className="p-8 flex items-center gap-2 text-[#4A3C31] font-black text-2xl tracking-tight">
                    <MessageCircle className="h-8 w-8 fill-current" />
                    pluravita
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-5 py-3.5 text-gray-400 hover:bg-[#A68363]/5 hover:text-[#A68363] rounded-2xl transition-all duration-300 font-bold tracking-wide group"
                        >
                            <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-6 border-t border-gray-50">
                    <LogoutButton className="w-full justify-start pl-4 text-red-400 hover:text-red-500 hover:bg-red-50" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center justify-between px-10 sticky top-0 z-10 transition-all">
                    <div className="flex items-center gap-3">
                        <span className="text-gray-300 font-medium">Panel</span>
                        <span className="text-gray-200">/</span>
                        <span className="font-black text-[#4A3C31] uppercase tracking-widest text-xs">Paciente</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="h-8 w-px bg-gray-100"></div>
                        <UserNav />
                    </div>
                </header>
                <div className="p-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
