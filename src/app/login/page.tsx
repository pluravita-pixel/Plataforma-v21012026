"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, LayoutDashboard, LogIn } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/logo";
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
                        Accediendo...
                    </>
                ) : (
                    <>
                        Iniciar sesión
                        <LogIn className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
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
        <div className="min-h-dvh bg-[#F9F5F0] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-noise">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#A68363]/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#4A3C31]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-6xl mt-16 lg:mt-0"
            >
                {/* Glass Card Container */}
                <div className="glass-card w-full rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row relative min-h-auto lg:min-h-[700px]">

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
                    <div className="hidden lg:flex lg:w-3/5 relative items-center justify-center p-16">
                        <div className="absolute inset-0 bg-white/40" />

                        <div className="relative z-10 w-full max-w-md space-y-12 text-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="relative aspect-square w-full rounded-3xl overflow-hidden shadow-2xl shadow-[#A68363]/10 ring-1 ring-white/50 group"
                            >
                                <Image
                                    src="/images/login-illustration.png"
                                    alt="Pluravita Login"
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
                                <h2 className="text-4xl font-black text-[#4A3C31] tracking-tight leading-tight drop-shadow-sm">
                                    Bienvenido de nuevo.
                                </h2>
                                <p className="text-lg text-[#6B6B6B] max-w-sm mx-auto leading-relaxed font-medium">
                                    Continúa tu camino hacia el bienestar con tu oyente de confianza.
                                </p>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="w-full lg:w-2/5 p-6 sm:p-12 lg:p-20 flex flex-col justify-center bg-white/60 backdrop-blur-md relative z-10 my-auto">
                        <div className="w-full max-w-md mx-auto space-y-8 lg:space-y-8 pt-12 lg:pt-0">

                            <div className="space-y-2 text-center lg:text-left">
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3, duration: 0.6 }}
                                >
                                    <h1 className="text-3xl lg:text-4xl font-black text-[#4A3C31] tracking-tight">Inicia sesión</h1>
                                </motion.div>
                            </div>

                            <form action={formAction} className="space-y-5">
                                <div className="space-y-1.5 group focus-within:transform focus-within:translate-x-1 transition-transform duration-300">
                                    <Label htmlFor="email" className="text-[13px] uppercase tracking-wider font-bold text-[#A68363] ml-1 opacity-80 group-focus-within:opacity-100 transition-opacity">Correo electrónico</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="ejemplo@pluravita.com"
                                        required
                                        className="input-premium h-14 rounded-xl text-lg px-6"
                                    />
                                </div>

                                <div className="space-y-1.5 group focus-within:transform focus-within:translate-x-1 transition-transform duration-300">
                                    <div className="flex justify-between items-center ml-1">
                                        <Label htmlFor="password" className="text-[13px] uppercase tracking-wider font-bold text-[#A68363] opacity-80 group-focus-within:opacity-100 transition-opacity">Contraseña</Label>
                                        <Link href="/forgot-password" title="recuperar" className="text-[11px] font-bold text-gray-400 hover:text-[#A68363] transition-colors">
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>
                                    <div className="relative group">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            required
                                            className="input-premium h-14 rounded-xl text-lg px-6 pr-14"
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

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-100" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-gray-400 font-bold">O continuar con</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={async () => {
                                    const { signInWithGoogle } = await import("@/app/actions/auth");
                                    await signInWithGoogle();
                                }}
                                className="w-full h-14 rounded-xl border-2 border-gray-100 font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all text-gray-600 shadow-sm"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Google
                            </Button>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-center pt-8 border-t border-gray-100/50"
                            >
                                <p className="text-gray-400 font-medium text-sm lg:text-base">
                                    ¿Aún no tienes cuenta?{" "}
                                    <Link href="/register" className="text-[#A68363] font-black hover:text-[#8B6B4E] transition-colors ml-1 inline-block hover:-translate-y-0.5 transform duration-200">
                                        Regístrate gratis
                                    </Link>
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Language Switch / Footer Links */}
            <div className="mt-8 lg:mt-12 flex items-center gap-6 text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest opacity-60">
                <span className="cursor-pointer hover:text-gray-600 transition-colors">Español</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span className="cursor-pointer hover:text-gray-600 transition-colors">Ayuda</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span className="cursor-pointer hover:text-gray-600 transition-colors">Privacidad</span>
            </div>
        </div>
    );
}
