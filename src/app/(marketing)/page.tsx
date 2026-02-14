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
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative w-full h-[80vh] md:h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-[#F2EDE7]">
                {/* Background Resource (Video/Image) */}
                <div className="absolute inset-0 z-0 select-none pointer-events-none">
                    <div className="relative w-full h-full">
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover z-10 opacity-0 transition-opacity duration-1000"
                            onCanPlay={(e) => (e.currentTarget.style.opacity = '1')}
                        >
                            <source src="/videos/hero-background.mp4" type="video/mp4" />
                        </video>

                        {/* Repositioned Hero Illustration - Smaller and to the right on Desktop */}
                        <div className="absolute top-[10%] right-0 w-[40%] h-[50%] z-30 hidden md:block opacity-90 transition-all duration-1000 hover:scale-105">
                            <Image
                                src="/images/login-illustration.png"
                                alt="Pluravita Illustration"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>

                        {/* Uiverse Sun & Clouds Component - Top Right Corner */}
                        <div className="absolute top-4 right-4 z-40 hidden lg:block scale-[0.6] origin-top-right transition-all">
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

                        {/* Mobile Background Fallback */}
                        <div className="absolute inset-0 z-0 md:hidden overflow-hidden">
                            <Image
                                src="/images/login-illustration.png"
                                alt="Pluravita Hero Mobile"
                                fill
                                className="object-cover brightness-75"
                                priority
                            />
                        </div>

                        {/* Gradient Overlays for Readability */}
                        <div className="absolute inset-0 bg-black/10 z-20 md:bg-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#F2EDE7]/95 via-[#F2EDE7]/60 to-transparent z-20 hidden md:block" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#F9F5F0] via-transparent to-transparent z-20" />
                    </div>
                </div>

                {/* Content Overlay */}
                <div className="container relative z-30 mx-auto px-6 md:px-12 lg:px-20 h-full flex flex-col justify-center">
                    <div className="max-w-4xl space-y-10">
                        <div className="space-y-4">
                            <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] md:text-[clamp(4rem,9vw,6.5rem)] font-bold text-[#4A3C31] leading-[1] tracking-tighter uppercase drop-shadow-sm">
                                <span className="block whitespace-nowrap">Encuentra a alguien que</span>
                                <span className="block whitespace-nowrap text-[#A68363]">te escuche de verdad</span>
                            </h1>

                            <p className="text-xl md:text-2xl text-[#6B6B6B] font-medium leading-relaxed max-w-xl md:bg-white/10 md:backdrop-blur-sm md:p-4 md:rounded-2xl transition-all">
                                Estamos contigo. En pluravita, conectas con oyentes que entienden tu realidad, sin juicios y desde tu sofá. Un espacio privado y real. Desde <b>15€</b>.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 pt-4">
                            <Button
                                asChild
                                onClick={handleBrowsingClick}
                                className="neo-btn-primary h-20 px-12 text-xl shadow-2xl transition-transform hover:scale-105"
                            >
                                <Link href="/affinity-test">Ver oyentes en línea</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 animate-bounce hidden md:block">
                    <div className="w-1 h-12 rounded-full bg-gradient-to-b from-[#A68363] to-transparent opacity-50" />
                </div>
            </section>

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
                <h2 className="text-3xl font-bold text-[#4A3C31] mb-4">¿Cómo empezamos este viaje juntos?</h2>
                <p className="text-[#6B6B6B] mb-16">Cero complicaciones, solo tres pasos para empezar a soltar lastre.</p>

                <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-[#F2EDE7] p-6 rounded-full h-40 w-40 flex items-center justify-center mb-4">
                            <SearchIcon className="h-20 w-20 text-[#4A3C31]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#4A3C31]">Busca a tu aliado</h3>
                        <p className="text-[#6B6B6B] text-sm leading-relaxed">
                            Explora perfiles de personas reales. Mira sus vídeos, siente su vibra y elige a quien te dé más confianza.
                        </p>
                    </div>
                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-[#FFF5EB] p-6 rounded-full h-40 w-40 flex items-center justify-center mb-4">
                            <CalendarIcon className="h-20 w-20 text-gray-700" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Haz hueco en tu agenda</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Sin llamadas incómodas. Elige el momento que prefieras y reserva en un clic. Así de simple, a tu manera.
                        </p>
                    </div>
                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-[#FFF5EB] p-6 rounded-full h-40 w-40 flex items-center justify-center mb-4">
                            <VideoIcon className="h-20 w-20 text-gray-700" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Suelta lo que llevas dentro</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            Conéctate desde donde quieras. Ponte cómodx, prepárate un café y simplemente deja que la conversación fluya.
                        </p>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <Button
                        asChild
                        onClick={handleBrowsingClick}
                        className="neo-btn-primary h-16 scale-110"
                    >
                        <Link href="/affinity-test">Ver oyentes en línea</Link>
                    </Button>
                </div>
            </section>

            {/* Guarantee Section */}
            <section id="trusted-psychologists" className="bg-white py-20 scroll-mt-20">
                <div className="container mx-auto px-6 md:px-12 lg:px-20">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[#4A3C31] mb-2">Queremos que hagas clic</h2>
                        <p className="text-[#6B6B6B]">Tu primera sesión tiene red de seguridad</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[400px]">
                            {/* Mock Image */}
                            <Image
                                src="/images/hero-illustration.jpg"
                                alt="Sesión de oyente empática"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="space-y-6">
                            <p className="text-gray-700">
                                Lo más importante para nosotros es que te sientas realmente cómodocx desde el segundo uno.
                            </p>
                            <p className="text-gray-700">
                                Si en tu primera cita sientes que no hay química con tu oyente, no te preocupes, lo entendemos perfectamente. <span className="font-bold text-[#4A3C31]">Te regalamos otra sesión</span> con un oyente diferente <span className="font-bold text-[#4A3C31]">sin que pagues ni un euro más</span>.
                            </p>
                            <p className="text-[#6B6B6B]">
                                Estamos aquí para que el camino sea fácil. <span className="font-bold text-[#4A3C31]">Tu tranquilidad y tu proceso son lo que de verdad nos importa.</span>
                            </p>
                            <Button
                                asChild
                                onClick={handleBrowsingClick}
                                className="neo-btn-primary h-14"
                            >
                                <Link href="/affinity-test">Elegir oyente</Link>
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
                            Gente real para problemas reales
                        </h2>
                        <div className="space-y-4 text-[#6B6B6B]">
                            <p>
                                No somos la típica plataforma corporativa y fría. Somos una comunidad de personas que entienden que la vida puede ser caótica y que a veces solo necesitas a alguien que hable tu mismo idioma.
                            </p>
                            <p>
                                Sin esperas infinitas. Con horarios flexibles de lunes a domingo, <span className="font-bold">podrás hablar con alguien</span> en el momento exacto <span className="font-bold">en que más lo necesites.</span>
                            </p>
                        </div>
                        <div className="pt-4">
                            <p className="text-[#4A3C31] font-medium mb-6">Tu paz mental no es un lujo, es tu prioridad. ¿Empezamos por aquí?</p>
                            <Button
                                onClick={handleAnsweringClick}
                                className="neo-btn-primary h-16 w-full md:w-auto"
                            >
                                Sí, quiero comenzar
                            </Button>
                        </div>
                    </div>
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[500px] order-1 md:order-2">
                        <Image
                            src="/images/guarantee.jpg"
                            alt="Sesión por videollamada"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* Affinity Test Section */}
            <section className="bg-white py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[#4A3C31]">
                            Deja que te ayudemos a encontrar <br /> a tu "Match" emocional
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                        <div className="relative rounded-3xl overflow-hidden shadow-xl h-[400px]">
                            <Image
                                src="/images/team.png"
                                alt="Crecimiento personal real"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="space-y-6">
                            <p className="text-gray-700">
                                Sabemos que elegir a alguien para contarle tus cosas puede dar un poco de parálisis por análisis.
                            </p>
                            <p className="text-gray-700">
                                Por eso creamos nuestro Test de Afinidad. No es un examen, <span className="font-bold">es una forma de conocerte para recomendarte a alguien que realmente vibre con lo que buscas.</span>
                            </p>
                            <p className="text-gray-700">
                                Tómate un minuto, descubre quién es tu oyente ideal y quítate un peso de encima. <span className="font-bold">Fácil, seguro y diseñado para que te sientas cómodx.</span>
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
