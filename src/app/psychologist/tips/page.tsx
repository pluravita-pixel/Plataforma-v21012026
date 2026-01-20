import { Lightbulb, CheckCircle2, Rocket, Heart } from "lucide-react";

export default function TipsPage() {
    const tips = [
        {
            title: "Completa tu perfil al 100%",
            description: "Los usuarios confían más en perfiles con descripciones detalladas, formación académica y una imagen profesional.",
            icon: CheckCircle2,
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            title: "Sincroniza tu calendario",
            description: "Asegúrate de tener tus horarios actualizados para que los clientes puedan agendar sesiones sin conflictos.",
            icon: Rocket,
            color: "text-purple-500",
            bg: "bg-purple-50"
        },
        {
            title: "La primera impresión cuenta",
            description: "Prepara tu espacio de trabajo: buena iluminación, fondo neutral y conexión a internet estable.",
            icon: Lightbulb,
            color: "text-orange-500",
            bg: "bg-orange-50"
        },
        {
            title: "Humaniza tu atención",
            description: "Envía un mensaje de bienvenida a tus nuevos clientes para romper el hielo antes de la primera sesión.",
            icon: Heart,
            color: "text-pink-500",
            bg: "bg-pink-50"
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-[#4A3C31] tracking-tight underline decoration-[#A68363] decoration-4 underline-offset-8">GUÍA DE INICIO</h1>
                <p className="text-gray-500 mt-4 uppercase text-xs font-bold tracking-widest">Consejos para empezar con éxito en pluravita</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tips.map((tip, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`w-14 h-14 rounded-2xl ${tip.bg} ${tip.color} flex items-center justify-center mb-6`}>
                            <tip.icon className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{tip.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{tip.description}</p>
                    </div>
                ))}
            </div>

            <div className="bg-[#A68363] p-10 rounded-[3rem] text-white overflow-hidden relative">
                <div className="relative z-10">
                    <h2 className="text-2xl font-black mb-4">¿Necesitas ayuda extra?</h2>
                    <p className="text-orange-50 mb-8 max-w-lg">Nuestro equipo de soporte para coaches está disponible para ayudarte a configurar tus primeras sesiones.</p>
                    <button className="bg-white text-[#A68363] font-black px-8 py-4 rounded-2xl hover:bg-orange-50 transition-colors uppercase text-xs tracking-widest">
                        Contactar Soporte
                    </button>
                </div>
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            </div>
        </div>
    );
}
