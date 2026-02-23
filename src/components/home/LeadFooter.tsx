'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Sparkles, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createLead } from '@/app/actions/leads'
import { toast } from 'sonner'

export function LeadFooter() {
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setIsSubmitting(true)
        const result = await createLead(email, 'footer')
        setIsSubmitting(false)

        if (result.success) {
            setIsSubmitted(true)
            toast.success('¡Genial! Revisa tu email para el descuento.')
        } else {
            toast.error('Hubo un error. Inténtalo de nuevo.')
        }
    }

    return (
        <section className="bg-white py-24 border-t border-[#F2EDE7]">
            <div className="container mx-auto px-6 md:px-12 lg:px-20">
                <div className="bg-[#F9F5F0] rounded-[3rem] p-12 md:p-20 overflow-hidden relative">
                    {/* Decorative background circles */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#A68363]/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#A68363]/5 rounded-full blur-3xl" />

                    <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-[#A68363] font-bold text-xs uppercase tracking-widest mb-6 shadow-sm">
                                <Sparkles className="h-4 w-4" />
                                Oferta Exclusiva
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-[#4A3C31] uppercase tracking-tighter leading-none mb-6">
                                Recibe un <br />
                                <span className="text-[#A68363]">descuento</span>
                            </h2>
                            <p className="text-lg text-[#6B6B6B] font-medium leading-relaxed">
                                Queremos que des el primer paso sin excusas. Déjanos tu email y te enviamos un código especial para tu primera sesión.
                            </p>
                        </div>

                        <div className="w-full max-w-md">
                            {!isSubmitted ? (
                                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <div className="relative">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="email"
                                            placeholder="Tu correo electrónico"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full pl-16 pr-6 py-6 bg-white border-transparent rounded-3xl shadow-sm focus:ring-2 ring-[#A68363]/20 transition-all font-medium text-[#4A3C31] placeholder:text-gray-400"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-8 bg-[#A68363] hover:bg-[#8C6F56] text-white rounded-3xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                                    >
                                        {isSubmitting ? 'Enviando...' : (
                                            <>
                                                Enviar descuento
                                                <Send className="h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white p-10 rounded-[2rem] text-center shadow-sm"
                                >
                                    <div className="mb-4 bg-[#F2EDE7] w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                                        <Sparkles className="h-6 w-6 text-[#A68363]" />
                                    </div>
                                    <h3 className="text-xl font-black text-[#4A3C31] uppercase tracking-tight mb-2">¡Todo listo!</h3>
                                    <p className="text-[#6B6B6B] font-medium">Revisa {email} para tu regalo.</p>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
