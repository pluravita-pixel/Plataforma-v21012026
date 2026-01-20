"use client";

import {
    Users,
    Calendar,
    MessageSquare,
    Settings,
    LayoutDashboard,
    Briefcase,
    HelpCircle,
    LogOut
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const menuItems = [
    { icon: LayoutDashboard, label: "Vista General", href: "/" },
    { icon: Users, label: "Pacientes", href: "/patients" },
    { icon: Briefcase, label: "Terapeutas", href: "/therapists" },
    { icon: Calendar, label: "Agenda", href: "/schedule" },
    { icon: MessageSquare, label: "Sesiones", href: "/sessions" },
];

const secondaryItems = [
    { icon: Settings, label: "Configuración", href: "/settings" },
    { icon: HelpCircle, label: "Ayuda", href: "/help" },
];

import { logout } from "@/app/actions/auth";

const AdminLogout = () => {
    return (
        <form action={logout}>
            <button type="submit" className="text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4" />
            </button>
        </form>
    );
};

export function AppSidebar() {
    return (
        <Sidebar className="border-r">
            <SidebarHeader className="h-16 flex items-center px-6">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">
                        T
                    </div>
                    <span className="text-xl font-bold tracking-tight text-primary">pluravita</span>
                </div>
            </SidebarHeader>
            <Separator />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Principal</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.label}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.href} className="flex items-center gap-3">
                                            <item.icon className="h-5 w-5" />
                                            <span>{item.label}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-auto">
                    <SidebarGroupLabel>Sistema</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {secondaryItems.map((item) => (
                                <SidebarMenuItem key={item.label}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.href} className="flex items-center gap-3">
                                            <item.icon className="h-5 w-5" />
                                            <span>{item.label}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <Separator />
            <SidebarFooter className="p-4">
                <div className="flex items-center gap-3 px-2">
                    <Avatar className="h-9 w-9 border">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <span className="text-sm font-medium leading-none truncate">Admin</span>
                        <span className="text-xs text-muted-foreground truncate">pluravita@gmail.com</span>
                    </div>
                    <AdminLogout />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
