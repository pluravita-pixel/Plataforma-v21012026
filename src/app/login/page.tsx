"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, LayoutDashboard, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            className="w-full btn-premium text-white font-bold py-7 rounded-2xl text-lg relative overflow-hidden group shadow-none"
            disabled={pending}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {pending ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Iniciando...
                    </>
                ) : (
                    <>
                        Iniciar sesión
                        <Sparkles className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                )}
            </span>
        </Button>
    );
}

export default function LoginPage() {
    const [state, formAction] = useActionState(login, null);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="h-screen w-full bg-[#FDFCFB] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-noise">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#A68363]/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#4A3C31]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

            {/* Top Logo */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 left-6 lg:top-8 lg:left-10 z-30"
            >
                <Link href="/" className="flex items-center gap-3 no-underline group">
                    <div className="bg-[#A68363] p-2 rounded-xl shadow-lg shadow-[#A68363]/20 text-white group-hover:scale-105 transition-transform duration-300">
                        <LayoutDashboard className="h-5 w-5 lg:h-6 lg:w-6" />
                    </div>
                    <span className="text-[#4A3C31] font-black text-xl lg:text-2xl tracking-tight">pluravita</span>
                </Link>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-6xl h-full max-h-[85vh] flex items-center justify-center p-2 lg:p-0"
            >
                {/* Glass Card Container */}
                <div className="glass-card w-full h-full rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row relative shadow-2xl">

                    {/* Back Button */}
                    <Link
                        href="/"
                        className="absolute top-6 left-6 lg:top-8 lg:left-8 text-gray-400 hover:text-[#A68363] transition-colors z-20 group flex items-center gap-2"
                    >
                        <div className="p-2 rounded-full hover:bg-[#A68363]/5 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </div>
                    </Link>

                    {/* Left Side - Visual Storytelling */}
                    <div className="hidden lg:flex lg:w-3/5 relative items-center justify-center p-12 xl:p-16 h-full overflow-hidden">
                        {/* Subtle inner background for contrast */}
                        <div className="absolute inset-0 bg-white/40" />

                        <div className="relative z-10 w-full max-w-md space-y-8 text-center flex flex-col items-center justify-center h-full">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="relative aspect-square w-full max-w-[400px] rounded-3xl overflow-hidden shadow-2xl shadow-[#A68363]/10 ring-1 ring-white/50 group"
                            >
                                <Image
                                    src="/images/login-illustration.png"
                                    alt="Pluravita Therapy"
                                    fill
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    priority
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#A68363]/10 to-transparent pointer-events-none" />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                                className="space-y-4"
                            >
                                <h2 className="text-3xl lg:text-4xl font-black text-[#4A3C31] tracking-tight leading-tight drop-shadow-sm">
                                    Tu bienestar comienza con un paso.
                                </h2>
                                <p className="text-base lg:text-lg text-[#6B6B6B] max-w-sm mx-auto leading-relaxed font-medium">
                                    Únete a nuestra comunidad de bienestar y gestión de vida consciente.
                                </p>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="w-full lg:w-2/5 h-full overflow-y-auto p-6 sm:p-12 lg:p-16 flex flex-col justify-center bg-white/60 backdrop-blur-md relative z-10 scrollbar-thin scrollbar-thumb-[#A68363]/20 scrollbar-track-transparent">
                        <div className="w-full max-w-md mx-auto space-y-8 py-4">

                            <div className="space-y-2 text-center lg:text-left">
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                >
                                    <h1 className="text-3xl lg:text-4xl font-black text-[#4A3C31] tracking-tight">Bienvenido</h1>
                                    <p className="text-[#8B6B4E] font-medium text-sm lg:text-base">Inicia sesión para continuar con tu progreso.</p>
                                </motion.div>
                            </div>

                            <form action={formAction} className="space-y-5">
                                <div className="space-y-1.5 group focus-within:transform focus-within:translate-x-1 transition-transform duration-300">
                                    <Label htmlFor="email" className="text-[12px] uppercase tracking-wider font-bold text-[#A68363] ml-1 opacity-80 group-focus-within:opacity-100 transition-opacity">Correo electrónico</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="ejemplo@pluravita.com"
                                        required
                                        className="input-premium h-12 lg:h-14 rounded-xl text-base lg:text-lg px-6"
                                    />
                                </div>

                                <div className="space-y-1.5 group focus-within:transform focus-within:translate-x-1 transition-transform duration-300">
                                    <div className="flex justify-between items-center ml-1">
                                        <Label htmlFor="password" className="text-[12px] uppercase tracking-wider font-bold text-[#A68363] opacity-80 group-focus-within:opacity-100 transition-opacity">Contraseña</Label>
                                        <Link href="/forgot-password" className="text-[10px] lg:text-xs font-bold text-[#A68363]/80 hover:text-[#A68363] transition-colors">
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            required
                                            className="input-premium h-12 lg:h-14 rounded-xl text-base lg:text-lg px-6 pr-14"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A68363]/60 hover:text-[#A68363] p-2 transition-colors rounded-xl"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    {state?.error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="text-sm text-red-600 font-bold bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-3 shadow-sm"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                            {state.error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="pt-2">
                                    <SubmitButton />
                                </div>
                            </form>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-center pt-6 lg:pt-8 border-t border-gray-100/50"
                            >
                                <p className="text-gray-400 font-medium text-sm lg:text-base">
                                    ¿Aún no tienes cuenta?{" "}
                                    <Link href="/register" className="text-[#A68363] font-black hover:text-[#8B6B4E] transition-colors ml-1 inline-block hover:-translate-y-0.5 transform duration-200">
                                        Regístrate ahora
                                    </Link>
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Language Switch / Footer Links - Absolute bottom */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6 text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest opacity-60 z-10">
                <span className="cursor-pointer hover:text-gray-600 transition-colors">Español</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span className="cursor-pointer hover:text-gray-600 transition-colors">Ayuda</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span className="cursor-pointer hover:text-gray-600 transition-colors">Privacidad</span>
            </div>
        </div>
    );
}
