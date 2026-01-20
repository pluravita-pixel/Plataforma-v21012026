import Link from "next/link";
import {
    LayoutDashboard,
    UserPlus,
    Database,
    Users,
    Settings,
    ShieldCheck,
    LogOut,
    MessageCircle
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { UserNav } from "@/components/user-nav";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const navItems = [
        { icon: LayoutDashboard, label: "Resumen", href: "/admin/dashboard" },
        { icon: UserPlus, label: "Añadir Coach", href: "/admin/add-psychologist" },
        { icon: Users, label: "Usuarios", href: "/admin/users" },
        { icon: MessageCircle, label: "Soporte", href: "/admin/support" },
        { icon: Settings, label: "Configuración", href: "/admin/settings" },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col">
                <div className="p-6 flex items-center gap-2 text-blue-400 font-black text-2xl tracking-tighter border-b border-gray-800">
                    <ShieldCheck className="h-8 w-8 fill-current" />
                    admin
                </div>

                <nav className="flex-1 px-4 py-8 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all duration-200 font-medium"
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <LogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400">Panel de Control</span>
                        <span className="text-gray-200">/</span>
                        <span className="font-bold text-gray-900 uppercase tracking-wider text-xs">Administrador</span>
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
