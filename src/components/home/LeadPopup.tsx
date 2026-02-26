'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createLead } from '@/app/actions/leads'
import { toast } from 'sonner'

export function LeadPopup() {
    const [isOpen, setIsOpen] = useState(false)
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const [hasScrolledDeep, setHasScrolledDeep] = useState(false)

    // Helper to get cookie
    const getCookie = (name: string) => {
        if (typeof document === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
    }

    // Helper to set cookie
    const setCookie = (name: string, value: string, days: number) => {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${d.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
    }

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 600) {
                setHasScrolledDeep(true)
                // If it's already open and we scroll deep, we might want to close it
                // but usually the user wants it NOT to show up if they already scrolled.
                setIsOpen(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        // Only show if the "submitted" cookie doesn't exist
        const hasSubmitted = getCookie('pluravita_lead_submitted')

        if (!hasSubmitted) {
            const timer = setTimeout(() => {
                // ONLY open if the user hasn't scrolled significantly
                if (window.scrollY < 600 && !hasScrolledDeep) {
                    setIsOpen(true)
                }
            }, 6000) // Slightly longer wait
            return () => clearTimeout(timer)
        }
    }, [hasScrolledDeep])

    const handleClose = () => {
        setIsOpen(false)
        // We DON'T set any persistent cookie here, so it will show again on refresh
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setIsSubmitting(true)
        const result = await createLead(email, 'popup')
        setIsSubmitting(false)

        if (result.success) {
            setIsSubmitted(true)
            // SET THE SECRET COOKIE ONLY ON SUCCESS
            setCookie('pluravita_lead_submitted', 'true', 365)

            toast.success('¡Genial! Revisa tu email para el descuento.')
            setTimeout(() => {
                setIsOpen(false)
            }, 3000)
        } else {
            toast.error('Hubo un error. Inténtalo de nuevo.')
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        <button
                            onClick={handleClose}
                            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-full"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="p-10 flex flex-col items-center text-center">
                            <div className="mb-6 bg-[#F9F5F0] p-4 rounded-full">
                                <Sparkles className="h-8 w-8 text-[#A68363]" />
                            </div>

                            {!isSubmitted ? (
                                <>
                                    <h2 className="text-3xl font-black text-[#4A3C31] uppercase tracking-tighter leading-none mb-4">
                                        ¿Quieres un <br />
                                        <span className="text-[#A68363]">descuento especial?</span>
                                    </h2>
                                    <p className="text-[#6B6B6B] font-medium mb-8">
                                        Déjanos tu email y recibe un código exclusivo para tu primera sesión.
                                    </p>

                                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="email"
                                                placeholder="tu@email.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 ring-[#A68363]/20 transition-all font-medium text-[#4A3C31]"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-7 bg-[#A68363] hover:bg-[#8C6F56] text-white rounded-2xl font-black uppercase tracking-widest transition-all"
                                        >
                                            {isSubmitting ? 'Enviando...' : 'Recibir descuento'}
                                        </Button>
                                    </form>
                                </>
                            ) : (
                                <div className="py-10">
                                    <h2 className="text-2xl font-black text-[#4A3C31] uppercase tracking-tighter mb-4">
                                        ¡Gracias!
                                    </h2>
                                    <p className="text-[#6B6B6B] font-medium">
                                        Te hemos enviado el descuento a {email}.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
