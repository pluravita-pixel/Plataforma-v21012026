"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Search as SearchIcon, Calendar as CalendarIcon, Video as VideoIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useModals } from "@/components/modal-provider";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { getGlobalStats } from "@/app/actions/stats";
import { getCurrentUser } from "@/app/actions/auth";

export default function LandingPage() {
    const { openAffinityModal, openTestCompletedModal } = useModals();
    const router = useRouter();
    const [stats, setStats] = useState({ realUsers: 0, realSessions: 0, realCoaches: 0 });
    const [hasCompletedTest, setHasCompletedTest] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        getGlobalStats().then(setStats);
        getCurrentUser().then(user => {
            if (user) {
                setIsLoggedIn(true);
                setHasCompletedTest(user.hasCompletedAffinity);
            }
        });
    }, []);

    const handleBrowsingClick = (e: React.MouseEvent) => {
        if (hasCompletedTest) {
            e.preventDefault();
            router.push("/patient/search");
        }
    };

    const handleAnsweringClick = () => {
        if (hasCompletedTest) {
            openTestCompletedModal();
        } else {
            openAffinityModal();
        }
    };

    const landingStats = [
        { number: "Transforma tu vida", label: "Tu proceso empieza hoy", quote: '"Cada persona tiene una historia única de cambio"' },
        { number: "Sesiones a medida", label: "Adaptadas a ti", quote: '"Cada sesión es un paso hacia tu bienestar"' },
        { number: "Acompañamiento real", label: "Más que tradición", quote: '"Personas que te entienden de verdad"' }
    ];

    const faqs = [
        {
            question: "¿Qué es pluravita?",
            answer: "Pluravita es una plataforma de bienestar que conecta a personas con coaches certificados en línea para sesiones de acompañamiento emocional y desarrollo personal. Ofrecemos un espacio seguro, privado y accesible desde cualquier lugar para que puedas trabajar en tu mejor versión."
        },
        {
            question: "¿Cómo puedo pagar mis citas en pluravita?",
            answer: "Aceptamos todas las tarjetas de crédito y débito (Visa, Mastercard, American Express). Todos los pagos se procesan de forma segura a través de nuestra plataforma, garantizando la protección de tus datos financieros."
        },
        {
            question: "¿Qué puedo esperar de un proceso de coaching?",
            answer: "El coaching es un proceso de acompañamiento donde trabajarás junto a un profesional para alcanzar tus objetivos, superar obstáculos y mejorar tu bienestar. Es un espacio libre de juicios, confidencial y enfocado en tu crecimiento personal y profesional."
        },
        {
            question: "¿Cuánto dura un proceso de coaching?",
            answer: "La duración varía según cada persona y sus objetivos particulares. Algunos procesos pueden requerir pocas sesiones para temas puntuales, mientras que otros pueden extenderse para un trabajo más profundo. Tú y tu coach definirán juntos el ritmo y la duración adecuada."
        },
        {
            question: "¿Qué sucede en una sesión?",
            answer: "En una sesión típica, conversarás con tu coach sobre tus retos y metas. El coach utilizará diversas técnicas y herramientas para ayudarte a ganar claridad, explorar nuevas perspectivas y definir planes de acción concretos para tu vida diaria."
        },
        {
            question: "¿Cómo puedo saber si estoy progresando?",
            answer: "Notarás cambios en tu forma de abordar situaciones cotidianas, mayor claridad mental, mejor gestión emocional y el cumplimiento de las metas que te trazaste al inicio. Además, revisarás periódicamente tus avances junto con tu coach."
        },
        {
            question: "¿Cómo puedo elegir al coach adecuado?",
            answer: "Contamos con un Test de Afinidad inteligente que te sugiere los coaches más compatibles contigo basándose en tus necesidades. También puedes explorar los perfiles detallados, ver sus videos de presentación y leer reseñas de otros usuarios."
        },
        {
            question: "¿Qué requisitos cumplen los coaches de pluravita?",
            answer: "Nuestros coaches son personas que te entienden de verdad. Ofrecemos una opción diferente a lo tradicional, centrada en tu bienestar y en una conexión humana real."
        },
        {
            question: "¿Qué enfoque es el mejor para mí?",
            answer: "No existe un enfoque único para todos. Cada coach tiene especialidades diferentes (vida, carrera, relaciones, etc.). Nuestro sistema de recomendación te ayudará a encontrar el enfoque que mejor se alinee con lo que buscas trabajar."
        },
        {
            question: "¿Es normal sentir nervios antes de empezar?",
            answer: "¡Totalmente! Dar el primer paso hacia el autocuidado puede generar incertidumbre. Es una señal de que estás saliendo de tu zona de confort para crecer. Nuestros coaches están entrenados para crear un ambiente cálido y seguro desde el primer minuto."
        }
    ];

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="container mx-auto px-4 py-12 lg:py-20">
                <div className="grid lg:grid-cols-12 gap-12 items-center">

                    {/* Left Content */}
                    <div className="lg:col-span-5 space-y-8">
                        <h1 className="text-5xl lg:text-7xl font-bold text-[#4A3C31] leading-tight tracking-tight">
                            Coaches en línea <br />
                            <span className="text-[#A68363]">listos para ayudarte ahora</span>
                        </h1>

                        <p className="text-lg text-[#6B6B6B] leading-relaxed max-w-xl">
                            En pluravita puedes tomar coaching en línea por videollamada de forma fácil, segura y privada. Encuentra a tu coach online y comienza tu proceso hoy mismo. Desde <b>15€</b> por sesión.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 pt-4">
                            <Button
                                asChild
                                onClick={handleBrowsingClick}
                                className="neo-btn-primary h-16 text-lg"
                            >
                                <Link href="/affinity-test">Ver coaches en línea</Link>
                            </Button>
                        </div>


                    </div>

                    {/* Right Content - Video/Image */}
                    <div className="lg:col-span-7 relative">
                        {/* Decorative Elements */}
                        <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#A68363]/10 rounded-full blur-xl" />
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#4A3C31]/5 rounded-3xl blur-xl" />

                        <div className="relative bg-white p-4 rounded-3xl shadow-2xl w-full max-w-3xl mx-auto z-10">
                            <div className="aspect-[16/9] relative bg-black rounded-2xl overflow-hidden group shadow-inner">
                                <iframe
                                    src="https://www.youtube.com/embed/a6AtqACERTo?autoplay=0&mute=0&controls=1&loop=1&playlist=a6AtqACERTo&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1"
                                    className="w-full h-full absolute inset-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            <section className="container mx-auto px-4 py-16">
                <div className="grid md:grid-cols-3 gap-8">
                    {landingStats.map((stat, i) => (
                        <Card key={i} className="p-10 text-center bg-white border-transparent neo-shadow hover:shadow-2xl transition-all duration-500 rounded-[2rem] border border-gray-50 flex flex-col justify-center items-center">
                            <div className="text-2xl font-bold text-[#A68363] mb-3 tracking-tight">{stat.number}</div>
                            <div className="text-[#4A3C31] font-bold text-lg mb-4">{stat.label}</div>
                            <p className="text-[#8C8C8C] italic text-sm leading-relaxed">&ldquo;{stat.quote.replace(/"/g, '')}&rdquo;</p>
                        </Card>
                    ))}
                </div>
            </section>

            {/* How it Works Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-3xl font-bold text-[#4A3C31] mb-4">¿Cómo funciona el coaching online?</h2>
                <p className="text-[#6B6B6B] mb-16">Iniciar tu proceso con un coach en línea es muy fácil</p>

                <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-[#F2EDE7] p-6 rounded-full h-40 w-40 flex items-center justify-center mb-4">
                            {/* Search Icon Placeholder */}
                            <SearchIcon className="h-20 w-20 text-[#4A3C31]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#4A3C31]">Elige a tu coach en línea</h3>
                        <p className="text-[#6B6B6B] text-sm leading-relaxed">
                            Navega por nuestro listado de coaches o utiliza nuestra herramienta de match para encontrar a tu coach ideal.
                        </p>
                    </div>
                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-[#FFF5EB] p-6 rounded-full h-40 w-40 flex items-center justify-center mb-4">
                            {/* Calendar Icon Placeholder */}
                            <CalendarIcon className="h-20 w-20 text-gray-700" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Agenda una cita</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Olvida el tráfico y las salas de espera. Elige el día y la hora que mejor se adapte a tu rutina, sin complicaciones.
                        </p>
                    </div>
                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-[#FFF5EB] p-6 rounded-full h-40 w-40 flex items-center justify-center mb-4">
                            {/* Video Icon Placeholder */}
                            <VideoIcon className="h-20 w-20 text-gray-700" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Inicia tu proceso de coaching</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Conéctate desde cualquier lugar con tu coach en un entorno seguro, cómodo y privado a través de pluravita.
                        </p>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <Button
                        asChild
                        onClick={handleBrowsingClick}
                        className="neo-btn-primary h-16 scale-110"
                    >
                        <Link href="/affinity-test">Ver coaches en línea</Link>
                    </Button>
                </div>
            </section>

            {/* Guarantee Section */}
            <section id="trusted-psychologists" className="bg-white py-20 scroll-mt-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[#4A3C31] mb-2">Coaches que te entienden de verdad</h2>
                        <p className="text-[#6B6B6B]">Conoce nuestra garantía de primera cita</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[400px]">
                            {/* Mock Image */}
                            <div className="absolute inset-0 bg-gray-200 bg-[url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center" />
                        </div>
                        <div className="space-y-6">
                            <p className="text-gray-700">
                                Queremos que te sientas en confianza desde el primer momento.
                            </p>
                            <p className="text-gray-700">
                                Si en tu primera cita no encuentras la conexión que necesitas con tu coach, no te preocupes, <span className="font-bold text-[#4A3C31]">puedes agendar otra sesión</span> con un nuevo coach <span className="font-bold text-[#4A3C31]">sin costo extra</span>, hasta que encuentres al ideal.
                            </p>
                            <p className="text-[#6B6B6B]">
                                Estamos aquí para acompañarte en cada paso de tu proceso terapéutico. <span className="font-bold text-[#4A3C31]">Tu tranquilidad siempre será nuestra prioridad.</span>
                            </p>
                            <Button
                                asChild
                                onClick={handleBrowsingClick}
                                className="neo-btn-primary h-14"
                            >
                                <Link href="/affinity-test">Elegir coach</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="container mx-auto px-4 py-20">
                <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
                    <div className="space-y-6 order-2 md:order-1">
                        <h2 className="text-3xl font-bold text-[#4A3C31] leading-tight">
                            Personas que te entienden de verdad
                        </h2>
                        <div className="space-y-4 text-[#6B6B6B]">
                            <p>
                                Somos una opción diferente a lo tradicional. Encuentra el acompañamiento que necesitas con coaches que conectan contigo y tu realidad.
                            </p>
                            <p>
                                Con horarios disponibles de lunes a domingo, <span className="font-bold">podrás comenzar</span> tu proceso de coaching en línea <span className="font-bold">en el momento que lo necesites.</span>
                            </p>
                        </div>
                        <div className="pt-4">
                            <p className="text-[#4A3C31] font-medium mb-6">Haz de tu paz mental una prioridad. ¿Comenzamos juntos?</p>
                            <Button
                                onClick={handleAnsweringClick}
                                className="neo-btn-primary h-16 w-full md:w-auto"
                            >
                                Sí, quiero comenzar
                            </Button>
                        </div>
                    </div>
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[500px] order-1 md:order-2">
                        <div className="absolute inset-0 bg-gray-200 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center" />
                    </div>
                </div>
            </section>

            {/* Affinity Test Section */}
            <section className="bg-white py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[#4A3C31]">
                            Encuentra a tu coach en línea con <br /> nuestro Test de Afinidad de Coaching
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                        <div className="relative rounded-3xl overflow-hidden shadow-xl h-[400px]">
                            <div className="absolute inset-0 bg-gray-200 bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center" />
                        </div>
                        <div className="space-y-6">
                            <p className="text-gray-700">
                                Conectar con el coach adecuado es fundamental para que tu proceso sea realmente efectivo.
                            </p>
                            <p className="text-gray-700">
                                Por eso, desarrollamos un Test de Afinidad, <span className="font-bold">diseñado para ayudarte a encontrar al coach que mejor se adapte a tus necesidades y objetivos.</span>
                            </p>
                            <p className="text-gray-700">
                                Tómate unos minutos para responder nuestro test, descubre a tu coach ideal y comienza tu proceso de forma <span className="font-bold">fácil, segura y privada</span> en pluravita.
                            </p>
                            <Button
                                onClick={handleAnsweringClick}
                                className="neo-btn-primary h-16 w-full"
                            >
                                Responder test
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="container mx-auto px-4 py-20 max-w-3xl scroll-mt-20">
                <h2 className="text-3xl font-bold text-[#1F2937] text-center mb-12">Preguntas frecuentes</h2>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq, i) => (
                        <AccordionItem key={i} value={`item-${i}`} className="border rounded-xl px-6 data-[state=open]:border-[#A68363]/50 data-[state=open]:bg-[#A68363]/5">
                            <AccordionTrigger className="text-left font-medium text-[#4A3C31] hover:text-[#A68363] hover:no-underline py-6">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-[#6B6B6B] pb-6 leading-relaxed">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </section>
        </div>
    );
}
