export const dynamic = 'force-dynamic';
import { getAllPsychologists, getAllUsers } from "@/app/actions/admin";
import {
    Database,
    Table as TableIcon,
    Download,
    RefreshCcw,
    Search,
    ChevronDown
} from "lucide-react";

export default async function DatabasePage() {
    const psychologists = await getAllPsychologists();
    const users = await getAllUsers();

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4 uppercase">
                        Acceso a Base de Datos
                    </h1>
                    <p className="text-gray-500 mt-4 text-sm font-bold tracking-widest uppercase">Consulta y gestión cruda de registros</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
                        <Download className="h-4 w-4" />
                        Exportar CSV
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg">
                        <RefreshCcw className="h-4 w-4" />
                        Refrescar
                    </button>
                </div>
            </div>

            {/* Psychologists Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
                            <TableIcon className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 uppercase">Tabla: Coaches</h2>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar en coaches..."
                            className="bg-white border-none rounded-[1rem] pl-12 pr-4 py-3 text-xs font-bold w-64 focus:ring-2 focus:ring-blue-500/10"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Especialidad</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Saldo</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha Registro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {psychologists.map((ps) => (
                                <tr key={ps.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-8 py-4 text-[10px] font-mono text-gray-400 truncate max-w-[100px]">{ps.id}</td>
                                    <td className="px-8 py-4 text-sm font-bold text-gray-900">{ps.fullName}</td>
                                    <td className="px-8 py-4 text-sm text-gray-500">{ps.specialty}</td>
                                    <td className="px-8 py-4 text-sm font-black text-emerald-600">€{ps.balance}</td>
                                    <td className="px-8 py-4 text-sm text-gray-400">{new Date(ps.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-purple-600">
                            <TableIcon className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 uppercase">Tabla: Usuarios</h2>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rol</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Último Login</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-8 py-4 text-sm font-bold text-gray-900">{u.fullName}</td>
                                    <td className="px-8 py-4 text-sm text-gray-500">{u.email}</td>
                                    <td className="px-8 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${u.role === 'admin' ? 'bg-red-50 text-red-600' :
                                            u.role === 'psychologist' ? 'bg-emerald-50 text-emerald-600' :
                                                'bg-gray-100 text-gray-500'
                                            }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-sm text-gray-400">
                                        {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Nunca'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
