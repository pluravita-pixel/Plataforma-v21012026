import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { UserNav } from "@/components/user-nav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />
                <main className="flex-1 overflow-y-auto bg-background">
                    <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 bg-card sticky top-0 z-10">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger />
                            <div className="h-4 w-px bg-border mx-2" />
                            <h2 className="text-sm font-medium">Panel de Control</h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <UserNav />
                        </div>
                    </header>
                    <div className="p-6">{children}</div>
                </main>
            </div>
        </SidebarProvider>
    );
}
