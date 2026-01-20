import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    Calendar,
    Wallet,
    UserCircle,
    Settings,
    LifeBuoy,
    MessageCircle,
    Lightbulb
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { UserNav } from "@/components/user-nav";

export default function PsychologistLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const navItems = [
        { icon: LayoutDashboard, label: "Panel Principal", href: "/psychologist/dashboard" },
        { icon: Users, label: "Mis Pacientes", href: "/psychologist/patients" },
        { icon: Calendar, label: "Calendario", href: "/psychologist/calendar" },
        { icon: Wallet, label: "Saldo y Pagos", href: "/psychologist/balance" },
        { icon: UserCircle, label: "Editar Perfil", href: "/psychologist/profile" },
        { icon: Settings, label: "Configuración", href: "/psychologist/settings" },
        { icon: LifeBuoy, label: "Soporte", href: "/psychologist/support" },
        { icon: Lightbulb, label: "Guía de inicio", href: "/psychologist/tips" },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 flex items-center gap-2 text-[#0077FF] font-black text-2xl tracking-tighter">
                    <MessageCircle className="h-8 w-8 fill-current" />
                    pluravita
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-[#0077FF] rounded-xl transition-all duration-200 font-medium"
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <LogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400">Panel</span>
                        <span className="text-gray-200">/</span>
                        <span className="font-bold text-gray-900 uppercase tracking-wider text-xs">Coach</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <UserNav />
                    </div>
                </header>
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
