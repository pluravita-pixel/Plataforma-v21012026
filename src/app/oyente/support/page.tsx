import {
    MessageCircle,
    Clock,
    Search,
    FileQuestion
} from "lucide-react";
import NewTicketModal from "./NewTicketModal";
import { getMyTickets } from "@/app/actions/support";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function SupportPage() {
    const tickets = await getMyTickets();

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Centro de Soporte</h1>
                    <p className="text-gray-500 mt-1">Estamos aquí para ayudarte con cualquier problema o duda.</p>
                </div>
                <NewTicketModal />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FAQ / Helpful Links */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#0077FF] p-8 rounded-3xl text-white shadow-xl shadow-blue-100">
                        <MessageCircle className="h-10 w-10 mb-6 opacity-80" />
                        <h3 className="text-xl font-bold mb-2">Chat en vivo</h3>
                        <p className="text-white/70 text-sm leading-relaxed mb-6">¿Necesitas ayuda inmediata? Nuestro equipo de soporte está disponible de Lunes a Viernes de 9:00 a 18:00.</p>
                        <button className="w-full bg-white text-[#0077FF] font-bold py-3 rounded-xl text-sm hover:bg-blue-50 transition-all">
                            Iniciar Chat
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            <FileQuestion className="h-4 w-4 text-gray-400" />
                            Recursos populares
                        </h4>
                        <ul className="space-y-3">
                            {["Cómo optimizar mi perfil", "Guía de cobros y facturación", "Uso de la IA en sesiones", "Políticas de cancelación"].map((item, i) => (
                                <li key={i}>
                                    <a href="#" className="text-sm text-gray-500 hover:text-[#0077FF] hover:underline flex items-center justify-between group">
                                        {item}
                                        <Clock className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Tickets List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Mis Tickets</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    className="bg-gray-50 border-none rounded-lg pl-9 pr-4 py-1.5 text-xs focus:ring-1 focus:ring-blue-500/20 w-40"
                                />
                            </div>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {tickets.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-gray-400 text-sm">No tienes tickets abiertos actualmente.</p>
                                </div>
                            ) : (
                                tickets.map((ticket) => (
                                    <div key={ticket.id} className="p-8 hover:bg-gray-50/50 transition-all group border-b border-gray-50 last:border-none">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                                        #{ticket.id.slice(0, 8)}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${ticket.status === 'open' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                        }`}>
                                                        {ticket.status === 'open' ? 'Abierto' : 'Resuelto'}
                                                    </span>
                                                </div>
                                                <h4 className="text-xl font-black text-gray-900 group-hover:text-[#0077FF] transition-colors mb-2">{ticket.subject}</h4>
                                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap line-clamp-3">
                                                    {ticket.message}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center justify-end gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {format(new Date(ticket.createdAt), "d 'de' MMM, HH:mm", { locale: es })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Admin Response Section */}
                                        {ticket.adminResponse && (
                                            <div className="mt-6 ml-4 md:ml-10 p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 relative group-hover:bg-blue-50 transition-colors">
                                                <div className="absolute -left-4 top-8 w-4 h-px bg-blue-200" />
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
                                                        <MessageCircle className="h-3 w-3 text-white" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Respuesta de Pluravita</span>
                                                </div>
                                                <p className="text-sm text-blue-900/80 leading-relaxed font-medium italic">
                                                    "{ticket.adminResponse}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
