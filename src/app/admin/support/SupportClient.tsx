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
    Minimize2,
    ShieldCheck
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
            setTickets(prev => prev.map(t => t.id === id ? { ...t, isRead: true } : t));
            await markAsRead(id);
        }
    };

    const handleResolve = async (id: string) => {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t));
        const result = await resolveTicket(id);
        if (result.success) {
            toast.success("Ticket resuelto");
        } else {
            toast.error("Error al resolver");
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
        <div className="h-[calc(100vh-16rem)] flex bg-white neo-border neo-shadow-lg overflow-hidden animate-fade-in-up">
            {/* Sidebar / List */}
            <div className="w-96 border-r-4 border-black flex flex-col bg-gray-50">
                <div className="p-8 border-b-4 border-black bg-white">
                    <div className="flex items-center gap-4 mb-8">
                        <MessageSquare className="h-8 w-8 text-black" />
                        <h2 className="text-xl font-black uppercase tracking-tighter text-black">Tickets</h2>
                    </div>

                    <div className="flex bg-black p-1 gap-1">
                        {(['open', 'resolved', 'all'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-gray-200 text-black' : 'text-white hover:text-gray-300'
                                    }`}
                            >
                                {f === 'open' ? 'Abiertos' : f === 'resolved' ? 'Listos' : 'Todos'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y-4 divide-black scrollbar-thin scrollbar-thumb-black">
                    {filteredTickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            onClick={() => handleSelect(ticket.id)}
                            className={`p-6 cursor-pointer transition-all relative group ${selectedId === ticket.id ? 'bg-white' : 'hover:bg-white/50'
                                }`}
                        >
                            {!ticket.isRead && (
                                <div className="absolute top-8 left-2 w-3 h-3 bg-gray-900 neo-border" />
                            )}
                            <div className="flex justify-between items-start mb-2 gap-2">
                                <span className="text-[10px] font-black text-black/40 truncate">#{ticket.id.slice(0, 8)}</span>
                                <span className="text-[10px] text-black/60 font-black uppercase">{format(new Date(ticket.createdAt), "d MMM", { locale: es })}</span>
                            </div>
                            <h4 className={`text-sm truncate uppercase tracking-tight ${!ticket.isRead ? 'font-black text-black' : 'font-bold text-black/60'}`}>
                                {ticket.subject}
                            </h4>
                            <p className="text-[10px] text-black font-black uppercase tracking-widest mt-1 truncate">{ticket.user.fullName || ticket.user.email}</p>

                            {ticket.status === 'resolved' && (
                                <CheckCircle2 className="h-4 w-4 text-black absolute bottom-6 right-6" />
                            )}
                        </div>
                    ))}
                    {filteredTickets.length === 0 && (
                        <div className="p-16 text-center flex flex-col items-center gap-4 mt-10">
                            <div className="w-16 h-16 neo-border bg-white flex items-center justify-center">
                                <LifeBuoy className="h-8 w-8 text-black opacity-20" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Sin tickets</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Conversation / Detail */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
                {selectedTicket ? (
                    <>
                        {/* Header */}
                        <div className="px-10 py-8 border-b-4 border-black flex items-center justify-between sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-3xl font-black text-black tracking-tighter uppercase leading-none mb-2">{selectedTicket.subject}</h3>
                                <div className="flex items-center gap-4 text-[10px] font-black text-black uppercase tracking-widest">
                                    <span className="flex items-center gap-2 bg-gray-100 px-2 py-0.5 neo-border border-[1px]">
                                        <User className="h-3 w-3" />
                                        {selectedTicket.user.fullName}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Clock className="h-3 w-3" />
                                        {format(new Date(selectedTicket.createdAt), "d 'de' MMMM, HH:mm", { locale: es })}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                {selectedTicket.status === 'open' && (
                                    <button
                                        onClick={() => handleResolve(selectedTicket.id)}
                                        className="neo-btn-black h-12"
                                    >
                                        <CheckCircle2 className="h-5 w-5" />
                                        Resolver
                                    </button>
                                )}
                                {selectedTicket.status === 'resolved' && (
                                    <div className="bg-gray-100 text-black px-6 py-3 neo-border text-xs font-black uppercase flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5" />
                                        Ticket Resuelto
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-12 bg-gray-50/50 scrollbar-thin scrollbar-thumb-black">
                            {/* User Initial Message */}
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 neo-border bg-white flex items-center justify-center shrink-0 neo-shadow-sm">
                                    <User className="h-6 w-6 text-black" />
                                </div>
                                <div className="space-y-3 max-w-2xl">
                                    <div className="bg-white p-8 neo-border neo-shadow-sm">
                                        <p className="text-lg font-bold text-black leading-tight uppercase tracking-tight whitespace-pre-wrap">
                                            {selectedTicket.message}
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-black text-black/30 uppercase tracking-widest ml-1">Coach • {format(new Date(selectedTicket.createdAt), "HH:mm")}</span>
                                </div>
                            </div>

                            {/* Admin Response */}
                            {selectedTicket.adminResponse && (
                                <div className="flex gap-6 items-start flex-row-reverse">
                                    <div className="w-12 h-12 neo-border bg-black flex items-center justify-center shrink-0 neo-shadow-sm">
                                        <ShieldCheck className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="space-y-3 text-right max-w-2xl">
                                        <div className="bg-gray-100 p-8 neo-border neo-shadow-sm">
                                            <p className="text-lg font-black text-black leading-tight uppercase tracking-tight whitespace-pre-wrap">
                                                {selectedTicket.adminResponse}
                                            </p>
                                        </div>
                                        <span className="text-[10px] font-black text-black/30 uppercase tracking-widest mr-1">Tú • Pluravita Support</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reply Input Area */}
                        {selectedTicket.status === 'open' && (
                            <div className="p-10 border-t-4 border-black bg-white">
                                <div className="relative group">
                                    <textarea
                                        placeholder="ESCRIBE TU RESPUESTA..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        className="w-full min-h-[150px] p-8 neo-border bg-gray-50 text-base font-black uppercase tracking-tight focus:bg-white focus:outline-none transition-all resize-none pr-48"
                                    />
                                    <button
                                        onClick={() => handleReply(selectedId!)}
                                        disabled={isSubmitting || !replyText.trim()}
                                        className="absolute bottom-6 right-6 neo-btn-black h-14"
                                    >
                                        {isSubmitting ? "ENVIANDO..." : (
                                            <span className="flex items-center gap-3">
                                                <Send className="h-5 w-5" />
                                                Enviar
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-8 opacity-20 grayscale">
                        <div className="p-12 neo-border-4 border-black bg-gray-100">
                            <MessageSquare className="h-24 w-24 text-black" />
                        </div>
                        <div>
                            <h3 className="text-5xl font-black uppercase tracking-tighter">Selecciona Ticket</h3>
                            <p className="text-xl font-bold uppercase tracking-tight">Gestión administrativa de soporte</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
