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
            answer: "Somos ese refugio digital donde puedes ser tú mismx. Una comunidad de oyentes que no solo tienen títulos, sino que saben lo que es pasarlo mal y están aquí para escucharte sin filtros. Es un espacio para hablar, privado y pensado para tu generación."
        },
        {
            question: "¿Cómo puedo pagar mis sesiones?",
            answer: "Súper fácil y transparente. Aceptamos tus tarjetas de siempre (Visa, Mastercard, Amex). Todo el proceso es seguro para que lo único en lo que pienses sea en sentirte mejor."
        },
        {
            question: "¿Qué puedo esperar de este proceso?",
            answer: "Espera sentirte validado. No es una clase magistral ni alguien dándote lecciones, es una conversación real donde tú eres el protagonista y nosotros el apoyo que necesitas para ordenar el caos."
        },
        {
            question: "¿Cuánto tiempo dura esto?",
            answer: "Lo que tú quieras. Aquí no hay cronómetros obligatorios ni contratos permanentes. Tú decides cuándo parar y cuándo seguir, respetando siempre tu propio ritmo y tus necesidades."
        },
        {
            question: "¿Qué pasa exactamente en una sesión?",
            answer: "Es tu espacio. Hablarás de lo que te preocupa, de tus metas o simplemente de cómo te sientes hoy. Tu oyente te escuchará y te dará herramientas prácticas para que puedas gestionar tu día a día con más calma."
        },
        {
            question: "¿Cómo sé si estoy avanzando?",
            answer: "Lo notarás cuando empieces a ver las cosas con más claridad, cuando esas situaciones que antes te agobiaban ya no pesen tanto y cuando sientas que tienes el control sobre tus emociones. Estaremos celebrando cada pequeño paso contigo."
        },
        {
            question: "¿Cómo elijo a la persona adecuada?",
            answer: "Tenemos un Test de Afinidad que hace el trabajo sucio por ti. Te sugerimos a los oyentes que más encajan con tu personalidad para que no pierdas tiempo buscando. Queremos que el 'clic' sea inmediato."
        },
        {
            question: "¿Quiénes son los oyentes?",
            answer: "Son personas como tú, que entienden tu realidad. No usamos un lenguaje frío; buscamos una conexión humana real que te haga sentir que, al otro lado de la pantalla, hay alguien que de verdad te pilla."
        },
        {
            question: "¿Qué enfoque me va mejor?",
            answer: "Cada persona es un mundo, por eso tenemos especialistas en todo: ansiedad, carrera, relaciones... Nuestro sistema te ayudará a encontrar exactamente lo que tu mente está pidiendo ahora mismo."
        },
        {
            question: "¿Es normal sentir nervios antes de la primera vez?",
            answer: "¡Totalmente! A nosotros también nos pasaría. Es ese saltito al vacío que da vértigo, pero te prometemos que aquí abajo hay una red esperándote. El primer paso es el más valiente."
        }
    ];

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="container mx-auto px-6 md:px-12 lg:px-20 py-12 lg:py-24">
                <div className="grid lg:grid-cols-12 gap-12 items-center">

                    {/* Left Content */}
                    <div className="lg:col-span-5 space-y-8">
                        <h1 className="text-5xl lg:text-7xl font-bold text-[#4A3C31] leading-tight tracking-tight">
                            Encuentra a alguien que <br />
                            <span className="text-[#A68363]">te escuche de verdad</span>
                        </h1>

                        <p className="text-lg text-[#6B6B6B] leading-relaxed max-w-xl">
                            Sabemos que a veces el mundo pesa. En pluravita, conectas con oyentes que entienden tu realidad, sin juicios y desde tu sofá. Es un espacio para hablar, privado y tan real como tú. Desde <b>15€</b>.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 pt-4">
                            <Button
                                asChild
                                onClick={handleBrowsingClick}
                                className="neo-btn-primary h-16 text-lg"
                            >
                                <Link href="/affinity-test">Ver oyentes en línea</Link>
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
