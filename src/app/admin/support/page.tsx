import { getAllTickets, resolveTicket } from "@/app/actions/support";
import {
    LifeBuoy,
    Clock,
    CheckCircle2,
    User,
    MessageSquare,
    AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function AdminSupportPage() {
    const tickets = await getAllTickets();

    const openTickets = tickets.filter(t => t.status === 'open');
    const resolvedTickets = tickets.filter(t => t.status === 'resolved');

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Centro de Soporte Admin</h1>
                    <p className="text-gray-500 mt-1">Gestiona las solicitudes de soporte de los psicólogos.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                        <span className="text-blue-600 font-bold text-lg">{openTickets.length}</span>
                        <span className="text-blue-600/70 text-sm ml-2 font-medium">Pendientes</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
                        <LifeBuoy className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">No hay tickets de soporte registrados.</p>
                    </div>
                ) : (
                    tickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            className={`bg-white rounded-[2rem] border transition-all duration-300 ${ticket.status === 'open'
                                    ? 'border-blue-100 shadow-sm hover:shadow-md'
                                    : 'border-gray-100 opacity-75'
                                }`}
                        >
                            <div className="p-8">
                                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${ticket.status === 'open' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'
                                            }`}>
                                            <MessageSquare className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                    #{ticket.id.slice(0, 8)}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${ticket.status === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {ticket.status === 'open' ? 'Pendiente' : 'Resuelto'}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">{ticket.subject}</h3>
                                        </div>
                                    </div>

                                    {ticket.status === 'open' && (
                                        <form action={async () => {
                                            "use server";
                                            await resolveTicket(ticket.id);
                                        }}>
                                            <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Marcar como Resuelto
                                            </button>
                                        </form>
                                    )}
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {ticket.message}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-xs leading-none mb-1">
                                                {ticket.user.fullName || 'Usuario'}
                                            </p>
                                            <p className="text-[10px] text-gray-400 leading-none">
                                                {ticket.user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span>
                                            {format(new Date(ticket.createdAt), "d 'de' MMMM, HH:mm", { locale: es })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
