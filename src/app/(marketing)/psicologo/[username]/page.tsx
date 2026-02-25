import { getOyenteByUsername } from "@/app/actions/oyentes";
import { getCurrentUser } from "@/app/actions/auth";
import { notFound } from "next/navigation";
import Image from "next/image";
import { BookingModal } from "@/components/booking/BookingModal";
import { Button } from "@/components/ui/button";
import { Star, Clock, ShieldCheck, GraduationCap, Briefcase, Languages, CheckCircle2, Calendar } from "lucide-react";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
    const username = (await params).username;
    const coach = await getOyenteByUsername(username);

    if (!coach) return { title: "Psicólogo no encontrado | Pluravita" };

    return {
        title: `${coach.fullName} - ${coach.specialty || "Psicólogo"} | Pluravita`,
        description: coach.description || `Agenda una sesión con ${coach.fullName} en Pluravita.`,
    };
}

export default async function PsychologistProfilePage({ params }: { params: { username: string } }) {
    const username = (await params).username;
    const coach = await getOyenteByUsername(username);
    const currentUser = await getCurrentUser();

    if (!coach) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[#FDFBF9]">
            {/* Minimal Hero Header */}
            <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#A68363]/20 to-[#FDFBF9]"></div>
                <div className="container mx-auto px-6 md:px-12 lg:px-20 h-full flex flex-col justify-end pb-12">
                    <div className="flex flex-col md:flex-row items-end gap-8">
                        <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl z-10">
                            {coach.image ? (
                                <Image
                                    src={coach.image}
                                    alt={coach.fullName}
                                    fill
                                    className="object-cover object-top"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full bg-[#F2EDE7] flex items-center justify-center font-black text-5xl text-[#A68363]">
                                    {coach.fullName[0]}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 z-10 mb-4 text-left">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-[#A68363]/10 text-[#A68363] text-xs font-black uppercase tracking-widest mb-4">
                                {coach.specialty || "Psicólogo Colegiado"}
                            </span>
                            <h1 className="text-4xl md:text-6xl font-black text-[#4A3C31] uppercase tracking-tighter leading-none mb-4">
                                {coach.fullName}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                                    <span className="text-lg font-black text-[#4A3C31]">{coach.rating || "5.0"}</span>
                                    <span className="text-gray-400 font-medium">({coach.completedSessions || 0} sesiones)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-[#A68363]" />
                                    <span className="text-gray-600 font-bold uppercase tracking-wider text-sm">Nº Col. {coach.licenseNumber || "COP-28741"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 md:px-12 lg:px-20 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Description */}
                        <section className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-[#F2EDE7]">
                            <h2 className="text-2xl font-black text-[#4A3C31] uppercase tracking-tight mb-6 flex items-center gap-3">
                                <span className="w-2 h-8 bg-[#A68363] rounded-full"></span>
                                Sobre mí
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed font-medium whitespace-pre-line">
                                {coach.description || "Este profesional aún no ha añadido una descripción detallada."}
                            </p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Tags / Specialty Areas */}
                            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#F2EDE7]">
                                <h3 className="text-xl font-black text-[#4A3C31] uppercase tracking-tight mb-6">Especialidades</h3>
                                <div className="flex flex-wrap gap-3">
                                    {coach.tags && coach.tags.length > 0 ? (
                                        coach.tags.map((tag: string, i: number) => (
                                            <span key={i} className="px-4 py-2 bg-[#F2EDE7]/50 rounded-xl text-[#A68363] text-sm font-bold border border-[#F2EDE7]">
                                                {tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 text-sm">General, Ansiedad, Depresión</span>
                                    )}
                                </div>
                            </section>

                            {/* Benefits */}
                            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#F2EDE7]">
                                <h3 className="text-xl font-black text-[#4A3C31] uppercase tracking-tight mb-6">Qué lograremos</h3>
                                <ul className="space-y-4">
                                    {coach.benefits && coach.benefits.length > 0 ? (
                                        coach.benefits.map((benefit: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                                                <span className="text-gray-600 font-medium">{benefit}</span>
                                            </li>
                                        ))
                                    ) : (
                                        ["Gestión emocional", "Mejorar autoestima", "Herramientas diarias"].map((b: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                                                <span className="text-gray-600 font-medium">{b}</span>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </section>
                        </div>

                        {/* Experience and Studies */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#F2EDE7]">
                                <h3 className="text-xl font-black text-[#4A3C31] uppercase tracking-tight mb-6 flex items-center gap-3">
                                    <Briefcase className="h-6 w-6 text-[#A68363]" />
                                    Experiencia
                                </h3>
                                <p className="text-gray-600 font-medium leading-relaxed">
                                    {coach.experience || "Amplia experiencia en el sector clínico y ayuda personalizada."}
                                </p>
                            </section>
                            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#F2EDE7]">
                                <h3 className="text-xl font-black text-[#4A3C31] uppercase tracking-tight mb-6 flex items-center gap-3">
                                    <GraduationCap className="h-6 w-6 text-[#A68363]" />
                                    Formación
                                </h3>
                                <p className="text-gray-600 font-medium leading-relaxed">
                                    {coach.studies || "Graduado en Psicología con especialización clínica por universidades de prestigio."}
                                </p>
                            </section>
                        </div>
                    </div>

                    {/* Right Column: Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32">
                            <div className="bg-[#4A3C31] rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden relative group">
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#A68363]/20 rounded-full blur-3xl transition-all group-hover:bg-[#A68363]/40"></div>

                                <div className="relative z-10">
                                    <div className="mb-8">
                                        <span className="text-[#A68363] text-sm font-black uppercase tracking-[0.2em] block mb-2">Precio por sesión</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black">{coach.price || "15"}€</span>
                                            <span className="text-gray-300 font-medium uppercase text-xs">/ 50 Minutos</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                            <Calendar className="h-5 w-5 text-[#A68363]" />
                                            <span className="text-sm font-bold uppercase tracking-wider">Citas disponibles esta semana</span>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                                            <Languages className="h-5 w-5 text-[#A68363]" />
                                            <span className="text-sm font-bold uppercase tracking-wider">
                                                Idiomas: {(coach.languages || ["Español"]).join(", ")}
                                            </span>
                                        </div>
                                    </div>

                                    <BookingModal
                                        listenerId={coach.id}
                                        listenerName={coach.fullName}
                                        price={Number(coach.price) || 15}
                                        currentUser={currentUser}
                                        image={coach.image}
                                        customTrigger={
                                            <Button className="w-full bg-[#A68363] hover:bg-[#8C6F56] text-white rounded-2xl h-16 font-black uppercase tracking-widest transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 text-xs">
                                                Agendar Cita Ahora
                                            </Button>
                                        }
                                    />

                                    <p className="mt-6 text-center text-xs text-gray-400 font-medium px-4">
                                        Pago seguro con cifrado SSL. Sin permanencia ni costes ocultos.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background elements */}
            <div className="fixed top-0 right-0 w-[50%] h-[100%] bg-[#F2EDE7]/20 -z-10 blur-[100px]"></div>
        </div>
    );
}
