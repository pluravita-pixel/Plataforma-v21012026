"use client";

import { useActionState, useEffect, useState } from "react";
import { getCurrentUser } from "@/app/actions/auth";
import { submitCoachApplication } from "@/app/actions/coaches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Send, User, GraduationCap, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function CoachOnboardingPage() {
    const [state, formAction, isPending] = useActionState(submitCoachApplication, null);
    const [user, setUser] = useState<any>(null);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
    const router = useRouter();

    useEffect(() => {
        getCurrentUser().then(u => {
            if (!u) router.push("/login?redirect=/coach-onboarding");
            if (u?.role === 'psychologist') router.push("/psychologist/dashboard");
            setUser(u);
        });
    }, [router]);

    if (!user) return null;

    if (state?.success) {
        return (
            <div className="min-h-screen bg-[#F9F5F0] flex flex-col items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-[2.5rem] p-12 text-center shadow-xl border border-[#A68363]/5"
                >
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="h-10 w-10 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-black text-[#4A3C31] mb-4">Solicitud enviada</h1>
                    <p className="text-[#6B6B6B] leading-relaxed mb-8">
                        Hemos recibido tu solicitud para unirte como coach. Nuestro equipo la revisará y te contactaremos por email en los próximos días.
                    </p>
                    <Button
                        asChild
                        className="w-full bg-[#A68363] hover:bg-[#8B6B4E] h-14 rounded-xl font-bold text-lg"
                    >
                        <a href="/">Volver al inicio</a>
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9F5F0] pb-20">
            <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-md border-b border-gray-100 py-4">
                <div className="container mx-auto px-4 flex items-center justify-center">
                    <Logo className="w-48 h-12" />
                </div>
            </header>

            <main className="container mx-auto px-4 pt-12">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-black text-[#4A3C31] mb-4"
                        >
                            Únete al equipo de pluravita
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-[#6B6B6B]"
                        >
                            Ayúdanos a transformar vidas. Completa tu perfil para que podamos conocerte mejor.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border-none">
                            <form action={formAction} className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-[#A68363] font-bold uppercase text-[12px] tracking-wider">
                                            <User className="h-4 w-4" /> Nombre Completo
                                        </Label>
                                        <Input
                                            name="fullName"
                                            defaultValue={user.fullName || ""}
                                            placeholder="Ej: Ana García"
                                            required
                                            className="h-14 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-[#A68363] font-bold uppercase text-[12px] tracking-wider">
                                            Email de contacto
                                        </Label>
                                        <Input
                                            name="email"
                                            type="email"
                                            defaultValue={user.email}
                                            placeholder="tu@email.com"
                                            required
                                            className="h-14 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-lg"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-[#A68363] font-bold uppercase text-[12px] tracking-wider">
                                        Teléfono
                                    </Label>
                                    <Input
                                        name="phone"
                                        defaultValue={user.phone || ""}
                                        placeholder="+34 600 000 000"
                                        required
                                        className="h-14 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-[#A68363] font-bold uppercase text-[12px] tracking-wider">
                                        <GraduationCap className="h-4 w-4" /> Formación y Experiencia
                                    </Label>
                                    <Textarea
                                        name="studies"
                                        placeholder="Detalla tus estudios, certificaciones oficiales y años de experiencia..."
                                        required
                                        className="min-h-[120px] rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-lg py-4"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-[#A68363] font-bold uppercase text-[12px] tracking-wider">
                                        Idiomas
                                    </Label>
                                    <input type="hidden" name="languages" value={selectedLanguages.join(", ")} />
                                    <div className="flex flex-wrap gap-2">
                                        {["Español", "Inglés", "Francés", "Alemán", "Italiano", "Portugués", "Catalán"].map((lang) => (
                                            <button
                                                key={lang}
                                                type="button"
                                                onClick={() => {
                                                    if (selectedLanguages.includes(lang)) {
                                                        setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
                                                    } else {
                                                        setSelectedLanguages([...selectedLanguages, lang]);
                                                    }
                                                }}
                                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${selectedLanguages.includes(lang)
                                                    ? "bg-[#A68363] text-white border-[#A68363] shadow-md transform scale-105"
                                                    : "bg-white text-gray-500 border-gray-200 hover:border-[#A68363] hover:text-[#A68363]"
                                                    }`}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                    {selectedLanguages.length === 0 && (
                                        <p className="text-xs text-amber-600/60 font-medium pl-1">Selecciona al menos un idioma</p>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <Label className="flex items-center gap-2 text-[#A68363] font-bold uppercase text-[12px] tracking-wider">
                                        Disponibilidad para Entrevista
                                    </Label>
                                    <input
                                        type="hidden"
                                        name="interviewAvailability"
                                        value={selectedDays.length > 0 && selectedTimes.length > 0 ? `${selectedDays.join(", ")} | ${selectedTimes.join(", ")}` : ""}
                                    />

                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-600">Días preferentes</label>
                                        <div className="flex flex-wrap gap-2">
                                            {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((day) => (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => {
                                                        if (selectedDays.includes(day)) {
                                                            setSelectedDays(selectedDays.filter(d => d !== day));
                                                        } else {
                                                            setSelectedDays([...selectedDays, day]);
                                                        }
                                                    }}
                                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${selectedDays.includes(day)
                                                        ? "bg-[#A68363] text-white border-[#A68363] shadow-md"
                                                        : "bg-white text-gray-500 border-gray-200 hover:border-[#A68363] hover:text-[#A68363]"
                                                        }`}
                                                >
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-600">Franjas horarias</label>
                                        <div className="flex flex-wrap gap-2">
                                            {["Mañana (9-14h)", "Mediodía (14-16h)", "Tarde (16-20h)"].map((time) => (
                                                <button
                                                    key={time}
                                                    type="button"
                                                    onClick={() => {
                                                        if (selectedTimes.includes(time)) {
                                                            setSelectedTimes(selectedTimes.filter(t => t !== time));
                                                        } else {
                                                            setSelectedTimes([...selectedTimes, time]);
                                                        }
                                                    }}
                                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${selectedTimes.includes(time)
                                                        ? "bg-[#A68363] text-white border-[#A68363] shadow-md"
                                                        : "bg-white text-gray-500 border-gray-200 hover:border-[#A68363] hover:text-[#A68363]"
                                                        }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {(selectedDays.length === 0 || selectedTimes.length === 0) && (
                                        <p className="text-xs text-amber-600/60 font-medium pl-1">Selecciona al menos un día y una franja</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-[#A68363] font-bold uppercase text-[12px] tracking-wider">
                                        <Heart className="h-4 w-4" /> ¿Por qué quieres unirte?
                                    </Label>
                                    <Textarea
                                        name="motivation"
                                        placeholder="¿Qué te motiva a formar parte de pluravita y cómo puedes ayudar a nuestros usuarios?"
                                        required
                                        className="min-h-[120px] rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-lg py-4"
                                    />
                                </div>

                                {state?.error && (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
                                        {state.error}
                                    </div>
                                )}

                                <Button
                                    className="w-full bg-[#A68363] hover:bg-[#8B6B4E] h-16 rounded-2xl font-bold text-xl shadow-lg shadow-[#A68363]/20 group"
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Enviando...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2">
                                            Enviar mi solicitud
                                            <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    )}
                                </Button>
                            </form>
                        </Card>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
