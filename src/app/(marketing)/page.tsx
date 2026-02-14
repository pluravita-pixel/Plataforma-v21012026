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

// Premium Vibe Button Component
const VibeButton = ({ children, onClick, href, className = "" }: { children: React.ReactNode, onClick?: (e: any) => void, href?: string, className?: string }) => {
    const content = (
        <div className="vibe-btn-wrap">
            <div className="vibe-btn-outline" />
            <div className="vibe-btn-content">
                <span className="vibe-btn-text">{children}</span>
                <div className="vibe-btn-icon">
                    <div />
                </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 342 208" className="vibe-btn-splash">
                <path strokeLinecap="round" strokeWidth={3} d="M54.1054 99.7837C54.1054 99.7837 40.0984 90.7874 26.6893 97.6362C13.2802 104.485 1.5 97.6362 1.5 97.6362" />
                <path strokeLinecap="round" strokeWidth={3} d="M285.273 99.7841C285.273 99.7841 299.28 90.7879 312.689 97.6367C326.098 104.486 340.105 95.4893 340.105 95.4893" />
                <path strokeLinecap="round" strokeWidth={3} strokeOpacity="0.3" d="M281.133 64.9917C281.133 64.9917 287.96 49.8089 302.934 48.2295C317.908 46.6501 319.712 36.5272 319.712 36.5272" />
                <path strokeLinecap="round" strokeWidth={3} strokeOpacity="0.3" d="M281.133 138.984C281.133 138.984 287.96 154.167 302.934 155.746C317.908 157.326 319.712 167.449 319.712 167.449" />
                <path strokeLinecap="round" strokeWidth={3} d="M230.578 57.4476C230.578 57.4476 225.785 41.5051 236.061 30.4998C246.337 19.4945 244.686 12.9998 244.686 12.9998" />
                <path strokeLinecap="round" strokeWidth={3} d="M230.578 150.528C230.578 150.528 225.785 166.471 236.061 177.476C246.337 188.481 244.686 194.976 244.686 194.976" />
                <path strokeLinecap="round" strokeWidth={3} strokeOpacity="0.3" d="M170.392 57.0278C170.392 57.0278 173.89 42.1322 169.571 29.54C165.252 16.9478 168.751 2.05227 168.751 2.05227" />
                <path strokeLinecap="round" strokeWidth={3} strokeOpacity="0.3" d="M170.392 150.948C170.392 150.948 173.89 165.844 169.571 178.436C165.252 191.028 168.751 205.924 168.751 205.924" />
                <path strokeLinecap="round" strokeWidth={3} d="M112.609 57.4476C112.609 57.4476 117.401 41.5051 107.125 30.4998C96.8492 19.4945 98.5 12.9998 98.5 12.9998" />
                <path strokeLinecap="round" strokeWidth={3} d="M112.609 150.528C112.609 150.528 117.401 166.471 107.125 177.476C96.8492 188.481 98.5 194.976 98.5 194.976" />
                <path strokeLinecap="round" strokeWidth={3} strokeOpacity="0.3" d="M62.2941 64.9917C62.2941 64.9917 55.4671 49.8089 40.4932 48.2295C25.5194 46.6501 23.7159 36.5272 23.7159 36.5272" />
                <path strokeLinecap="round" strokeWidth={3} strokeOpacity="0.3" d="M62.2941 145.984C62.2941 145.984 55.4671 161.167 40.4932 162.746C25.5194 164.326 23.7159 174.449 23.7159 174.449" />
            </svg>
        </div>
    );

    if (href) {
        return (
            <Link href={href} onClick={onClick} className={`vibe-btn ${className}`}>
                <div className="vibe-btn-bg" />
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={`vibe-btn ${className}`}>
            <div className="vibe-btn-bg" />
            {content}
        </button>
    );
};

export default function LandingPage() {
    const { openAffinityModal, openTestCompletedModal } = useModals();
    const router = useRouter();
    const [stats, setStats] = useState({ realUsers: 0, realSessions: 0, realListeners: 0 });
    const [hasCompletedTest, setHasCompletedTest] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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
            }
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
        { number: "No estás solx", label: "Estamos contigo en esto", quote: '"A veces solo necesitas a alguien que no te juzgue"' },
        { number: "A tu ritmo", label: "Sin presiones, solo tú", quote: '"Tu salud mental no tiene por qué ser una carga"' },
        { number: "Conexión real", label: "Gente que vibra contigo", quote: '"Buscamos a la persona que realmente haga clic contigo"' }
    ];

    const faqs = [
        {
            question: "¿Qué es pluravita?",
            answer: "Somos una comunidad de oyentes que están aquí para escucharte. Es un espacio para hablar creado por gente joven para jóvenes."
        },
        {
            question: "¿Cómo puedo pagar mis sesiones?",
            answer: "Súper fácil y transparente. Aceptamos tus tarjetas de siempre (Visa, Mastercard, Amex). Todo el proceso es seguro para que lo único en lo que pienses sea en sentirte mejor."
        },
        {
            question: "¿Qué puedo esperar de este proceso?",
            answer: "Nosotros prometemos escucharte. No es una clase magistral ni alguien dándote lecciones, es una conversación real donde tú eres el protagonista y nosotros te proporcionamos un par de orejas que te van escuchar y entender de verdad."
        },
        {
            question: "¿Cuánto tiempo dura esto?",
            answer: "Lo que tú quieras. Aquí no hay cronómetros obligatorios ni contratos permanentes. Tú decides cuándo parar y cuándo seguir, respetando siempre tu propio ritmo y tus necesidades."
        },
        {
            question: "¿Qué pasa exactamente en una sesión?",
            answer: "Es tu espacio. Hablarás de lo que te preocupa, de tus metas o simplemente de cómo te sientes hoy. Tu oyente te escuchará y verá como puedes ser la mejor versión de ti mismo."
        },
        {
            question: "¿Cómo sé si estoy avanzando?",
            answer: "Lo notarás cuando empieces a ver las cosas con más claridad, cuando esas situaciones que antes te agobiaban ya no pesen tanto y cuando sientas que tienes el control sobre tu paz."
        },
        {
            question: "¿Cómo elijo a la persona adecuada?",
            answer: "Tenemos un Test de Afinidad que hace el trabajo por ti. Te sugerimos a los oyentes que más encajan con tu personalidad para que no pierdas tiempo buscando. Queremos que el 'clic' sea inmediato."
        },
        {
            question: "¿Quiénes son los oyentes?",
            answer: "Son personas como tú, que entienden tu realidad. No usamos un lenguaje frío; buscamos una conexión humana real que te haga sentir que, al otro lado de la pantalla, hay alguien que de verdad te pilla."
        },
        {
            question: "¿Qué enfoque me va mejor?",
            answer: "Cada persona es un mundo, por nuestros oyentes son personas normales como tú. El enfoque lo iras descubriendo poco a poco por ti mismo con tu oyente"
        },
        {
            question: "¿Es normal sentir nervios antes de la primera vez?",
            answer: "¡Totalmente! A nosotros también nos pasaría. Es ese saltito al vacío que da vértigo, pero te prometemos que aquí abajo hay una red esperándote. El primer paso es el más valiente."
        }
    ];

    return (
        <div className="flex flex-col bg-[#F9F5F0]">
            {/* Hero Section - Redesigned to be cleaner and more balanced (Terapify style) */}
            <section className="relative w-full py-12 md:py-24 lg:py-32 overflow-hidden bg-[#F2EDE7]">
                {/* Background Video (Subtle) */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src="/videos/hero-background.mp4" type="video/mp4" />
                    </video>
                </div>

                <div className="container relative z-10 mx-auto px-6 md:px-12 lg:px-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left Side: Text Content */}
                        <div className="space-y-8 animate-fade-in-up">
                            <div className="space-y-4">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#4A3C31] leading-tight tracking-tight uppercase">
                                    Encuentra a alguien <br />
                                    que <span className="text-[#A68363]">te escuche</span> <br />
                                    de verdad
                                </h1>
                                <p className="text-lg md:text-xl text-[#6B6B6B] font-medium leading-relaxed max-w-lg">
                                    Estamos contigo. En pluravita, conectas con oyentes que entienden tu realidad, sin juicios y desde tu sofá. Un espacio privado y real.
                                </p>
                                <div className="text-sm font-bold text-[#A68363] uppercase tracking-widest">
                                    Desde solo 15€ por sesión
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6">
                                <VibeButton
                                    href="/affinity-test"
                                    onClick={handleBrowsingClick}
                                    className="scale-100"
                                >
                                    Ver oyentes
                                </VibeButton>
                            </div>

                            {/* Trust badges/text like Terapify */}
                            <div className="flex items-center gap-4 text-xs font-bold text-[#8C8C8C] uppercase tracking-wider bg-white/50 backdrop-blur-sm p-3 rounded-2xl w-fit">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                            <Image src={`/images/team.png`} alt="User" width={32} height={32} className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <span>+10,000 personas ya se sienten mejor</span>
                            </div>
                        </div>

                        {/* Right Side: Illustration with Decorative Circles */}
                        <div className="relative hidden lg:block animate-float">
                            {/* Decorative background shapes */}
                            <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#FAD2E1] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
                            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#BDE0FE] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700" />

                            <div className="relative z-20 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white aspect-square max-w-[500px] ml-auto">
                                <Image
                                    src="/images/login-illustration.png"
                                    alt="Pluravita Illustration"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>

                            {/* Uiverse Sun & Clouds - Repositioned to complement the illustration */}
                            <div className="absolute -top-10 -right-10 z-30 scale-75 origin-bottom-left">
                                <div className="uiverse-container">
                                    <div className="uiverse-cloud uiverse-front">
                                        <span className="uiverse-left-front"></span>
                                        <span className="uiverse-right-front"></span>
                                    </div>
                                    <span className="uiverse-sun uiverse-sunshine"></span>
                                    <span className="uiverse-sun"></span>
                                    <div className="uiverse-cloud uiverse-back">
                                        <span className="uiverse-left-back"></span>
                                        <span className="uiverse-right-back"></span>
                                    </div>
                                </div>
                            </div>
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
                <h2 className="text-3xl font-bold text-[#4A3C31] mb-4 uppercase tracking-tighter">¿Cómo empezamos este viaje juntos?</h2>
                <p className="text-[#6B6B6B] mb-16 font-medium">Cero complicaciones, solo tres pasos para empezar a soltar lastre.</p>

                <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-[#F2EDE7] p-6 rounded-full h-40 w-40 flex items-center justify-center mb-4 neo-shadow-sm transition-transform hover:scale-110">
                            <SearchIcon className="h-20 w-20 text-[#4A3C31]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#4A3C31] uppercase">Busca a tu aliado</h3>
                        <p className="text-[#6B6B6B] text-sm leading-relaxed font-medium">
                            Explora perfiles de personas reales. Mira sus vídeos, siente su vibra y elige a quien te dé más confianza.
                        </p>
                    </div>
                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-[#FFF5EB] p-6 rounded-full h-40 w-40 flex items-center justify-center mb-4 neo-shadow-sm transition-transform hover:scale-110">
                            <CalendarIcon className="h-20 w-20 text-gray-700" />
                        </div>
                        <h3 className="text-xl font-bold text-[#4A3C31] uppercase">Haz hueco en tu agenda</h3>
                        <p className="text-gray-600 text-sm leading-relaxed font-medium">
                            Sin llamadas incómodas. Elige el momento que prefieras y reserva en un clic. Así de simple, a tu manera.
                        </p>
                    </div>
                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-[#FFF5EB] p-6 rounded-full h-40 w-40 flex items-center justify-center mb-4 neo-shadow-sm transition-transform hover:scale-110">
                            <VideoIcon className="h-20 w-20 text-gray-700" />
                        </div>
                        <h3 className="text-xl font-bold text-[#4A3C31] uppercase">Suelta lo que llevas dentro</h3>
                        <p className="text-gray-600 text-sm leading-relaxed font-medium">
                            Conéctate desde donde quieras. Ponte cómodx, prepárate un café y simplemente deja que la conversación fluya.
                        </p>
                    </div>
                </div>

                <div className="mt-16 text-center flex justify-center">
                    {/* 2. HOW IT WORKS BUTTON */}
                    <VibeButton
                        href="/affinity-test"
                        onClick={handleBrowsingClick}
                        className="scale-100"
                    >
                        Ver oyentes
                    </VibeButton>
                </div>
            </section>

            {/* Guarantee Section */}
            <section id="trusted-psychologists" className="bg-white py-24 scroll-mt-20">
                <div className="container mx-auto px-6 md:px-12 lg:px-20">
                    <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
                        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[450px] border-4 border-[#F2EDE7]">
                            <Image
                                src="/images/hero-illustration.jpg"
                                alt="Sesión de oyente empática"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-4xl font-black text-[#4A3C31] uppercase tracking-tighter">Queremos que hagas clic</h2>
                                <p className="text-lg font-bold text-[#A68363] uppercase tracking-widest">Tu primera sesión tiene red de seguridad</p>
                            </div>

                            <div className="space-y-4 text-gray-700 font-medium">
                                <p>
                                    Lo más importante para nosotros es que te sientas realmente cómodocx desde el segundo uno.
                                </p>
                                <p>
                                    Si en tu primera cita sientes que no hay química con tu oyente, no te preocupes, lo entendemos perfectamente. <span className="font-bold text-[#A68363]">Te regalamos otra sesión</span> con un oyente diferente sin que pagues ni un euro más.
                                </p>
                            </div>

                            {/* 3. GUARANTEE BUTTON */}
                            <VibeButton
                                href="/affinity-test"
                                onClick={handleBrowsingClick}
                                className="scale-100"
                            >
                                Elegir oyente
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
                                    Encuentra a tu <br /> "Match" emocional
                                </h2>
                                <p className="text-lg font-bold text-[#A68363] uppercase tracking-widest">Tecnología humana a tu servicio</p>
                            </div>

                            <div className="space-y-4 text-gray-700 font-medium leading-relaxed">
                                <p>
                                    Por eso creamos nuestro Test de Afinidad. No es un examen, <span className="font-bold underline decoration-[#A68363] decoration-2">es una forma de conocerte</span> para recomendarte a alguien que realmente vibre con lo que buscas.
                                </p>
                                <p>
                                    Tómate un minuto, descubre quién es tu oyente ideal y quítate un peso de encima. Fácil, seguro y diseñado para que te sientas cómodx.
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
        </div>
    );
}
