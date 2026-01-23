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

export function SupportClient({ tickets }: SupportClientProps) {
    // Determine initially open tickets (e.g. only unread ones?)
    // Or start all minimized except maybe the first one?
    // Let's start with empty set (all minimized) to keep it "clean and small"
    const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set());
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedTickets);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
            // If expanding, mark as read if not already?
            // Maybe handle that explicitly with an effect or just let user click "Mark as Read"
            // Or simple auto-read on expand:
            // handleMarkAsRead(id); // Optional, but implies "I looked at it"
        }
        setExpandedTickets(newSet);
    };

    const handleResolve = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const result = await resolveTicket(id);
        if (result.success) {
            toast.success("Ticket marcado como resuelto");
        } else {
            toast.error("Error al resolver ticket");
        }
    };

    const handleMarkRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const result = await markAsRead(id);
        if (result.success) {
            toast.success("Marcado como leído");
        }
    };

    const handleReply = async (id: string) => {
        if (!replyText.trim()) return;
        setIsSubmitting(true);
        const result = await replyToTicket(id, replyText);
        setIsSubmitting(false);

        if (result.success) {
            toast.success("Respuesta enviada");
            setReplyingTo(null);
            setReplyText("");
            // Logic to update local state if needed, but page reval should handle it
        } else {
            toast.error("Error al enviar respuesta");
        }
    };

    const openTicketsCount = tickets.filter(t => t.status === 'open').length;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <MessageSquare className="h-8 w-8 text-blue-600" />
                        SOPORTE DE COACHES
                    </h1>
                    <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest pl-1">
                        Gestiona consultas y problemas reportados
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        <div>
                            <span className="block text-xl font-black text-gray-900 leading-none">{openTicketsCount}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pendientes</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-dashed border-gray-200">
                        <LifeBuoy className="h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-gray-500 font-bold text-sm uppercase tracking-wide">No hay tickets de soporte</p>
                    </div>
                ) : (
                    tickets.map((ticket) => {
                        const isExpanded = expandedTickets.has(ticket.id);
                        return (
                            <div
                                key={ticket.id}
                                className={`bg-white border transition-all duration-300 overflow-hidden group
                                    ${isExpanded ? 'rounded-[2rem] shadow-lg border-blue-100 ring-1 ring-blue-50' : 'rounded-2xl border-gray-100 hover:border-gray-200 hover:shadow-md'}
                                    ${ticket.isRead ? 'bg-white' : 'bg-blue-50/10'}
                                `}
                            >
                                {/* Header - Always Visible */}
                                <div
                                    onClick={() => toggleExpand(ticket.id)}
                                    className="p-6 cursor-pointer flex items-center justify-between gap-4 select-none relative"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className={`p-3 rounded-xl transition-colors ${ticket.status === 'open'
                                                ? (ticket.isRead ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600')
                                                : 'bg-emerald-100 text-emerald-600'
                                            }`}>
                                            {ticket.status === 'open' ? <MessageSquare className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className={`text-base truncate ${isExpanded ? 'font-black' : 'font-bold'} text-gray-900`}>
                                                    {ticket.subject}
                                                </h3>
                                                {!ticket.isRead && (
                                                    <span className="h-2 w-2 rounded-full bg-blue-500 block shrink-0" title="No leído" />
                                                )}
                                                {ticket.status === 'resolved' && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">Resuelto</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {ticket.user.fullName || ticket.user.email}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {format(new Date(ticket.createdAt), "d MMM, HH:mm", { locale: es })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Actions shown when collapsed? Maybe quick actions? */}
                                        {!isExpanded && !ticket.isRead && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => handleMarkRead(ticket.id, e)}
                                                className="hidden group-hover:flex h-8 px-3 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
                                            >
                                                Marcar leído
                                            </Button>
                                        )}
                                        {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-300" /> : <ChevronDown className="h-5 w-5 text-gray-300" />}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div className="px-8 pb-8 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="h-px bg-gray-100 mb-6" />

                                        <div className="space-y-6">
                                            {/* Message Body */}
                                            <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100">
                                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                                                    {ticket.message}
                                                </p>
                                            </div>

                                            {/* Admin Response if exists */}
                                            {ticket.adminResponse && (
                                                <div className="ml-8 bg-blue-50/50 p-6 rounded-2xl border border-blue-100 relative">
                                                    <div className="absolute -left-4 top-6 w-4 h-px bg-blue-200" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Tu Respuesta</p>
                                                    <p className="text-gray-700 text-sm">{ticket.adminResponse}</p>
                                                </div>
                                            )}

                                            {/* Actions Toolbar */}
                                            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                                                {!ticket.isRead && (
                                                    <Button
                                                        variant="ghost"
                                                        onClick={(e) => handleMarkRead(ticket.id, e)}
                                                        className="h-10 px-4 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Marcar Leído
                                                    </Button>
                                                )}

                                                {ticket.status === 'open' && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setReplyingTo(replyingTo === ticket.id ? null : ticket.id)}
                                                            className="h-10 px-6 rounded-xl border-gray-200 text-xs font-black uppercase tracking-wider hover:bg-gray-50"
                                                        >
                                                            {replyingTo === ticket.id ? 'Cancelar Respuesta' : 'Responder'}
                                                        </Button>

                                                        <Button
                                                            onClick={(e) => handleResolve(ticket.id, e)}
                                                            className="h-10 px-6 rounded-xl bg-gray-900 text-white text-xs font-black uppercase tracking-wider hover:bg-black shadow-lg shadow-gray-200"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                                            Resolver
                                                        </Button>
                                                    </>
                                                )}
                                            </div>

                                            {/* Reply Field */}
                                            {replyingTo === ticket.id && (
                                                <div className="animate-in fade-in slide-in-from-top-2">
                                                    <div className="relative">
                                                        <Textarea
                                                            placeholder="Escribe tu respuesta para el coach..."
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            className="min-h-[120px] rounded-2xl border-gray-200 bg-white p-4 text-sm resize-none focus:ring-2 focus:ring-blue-500/20"
                                                        />
                                                        <Button
                                                            onClick={() => handleReply(ticket.id)}
                                                            disabled={isSubmitting || !replyText.trim()}
                                                            className="absolute bottom-4 right-4 h-8 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                                                        >
                                                            {isSubmitting ? "Enviando..." : (
                                                                <>
                                                                    <Send className="h-3 w-3 mr-2" />
                                                                    Enviar Respuesta
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
