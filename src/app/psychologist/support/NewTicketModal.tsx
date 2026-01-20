"use client";

import { useState } from "react";
import { LifeBuoy, Send, Plus } from "lucide-react";
import { createTicket } from "@/app/actions/support";
import { toast } from "sonner";

export default function NewTicketModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async () => {
        if (!subject || !message) {
            toast.error("Por favor completa todos los campos");
            return;
        }

        setIsPending(true);
        try {
            const result = await createTicket(subject, message);
            if (result.success) {
                toast.success("Ticket enviado correctamente");
                setSubject("");
                setMessage("");
                setIsOpen(false);
            } else {
                toast.error(result.error || "Error al enviar ticket");
            }
        } catch (error) {
            toast.error("Ocurrió un error inesperado");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95"
            >
                <Plus className="h-4 w-4" />
                Abrir nuevo ticket
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-50 text-[#0077FF] rounded-2xl">
                                    <LifeBuoy className="h-6 w-6" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase">Nuevo Ticket</h2>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 font-bold"
                            >
                                Cerrar
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Asunto</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border-gray-200 rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-blue-500/10 transition-all border outline-none font-medium"
                                    placeholder="¿En qué podemos ayudarte?"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Mensaje</label>
                                <textarea
                                    className="w-full bg-gray-50 border-gray-200 rounded-2xl px-6 py-4 text-sm focus:ring-4 focus:ring-blue-500/10 transition-all min-h-[200px] border outline-none font-medium"
                                    placeholder="Describe tu problema con el mayor detalle posible..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={isPending}
                                className="w-full bg-[#0077FF] text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 uppercase tracking-widest text-sm disabled:opacity-50"
                            >
                                <Send className={`h-4 w-4 ${isPending ? 'animate-pulse' : ''}`} />
                                {isPending ? "Enviando..." : "Enviar Ticket"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
