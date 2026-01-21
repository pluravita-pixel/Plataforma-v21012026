"use client";

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MessageCircle, Copy, Check, Star, Globe, Calendar, Video, UserCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { getPsychologists } from "@/app/actions/psychologists"
import { getCurrentUser } from "@/app/actions/auth" // Added
import type { Psychologist, User } from "@/db/schema"
import { BookingModal } from "@/components/booking/BookingModal"

export default function AffinityResultsPage() {
    const [copied, setCopied] = useState(false)
    const [psychologists, setPsychologists] = useState<Psychologist[]>([])
    const [currentUser, setCurrentUser] = useState<any>(null) // Added
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPsychs = async () => {
            const [data, user] = await Promise.all([
                getPsychologists(),
                getCurrentUser()
            ])
            setPsychologists(data as Psychologist[])
            setCurrentUser(user)
            setLoading(false)
        }
        fetchPsychs()
    }, [])

    const copyCoupon = () => {
        navigator.clipboard.writeText("MATCH-40")
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="min-h-screen bg-[#F9F5F0] flex flex-col">
            <title>Resultados de Afinidad | pluravita</title>

            {/* Simple Header */}
            <header className="w-full bg-white border-b border-gray-100 py-4 px-6 z-20">
                <div className="max-w-7xl mx-auto flex items-center">
                    <Link href="/" className="text-[#4A3C31] font-black text-2xl tracking-tighter flex items-center gap-1">
                        <MessageCircle className="h-6 w-6 fill-current" />
                        pluravita
                    </Link>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12 md:py-16">
                {/* Hero Section */}
                <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                    >
                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                            <Image
                                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"
                                alt="Resultados listos"
                                fill
                                className="object-cover"
                            />
                        </div>
                        {/* Decorative floating element */}
                        <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-[#F2EDE7] max-w-[200px] hidden md:block" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-[#4A3C31] leading-tight">
                                Tus resultados están listos
                            </h1>
                            <p className="text-lg text-[#6B6B6B] font-medium max-w-lg">
                                Utiliza el cupón <span className="text-[#A68363] font-bold">MATCH-40</span> y obtén 40% de descuento en tu primera sesión de coaching en línea en pluravita.
                            </p>
                        </div>

                        {/* Coupon Box */}
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md">
                            <div className="flex-1 bg-white border-2 border-dashed border-[#A68363]/30 rounded-xl px-6 py-4 flex items-center justify-between group hover:border-[#A68363]/50 transition-colors">
                                <span className="text-xl font-black text-[#4A3C31] tracking-wider uppercase">MATCH-40</span>
                                <Button
                                    onClick={copyCoupon}
                                    variant="ghost"
                                    className="text-[#A68363] hover:bg-[#F2EDE7] transition-colors gap-2"
                                >
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    {copied ? "¡Copiado!" : "Copiar"}
                                </Button>
                            </div>
                        </div>

                        <Button
                            className="bg-[#A68363] hover:opacity-90 text-white font-bold py-7 px-10 rounded-xl text-lg shadow-lg shadow-gray-200 transition-all active:scale-[0.98]"
                            asChild
                        >
                            <Link href="#recommended">Ver mis coaches</Link>
                        </Button>
                    </motion.div>
                </div>

                {/* Siguientes Pasos Section */}
                <div className="mb-24">
                    <h2 className="text-2xl font-bold text-[#4A3C31] mb-10 flex items-center gap-2">
                        Siguientes pasos...
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <UserCircle className="h-8 w-8 text-[#A68363]" />,
                                title: "Elige a tu coach",
                                desc: "Conoce a los coaches que hemos seleccionado especialmente para ti."
                            },
                            {
                                icon: <Calendar className="h-8 w-8 text-[#A68363]" />,
                                title: "Agenda tu cita online",
                                desc: "Elige el día y la hora que mejor se adapte a tu rutina."
                            },
                            {
                                icon: <Video className="h-8 w-8 text-[#A68363]" />,
                                title: "Inicia tu proceso",
                                desc: "Conéctate por videollamada de forma fácil y segura a través de pluravita."
                            }
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className={`w-14 h-14 bg-[#F2EDE7] rounded-xl flex items-center justify-center mb-6`}>
                                    {step.icon}
                                </div>
                                <h3 className="text-lg font-bold text-[#4A3C31] mb-3">{step.title}</h3>
                                <p className="text-[#6B6B6B] text-sm leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Recommended Psychologists grid */}
                <div id="recommended" className="space-y-10 scroll-mt-24">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-[#4A3C31] flex items-center gap-3">
                            Coaches recomendados <span className="animate-bounce">👇</span>
                        </h2>
                        <Link href={currentUser ? "/patient/search" : "/register"} className="text-[#A68363] font-bold text-sm hover:underline">
                            Ver todos los coaches
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-[#A68363] border-t-transparent rounded-full animate-spin" />
                            <p className="text-[#6B6B6B] font-medium italic">Cargando coaches para ti...</p>
                        </div>
                    ) : psychologists.length > 0 ? (
                        <div className="grid lg:grid-cols-3 gap-8">
                            {psychologists.map((psych, i) => (
                                <motion.div
                                    key={psych.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xl group hover:border-[#A68363]/30 transition-all"
                                >
                                    {/* Img & Affinity Score Overlay */}
                                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                                        {psych.image ? (
                                            <Image
                                                src={psych.image}
                                                alt={psych.fullName}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <UserCircle className="h-20 w-20 text-gray-300" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Altamente compatible</span>
                                        </div>
                                        <div className="absolute top-4 right-4 bg-[#A68363] text-white px-3 py-1.5 rounded-full shadow-lg text-[11px] font-black">
                                            {95 + (i % 5)}% MATCH
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-6">
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-bold text-[#4A3C31] group-hover:text-[#A68363] transition-colors">
                                                {psych.fullName}
                                            </h3>
                                            <p className="text-sm text-[#6B6B6B] font-medium line-clamp-1">{psych.specialty}</p>
                                        </div>

                                        <div className="flex items-center gap-6 text-sm text-[#6B6B6B] py-4 border-y border-gray-50">
                                            <div className="flex items-center gap-1.5 font-bold">
                                                <Star className="h-4 w-4 text-amber-400 fill-current" />
                                                {psych.rating || "4.8"}
                                            </div>
                                            <div className="text-gray-300">|</div>
                                            <div className="flex items-center gap-1.5 font-medium">
                                                <Globe className="h-4 w-4 text-[#A68363]" />
                                                Español
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {psych.tags?.map(tag => (
                                                <span key={tag} className="px-3 py-1 bg-[#F2EDE7] text-[#6B6B6B] text-[11px] font-bold rounded-full">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between pt-4">
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] text-[#6B6B6B] font-bold uppercase tracking-widest">Primera sesión</p>
                                                <p className="text-lg font-black text-[#4A3C31]">{psych.price}€</p>
                                            </div>
                                            <BookingModal
                                                psychologistId={psych.id}
                                                psychologistName={psych.fullName}
                                                price={Number(psych.price) || 35}
                                                currentUser={currentUser}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
                            <div className="w-20 h-20 bg-[#F2EDE7] rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="h-10 w-10 text-[#4A3C31]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#4A3C31] mb-2">Aún no hay coaches registrados</h3>
                            <p className="text-[#6B6B6B] max-w-sm mx-auto">
                                Estamos actualizando nuestra base de datos. Por favor, vuelve a intentarlo en unos momentos o contáctanos para ayudarte.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="bg-white border-t border-gray-100 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-6 text-center text-[#6B6B6B] text-sm font-medium">
                    © {new Date().getFullYear()} pluravita. Todos los derechos reservados.
                </div>
            </footer>
        </div>
    )
}
