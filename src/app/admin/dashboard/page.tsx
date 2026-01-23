export const dynamic = 'force-dynamic';
import { getAdminStats, getAllPsychologists } from "@/app/actions/admin";
import {
    Users,
    UserCheck,
    Calendar,
    BarChart3,
    ArrowUpRight,
    Search,
    Filter,
    MoreHorizontal,
    Activity,
    Euro
} from "lucide-react";

export default async function AdminDashboard() {
    const [statsData, allPsychologists] = await Promise.all([
        getAdminStats(),
        getAllPsychologists()
    ]);

    const stats = [
        { label: "Coaches Registrados", value: statsData.psychologists, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Citas Totales", value: statsData.sessions, icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
        {
            label: "Ingresos Totales",
            // @ts-ignore
            value: `€${statsData.revenue.toFixed(2)}`,
            icon: Euro,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        { label: "Usuarios Totales", value: statsData.users, icon: Users, color: "text-orange-600", bg: "bg-orange-50" },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">RESUMEN DEL SISTEMA</h1>
                    <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">Datos en tiempo real de la plataforma</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs font-black uppercase tracking-widest">{stat.label}</p>
                            <p className="text-4xl font-black text-gray-900 mt-2 tracking-tighter">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Psychologists List */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">Coaches en la Web</h2>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {allPsychologists.length > 0 ? allPsychologists.map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600 text-xs">
                                        C
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{p.fullName}</p>
                                        <p className="text-[10px] text-gray-500 uppercase font-black">{p.specialty || "General"}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-gray-900">{p.rating} ⭐</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{p.email}</p>
                                </div>
                            </div>
                        )) : <p className="text-gray-400 text-sm italic">No hay coaches registrados</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
