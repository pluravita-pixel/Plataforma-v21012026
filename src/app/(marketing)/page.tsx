"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search as SearchIcon, Calendar as CalendarIcon, Video as VideoIcon } from "lucide-react";
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
import { getOyentes } from "@/app/actions/oyentes";
import { ProfileBookingList } from "@/components/booking/ProfileBookingList";
import { LeadPopup } from "@/components/home/LeadPopup";
import { LeadFooter } from "@/components/home/LeadFooter";

// Premium Vibe Button Component
// Premium Clean Button Component
const VibeButton = ({ children, onClick, href, className = "" }: { children: React.ReactNode, onClick?: (e: any) => void, href?: string, className?: string }) => {
    const baseClasses = "px-10 py-5 bg-[#A68363] text-white rounded-full font-black uppercase tracking-widest text-sm transition-all duration-300 hover:bg-[#8C6F56] inline-flex items-center justify-center gap-3 border-none ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    if (href) {
        return (
            <Link href={href} onClick={onClick} className={`${baseClasses} ${className}`}>
                {children}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={`${baseClasses} ${className}`}>
            {children}
        </button>
    );
};

export default function LandingPage() {
    const { openAffinityModal, openTestCompletedModal } = useModals();
    const router = useRouter();
    const [stats, setStats] = useState({ realUsers: 0, realSessions: 0, realListeners: 0 });
    const [hasCompletedTest, setHasCompletedTest] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [coaches, setCoaches] = useState<any[]>([]);

    useEffect(() => {
        getGlobalStats().then(data => setStats({
            realUsers: data.realUsers,
            realSessions: data.realSessions,
            realListeners: data.realOyentes
        }));
        getCurrentUser().then(user => {
            if (user) {
                setIsLoggedIn(true);
                setHasCompletedTest(user.hasCompletedAffinity);
                setCurrentUser(user);
            }
        });

        getOyentes().then(data => {
            // Prioritize María López, Carlos Martínez, and Laura Fernández
            const targets = ['6b532a5e-0bf2-41d4-8ab7-1fd1cd6f3ea3', '2a442c0c-a9e2-46e3-b723-94832cb9c07f', '1a1f652b-9ae9-4739-a563-b355b47302cf'];
            const prioritized = data.filter(c => targets.includes(c.id));
            const others = data.filter(c => !targets.includes(c.id)).sort(() => 0.5 - Math.random());

            const finalCoaches = [...prioritized, ...others].slice(0, 3);
            setCoaches(finalCoaches);
        });
    }, []);

    const handleBrowsingClick = (e: React.MouseEvent) => {
        if (hasCompletedTest) {
            e.preventDefault();
            router.push("/usuario/search");
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
        {
            number: "Vidas transformadas",
            label: "Bienestar Real",
            quote: '"Cada persona tiene una historia única de cambio"'
        },
        {
            number: "Sesiones completadas",
            label: "Calidad profesional",
            quote: '"Cada sesión es un paso hacia tu equilibrio"'
        },
        {
            number: "Profesionales en línea",
            label: "Acompañamiento experto",
            quote: '"Listos para escucharte cuando lo necesites"'
        }
    ];

    const faqs = [
        {
            question: "¿Qué es pluravita?",
            answer: "Somos una plataforma diseñada para conectar a personas con profesionales del bienestar de forma sencilla. Nuestra misión es facilitar el acceso a acompañamiento profesional, eliminando barreras y tiempos de espera innecesarios."
        },
        {
            question: "¿Cómo puedo elegir al profesional adecuado?",
            answer: "Contamos con un Test de Afinidad que te ayuda a identificar a los profesionales que mejor encajan con lo que buscas. También puedes explorar el listado completo y filtrar por sus áreas de enfoque, precio e idioma."
        },
        {
            question: "¿Qué puedo esperar de mi primera sesión?",
            answer: "Es un espacio seguro y privado para ti. Podrás conversar sobre lo que te preocupa, tus objetivos o simplemente sobre cómo te sientes. La sesión se realiza por videollamada para que te sientas cómodo desde donde estés."
        },
        {
            question: "¿Cómo funciona la garantía de conexión?",
            answer: "Tu bienestar es nuestra prioridad. Si en tu primera sesión sientes que no has logrado conectar con el profesional, te facilitamos agendar una nueva sesión con otra persona sin coste adicional, hasta que encuentres a tu profesional ideal."
        },
        {
            question: "¿Es un servicio privado y confidencial?",
            answer: "Totalmente. El respeto a tu privacidad es fundamental. Todas las sesiones se realizan bajo estrictos estándares de confidencialidad para que puedas expresarte con total libertad y tranquilidad."
        },
        {
            question: "¿Cómo agendo una sesión?",
            answer: "El proceso es inmediato. Una vez elijas a tu profesional, podrás ver su calendario con disponibilidad real, elegir el hueco que mejor te venga y confirmar tu reserva en pocos segundos."
        }
    ];

    return (
        <div className="flex flex-col bg-[#F9F5F0]">
            {/* Hero Section - Cleaned up as requested */}
            <section className="relative w-full py-12 md:py-24 lg:py-32 overflow-hidden bg-white min-h-[500px] border-b border-gray-50 flex items-center">
                {/* No background video or decorative widgets */}

                <div className="container relative z-10 mx-auto px-6 md:px-12 lg:px-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col items-start text-left space-y-8 animate-fade-in-up">
                            <div className="space-y-4">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-[#4A3C31] leading-[1.1] tracking-tight uppercase">
                                    Psicólogos en línea <br />
                                    <span className="text-[#A68363]">de lunes a domingo</span>
                                </h1>
                                <p className="text-lg md:text-xl text-[#6B6B6B] font-medium leading-relaxed max-w-xl">
                                    Conecta con psicólogos en línea certificados y comienza tu proceso por videollamada. Atención profesional y privada. Tú eliges fecha y horario.
                                </p>
                                <div className="text-sm font-bold text-[#A68363] uppercase tracking-widest pt-2">
                                    Encuentra a tu profesional ideal en minutos
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6">
                                <VibeButton
                                    href="#section-psychologists"
                                    onClick={(e) => {
                                        const el = document.getElementById('section-psychologists');
                                        if (el) {
                                            e.preventDefault();
                                            el.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }}
                                >
                                    Ver profesionales disponibles
                                </VibeButton>
                            </div>
                        </div>

                        <div className="relative w-full animate-fade-in-right">
                            <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl border-4 border-[#F2EDE7] bg-gray-100">
                                <iframe
                                    className="absolute top-0 left-0 w-full h-full"
                                    src="https://www.youtube.com/embed/a6AtqACERTo"
                                    title="Pluravita Video"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                ></iframe>
                            </div>
                            {/* Decorative element to add premium feel */}
                            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#A68363]/10 rounded-full blur-2xl -z-10"></div>
                            <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#F2EDE7] rounded-full blur-xl -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="container mx-auto px-6 md:px-12 lg:px-20 py-16">
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
            <section className="container mx-auto px-6 md:px-12 lg:px-20 py-20 text-center">
                <h2 className="text-3xl font-bold text-[#4A3C31] mb-4 uppercase tracking-tighter">¿Cómo funciona el proceso online?</h2>
                <p className="text-[#6B6B6B] mb-16 font-medium">Iniciar tu camino con un profesional en línea es muy fácil.</p>

                <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-[#F2EDE7] p-6 rounded-full h-40 w-40 flex items-center justify-center mb-4 neo-shadow-sm transition-transform hover:scale-110">
                            <SearchIcon className="h-20 w-20 text-[#4A3C31]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#4A3C31] uppercase">Paso 1: Elige a tu profesional</h3>
                        <p className="text-[#6B6B6B] text-sm leading-relaxed font-medium">
                            Navega por nuestro listado o utiliza nuestra herramienta de match para encontrar a tu profesional ideal.
                        </p>
                    </div>
                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-[#FFF5EB] p-6 rounded-full h-40 w-40 flex items-center justify-center mb-4 neo-shadow-sm transition-transform hover:scale-110">
                            <CalendarIcon className="h-20 w-20 text-gray-700" />
                        </div>
                        <h3 className="text-xl font-bold text-[#4A3C31] uppercase">Paso 2: Agenda una cita online</h3>
                        <p className="text-gray-600 text-sm leading-relaxed font-medium">
                            Olvida las esperas. Elige el día y la hora que mejor se adapte a tu rutina, sin complicaciones.
                        </p>
                    </div>
                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-[#FFF5EB] p-6 rounded-full h-40 w-40 flex items-center justify-center mb-4 neo-shadow-sm transition-transform hover:scale-110">
                            <VideoIcon className="h-20 w-20 text-gray-700" />
                        </div>
                        <h3 className="text-xl font-bold text-[#4A3C31] uppercase">Paso 3: Inicia tu proceso</h3>
                        <p className="text-gray-600 text-sm leading-relaxed font-medium">
                            Conéctate desde cualquier lugar en un entorno seguro, cómodo y privado a través de videollamada.
                        </p>
                    </div>
                </div>

                <div className="mt-16 text-center flex justify-center">
                    {/* 2. HOW IT WORKS BUTTON */}
                    <VibeButton
                        href="#section-psychologists"
                        onClick={(e) => {
                            const el = document.getElementById('section-psychologists');
                            if (el) {
                                e.preventDefault();
                                el.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                        className="scale-100"
                    >
                        Ver profesionales disponibles
                    </VibeButton>
                </div>
            </section>

            {/* NEW: Direct Booking Section (Profile Style) */}
            <ProfileBookingList coaches={coaches} currentUser={currentUser} />

            {/* Guarantee Section */}
            <section id="trusted-psychologists" className="bg-white py-24 scroll-mt-20">
                <div className="container mx-auto px-6 md:px-12 lg:px-20">
                    <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
                        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[450px] border-4 border-[#F2EDE7]">
                            <Image
                                src="/images/hero-illustration.jpg"
                                alt="Sesión de psicólogo empática"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-4xl font-black text-[#4A3C31] uppercase tracking-tighter">Garantía de satisfacción</h2>
                                <p className="text-lg font-bold text-[#A68363] uppercase tracking-widest">Tu primera sesión sin riesgo</p>
                            </div>

                            <div className="space-y-4 text-gray-700 font-medium">
                                <p>
                                    Queremos que te sientas en confianza desde el primer momento. La conexión profesional es fundamental para que tu proceso sea efectivo y te sientas escuchado.
                                </p>
                                <p>
                                    Si en tu primera cita no encuentras la conexión que necesitas, no te preocupes. <span className="font-bold text-[#A68363]">Puedes agendar otra sesión</span> con una nueva persona sin costo extra, hasta que encuentres a tu profesional ideal.
                                </p>
                            </div>

                            {/* 3. GUARANTEE BUTTON */}
                            <VibeButton
                                href="/affinity-test"
                                onClick={handleBrowsingClick}
                                className="scale-100"
                            >
                                Sí, quiero comenzar
                            </VibeButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* Affinity Test Section */}
            <section className="bg-[#F2EDE7] py-24">
                <div className="container mx-auto px-6 md:px-12 lg:px-20">
                    <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
                        <div className="space-y-8 order-2 md:order-1">
                            <div className="space-y-4">
                                <h2 className="text-4xl font-black text-[#4A3C31] uppercase tracking-tighter">
                                    Encuentra hoy a tu <br /> profesional ideal
                                </h2>
                                <p className="text-lg font-bold text-[#A68363] uppercase tracking-widest">Test de afinidad terapéutica</p>
                            </div>

                            <div className="space-y-4 text-gray-700 font-medium leading-relaxed">
                                <p>
                                    Por eso diseñamos nuestro Test de Afinidad. <span className="font-bold underline decoration-[#A68363] decoration-2">Es una forma de conocer tus objetivos</span> para sugerirte al perfil que mejor encaja con lo que buscas y necesitas.
                                </p>
                                <p>
                                    Tómate un par de minutos, descubre a tu profesional ideal y comienza hoy mismo. Sin esperas y con total privacidad.
                                </p>
                            </div>

                            {/* 4. AFFINITY BUTTON */}
                            <VibeButton
                                onClick={handleAnsweringClick}
                                className="scale-100"
                            >
                                Responder test
                            </VibeButton>
                        </div>
                        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[450px] order-1 md:order-2 border-4 border-white">
                            <Image
                                src="/images/team.png"
                                alt="Crecimiento personal real"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="container mx-auto px-4 py-24 max-w-3xl scroll-mt-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-[#4A3C31] uppercase tracking-tighter">Preguntas frecuentes</h2>
                    <p className="text-[#8C8C8C] mt-2 font-bold uppercase tracking-widest text-xs">Resolvemos tus dudas en un clic</p>
                </div>

                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqs.map((faq, i) => (
                        <AccordionItem key={i} value={`item-${i}`} className="border-none bg-white rounded-3xl px-8 neo-shadow transition-all data-[state=open]:ring-2 ring-[#A68363]/20 overflow-hidden">
                            <AccordionTrigger className="text-left font-bold text-[#4A3C31] hover:text-[#A68363] hover:no-underline py-6 uppercase tracking-tight text-lg">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-[#6B6B6B] pb-8 leading-relaxed font-medium text-base">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </section>

            {/* Lead Collection Footer */}
            <LeadFooter />

            {/* Lead Collection Popup */}
            <LeadPopup />
        </div>
    );
}
