"use client";

import { useState } from "react";
import { runMaintenanceTasks } from "@/app/actions/maintenance";
import { toast } from "sonner";
import { RefreshCcw, Sparkles } from "lucide-react";

export function MaintenanceActions() {
    const [isLoading, setIsLoading] = useState(false);

    const handleRunTasks = async () => {
        if (!confirm("¿Seguro que quieres generar nombres de usuario y randomizar horarios para todos los psicólogos? Esto borrará slots no reservados actuales.")) return;

        setIsLoading(true);
        try {
            const result = await runMaintenanceTasks();
            if (result.success) {
                toast.success(result.success);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Error al ejecutar tareas de mantenimiento");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-black p-10 neo-border neo-shadow text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
                        <Sparkles className="h-8 w-8 text-[#A68363]" />
                        Mantenimiento Premium
                    </h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                        Genera links personalizados y horarios realistas automáticamente
                    </p>
                </div>
                <button
                    onClick={handleRunTasks}
                    disabled={isLoading}
                    className="group bg-[#A68363] hover:bg-white hover:text-black transition-all p-6 neo-border neo-shadow-sm hover:shadow-none flex items-center gap-4 disabled:opacity-50"
                >
                    <RefreshCcw className={`h-6 w-6 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    <span className="font-black uppercase tracking-tighter text-xl">Ejecutar Optimización</span>
                </button>
            </div>
        </div>
    );
}
