"use client";

import { useState } from "react";
import {
    LifeBuoy,
    Clock,
    CheckCircle2,
    User,
    MessageSquare,
    ChevronDown,
    ChevronUp,
    Send,
    Eye,
    Minimize2
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { resolveTicket, replyToTicket, markAsRead } from "@/app/actions/support";

interface User {
    fullName: string | null;
    email: string;
}

interface Ticket {
    id: string;
    subject: string;
    message: string;
    status: string; // 'open' | 'resolved'
    isRead: boolean;
    adminResponse: string | null;
    createdAt: Date;
    user: User;
}

interface SupportClientProps {
    tickets: Ticket[];
}

export function SupportClient({ tickets: initialTickets }: SupportClientProps) {
    const [tickets, setTickets] = useState(initialTickets);
    const [selectedId, setSelectedId] = useState<string | null>(initialTickets[0]?.id || null);
    const [replyText, setReplyText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('open');

    const selectedTicket = tickets.find(t => t.id === selectedId);

    const filteredTickets = tickets.filter(t => {
        if (filter === 'all') return true;
        return t.status === filter;
    });

    const handleSelect = async (id: string) => {
        setSelectedId(id);
        const ticket = tickets.find(t => t.id === id);
        if (ticket && !ticket.isRead) {
            // Optimistic update
            setTickets(prev => prev.map(t => t.id === id ? { ...t, isRead: true } : t));
            await markAsRead(id);
        }
    };

    const handleResolve = async (id: string) => {
        // Optimistic update
        setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
        const result = await resolveTicket(id);
        if (result.success) {
            toast.success("Ticket resuelto");
        } else {
            toast.error("Error al resolver");
            // Rollback if needed, but for simplicity we keep it
        }
    };

    const handleReply = async (id: string) => {
        if (!replyText.trim()) return;
        setIsSubmitting(true);
        const result = await replyToTicket(id, replyText);
        setIsSubmitting(false);

        if (result.success) {
            toast.success("Respuesta enviada");
            setTickets(prev => prev.map(t => t.id === id ? { ...t, adminResponse: replyText, isRead: true } : t));
            setReplyText("");
        } else {
            toast.error("Error al enviar respuesta");
        }
    };

    return (
        <div className="h-[calc(100vh-12rem)] flex bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Sidebar / List */}
            <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/30">
                <div className="p-6 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-3 mb-6">
                        <MessageSquare className="h-6 w-6 text-blue-600" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">Tickets</h2>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                        {(['open', 'resolved', 'all'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-tighter rounded-lg transition-all ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {f === 'open' ? 'Abiertos' : f === 'resolved' ? 'Listos' : 'Todos'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                    {filteredTickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            onClick={() => handleSelect(ticket.id)}
                            className={`p-5 cursor-pointer transition-all relative group ${selectedId === ticket.id ? 'bg-white shadow-inner border-l-4 border-l-blue-600' : 'hover:bg-white'
                                }`}
                        >
                            {!ticket.isRead && (
                                <div className="absolute top-6 left-2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            )}
                            <div className="flex justify-between items-start mb-1 gap-2">
                                <span className="text-[10px] font-bold text-gray-400 truncate">#{ticket.id.slice(0, 8)}</span>
                                <span className="text-[10px] text-gray-400 whitespace-nowrap">{format(new Date(ticket.createdAt), "d MMM", { locale: es })}</span>
                            </div>
                            <h4 className={`text-xs truncate ${!ticket.isRead ? 'font-black text-gray-900' : 'font-bold text-gray-600'}`}>
                                {ticket.subject}
                            </h4>
                            <p className="text-[10px] text-gray-400 mt-1 truncate">{ticket.user.fullName || ticket.user.email}</p>

                            {ticket.status === 'resolved' && (
                                <CheckCircle2 className="h-3 w-3 text-emerald-500 absolute bottom-5 right-5" />
                            )}
                        </div>
                    ))}
                    {filteredTickets.length === 0 && (
                        <div className="p-10 text-center opacity-40 grayscale flex flex-col items-center gap-3 mt-10">
                            <LifeBuoy className="h-8 w-8" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Sin tickets</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Conversation / Detail */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
                {selectedTicket ? (
                    <>
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 leading-tight">{selectedTicket.subject}</h3>
                                <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <span className="flex items-center gap-1 text-blue-600">
                                        <User className="h-3 w-3" />
                                        {selectedTicket.user.fullName} ({selectedTicket.user.email})
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {format(new Date(selectedTicket.createdAt), "d 'de' MMMM, HH:mm", { locale: es })}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {selectedTicket.status === 'open' && (
                                    <Button
                                        onClick={() => handleResolve(selectedTicket.id)}
                                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-[10px] font-black uppercase h-10 px-6 shadow-none"
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Marcar Resuelto
                                    </Button>
                                )}
                                {selectedTicket.status === 'resolved' && (
                                    <div className="bg-emerald-50 text-emerald-700 px-6 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border border-emerald-100">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Ticket Resuelto
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/20">
                            {/* User Initial Message */}
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 shadow-sm">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="space-y-2">
                                    <div className="bg-white p-6 rounded-[2rem] rounded-tl-none border border-gray-100 shadow-sm max-w-2xl">
                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            {selectedTicket.message}
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-300 ml-2 uppercase">Coach • {format(new Date(selectedTicket.createdAt), "HH:mm")}</span>
                                </div>
                            </div>

                            {/* Admin Response */}
                            {selectedTicket.adminResponse && (
                                <div className="flex gap-4 flex-row-reverse">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                                        <ShieldCheck className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="space-y-2 text-right">
                                        <div className="bg-blue-600 p-6 rounded-[2rem] rounded-tr-none text-white shadow-xl shadow-blue-100 max-w-2xl ml-auto">
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                                {selectedTicket.adminResponse}
                                            </p>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-300 mr-2 uppercase">Administrador • Enviado</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reply Input Area */}
                        {selectedTicket.status === 'open' && (
                            <div className="p-8 border-t border-gray-100 bg-white">
                                <div className="relative group">
                                    <textarea
                                        placeholder="Escribe una respuesta rápida y profesional..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        className="w-full min-h-[120px] p-6 rounded-[2rem] border-gray-100 bg-gray-50/50 text-sm focus:bg-white focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all resize-none pr-32"
                                    />
                                    <Button
                                        onClick={() => handleReply(selectedTicket.id)}
                                        disabled={isSubmitting || !replyText.trim()}
                                        className="absolute bottom-6 right-6 h-12 px-6 rounded-2xl bg-gray-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-30"
                                    >
                                        {isSubmitting ? "Enviando..." : (
                                            <span className="flex items-center gap-2">
                                                <Send className="h-4 w-4" />
                                                Responder
                                            </span>
                                        )}
                                    </Button>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-4 text-center font-bold uppercase tracking-widest opacity-60">
                                    Al responder, el coach recibirá una notificación en su panel de soporte.
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-4 opacity-30 grayscale">
                        <div className="p-10 rounded-full bg-gray-50">
                            <MessageSquare className="h-20 w-20 text-gray-300" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter">Selecciona un ticket</h3>
                            <p className="text-sm font-medium">Usa la lista de la izquierda para empezar a gestionar</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Ensure icon is available in scope if needed but I'm using imports from before.
import { ShieldCheck } from "lucide-react";

