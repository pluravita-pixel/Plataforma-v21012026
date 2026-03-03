"use client"

import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Testimonial {
    name: string;
    initials: string;
    rating: number;
    text: string;
    date: string;
    helpfulCount?: number;
}

const testimonials: Testimonial[] = [
    {
        name: "Lorena M",
        initials: "LM",
        rating: 5,
        text: "Es una excelente plataforma y la información de los perfiles de los profesionales está muy completa para que puedas tomar una buena decisión. Ha sido muy práctico para mí que sea en línea, además me gusta mucho y me es muy funcional los contenidos adicionales.",
        date: "18 de enero de 2024",
        helpfulCount: 4
    },
    {
        name: "Clau C",
        initials: "CC",
        rating: 5,
        text: "Me ha gustado bastante. Llevo más de 1 año teniendo sesiones a través de Pluravita, la verdad me ha servido bastante y los recordatorios que me envían me funcionan para entrar a tiempo a mi sesión. Compro paquetes de sesiones y eso hace que sea más accesible.",
        date: "6 de marzo de 2024"
    },
    {
        name: "Margarita C",
        initials: "MC",
        rating: 5,
        text: "He tenido una buena experiencia, encontré una buena profesional y me funciona mucho que sea en línea. La plataforma es muy intuitiva y segura.",
        date: "16 de enero de 2024"
    },
    {
        name: "Francisco M",
        initials: "FM",
        rating: 5,
        text: "La plataforma ofrece un repertorio bastante diverso para elegir al profesional acorde a nuestras necesidades, además de poder cambiar con el especialista con facilidad si lo requieres.",
        date: "17 de enero de 2024"
    },
    {
        name: "Sophia G",
        initials: "SG",
        rating: 5,
        text: "Muy fácil de usar y tienes toda la información de los profesionales a mano y tus citas. Destaco el chat directo de asistencia técnica, ¡funciona muy bien! Responden de inmediato.",
        date: "29 de junio de 2020",
        helpfulCount: 53
    }
];

export function Testimonials() {
    return (
        <section className="bg-white py-24">
            <div className="container mx-auto px-6 md:px-12 lg:px-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-[#4A3C31] uppercase tracking-tighter mb-4">
                        Opiniones de nuestros pacientes
                    </h2>
                    <h3 className="text-xl text-[#6B6B6B] font-medium max-w-2xl mx-auto leading-relaxed">
                        Conoce cómo la terapia en línea en Pluravita ha cambiado la vida de miles de personas
                    </h3>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="p-8 bg-[#F9F5F0] border-none rounded-[2rem] neo-shadow-sm flex flex-col justify-between hover:shadow-xl transition-all duration-300">
                            <div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-[#826245] flex items-center justify-center text-white font-bold text-lg shadow-md">
                                        {testimonial.initials}
                                    </div>
                                    <div>
                                        <cite className="font-bold text-[#4A3C31] not-italic block">{testimonial.name}</cite>
                                        <div className="flex gap-0.5 mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < testimonial.rating ? "fill-[#826245] text-[#826245]" : "text-gray-300"}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[#6B6B6B] font-medium leading-relaxed italic mb-6">
                                    "{testimonial.text}"
                                </p>
                            </div>
                            <div className="border-t border-[#826245]/10 pt-4 mt-auto">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-[#826245]/60 uppercase tracking-widest">{testimonial.date}</span>
                                    {testimonial.helpfulCount && (
                                        <span className="text-[10px] text-[#8C8C8C] font-medium italic">
                                            Esta opinión les resultó útil a {testimonial.helpfulCount} personas
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}

                    {/* Call to action card */}
                    <Card className="p-8 bg-[#826245] border-none rounded-[2rem] text-white flex flex-col items-center justify-center text-center shadow-2xl hover:scale-[1.02] transition-transform duration-300">
                        <div className="mb-6">
                            <div className="text-4xl font-black mb-2">4,9/5</div>
                            <div className="flex justify-center gap-1">
                                {[...Array(4)].map((_, i) => <Star key={i} className="w-6 h-6 fill-white text-white" />)}
                                <div className="relative">
                                    <Star className="w-6 h-6 text-white" />
                                    <div className="absolute inset-0 overflow-hidden w-1/2">
                                        <Star className="w-6 h-6 fill-white text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <h4 className="text-xl font-black uppercase tracking-tight mb-8">
                            Encuentra el profesional ideal para ti
                        </h4>
                        <Link href="/usuario/search" className="w-full">
                            <Button className="w-full bg-white text-[#826245] hover:bg-white/90 font-black rounded-full py-6 uppercase tracking-widest text-xs transition-all shadow-lg border-none">
                                Ver profesionales disponibles
                            </Button>
                        </Link>
                    </Card>
                </div>
            </div>
        </section>
    );
}
