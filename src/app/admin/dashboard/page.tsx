import { getAdminStats, getAllUsers, getAllPsychologists } from "@/app/actions/admin";
import {
    Users,
    UserCheck,
    Calendar,
    BarChart3,
    ArrowUpRight,
    Search,
    Filter,
    MoreHorizontal,
    Activity
} from "lucide-react";

export default async function AdminDashboard() {
    const statsData = await getAdminStats();

    const stats = [
        { label: "Usuarios Totales", value: statsData.users, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Coaches Activos", value: statsData.psychologists, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Sesiones Totales", value: statsData.sessions, icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Conversión", value: "0%", icon: BarChart3, color: "text-orange-600", bg: "bg-orange-50" },
    ];

    const recentUsers = await getAllUsers();
    const allPsychologists = await getAllPsychologists();

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Users List */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">Usuarios Registrados</h2>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {recentUsers.length > 0 ? recentUsers.map((u, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs">
                                        {u.fullName?.[0] || u.email[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{u.fullName || "Sin nombre"}</p>
                                        <p className="text-[10px] text-gray-500 uppercase font-black">{u.email}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${u.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {u.role}
                                </span>
                            </div>
                        )) : <p className="text-gray-400 text-sm italic">No hay usuarios registrados</p>}
                    </div>
                </div>

                {/* Psychologists List */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight">Coaches en la Web</h2>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {allPsychologists.length > 0 ? allPsychologists.map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600 text-xs">
                                        C
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{p.fullName}</p>
                                        <p className="text-[10px] text-gray-500 uppercase font-black">{p.specialty}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-gray-900">{p.rating} ⭐</p>
                                </div>
                            </div>
                        )) : <p className="text-gray-400 text-sm italic">No hay coaches registrados</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
