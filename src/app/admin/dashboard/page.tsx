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
        { label: "Pacientes Totales", value: statsData.patients, icon: Users, color: "text-black", bg: "bg-white" },
        { label: "Dinero Facturado", value: `€${statsData.revenue.toFixed(2)}`, icon: Euro, color: "text-black", bg: "bg-gray-50" },
        { label: "Coaches Registrados", value: statsData.psychologists, icon: UserCheck, color: "text-black", bg: "bg-gray-100" },
        { label: "Citas Hoy", value: statsData.appointmentsToday, icon: Activity, color: "text-black", bg: "bg-white" },
    ];

    return (
        <div className="space-y-12 animate-fade-in-up">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-6xl font-black text-black tracking-tighter uppercase mb-2">Resumen</h1>
                    <p className="text-black font-bold uppercase tracking-widest text-sm bg-white border-2 border-black inline-block px-3">Datos del Sistema</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                    <div key={i} className={`${stat.bg} p-8 neo-border neo-shadow transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none`}>
                        <div className="flex items-center justify-between mb-6">
                            <div className={`p-4 neo-border bg-white text-black`}>
                                <stat.icon className="h-8 w-8" />
                            </div>
                        </div>
                        <div>
                            <p className="text-black text-xs font-black uppercase tracking-tighter">{stat.label}</p>
                            <p className="text-5xl font-black text-black mt-2 tracking-tighter">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-12">
                {/* Psychologists List */}
                <div className="bg-white p-10 neo-border neo-shadow">
                    <h2 className="text-3xl font-black text-black mb-10 uppercase tracking-tighter">Coaches en la Web</h2>
                    <div className="space-y-6 max-h-[700px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-black">
                        {allPsychologists.length > 0 ? allPsychologists.map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-6 bg-white neo-border hover:bg-gray-50 transition-colors neo-shadow-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 neo-border bg-gray-200 flex items-center justify-center font-black text-black text-xl">
                                        {p.fullName[0]}
                                    </div>
                                    <div>
                                        <p className="font-black text-black text-xl uppercase tracking-tight">{p.fullName}</p>
                                        <p className="text-xs text-black/60 uppercase font-black bg-gray-100 px-2 inline-block">{p.specialty || "General"}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-black">{p.rating} ⭐</p>
                                    <p className="text-xs text-black/40 font-bold uppercase tracking-widest leading-none mt-1">{p.email}</p>
                                </div>
                            </div>
                        )) : <p className="text-black font-bold uppercase opacity-20 text-center py-20">No hay coaches registrados</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
