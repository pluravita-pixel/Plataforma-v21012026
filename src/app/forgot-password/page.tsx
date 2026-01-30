"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { resetPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MessageCircle, KeyRound, LayoutDashboard } from "lucide-react";
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
                        Enviando...
                    </>
                ) : (
                    "Restablecer contraseña"
                )}
            </span>
        </Button>
    );
}

export default function ForgotPasswordPage() {
    const [state, formAction] = useActionState(resetPassword, null);

    return (
        <div className="min-h-dvh bg-[#FDFCFB] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-noise">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#A68363]/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#4A3C31]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

            {/* Top Logo */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-6 left-6 lg:top-10 lg:left-10 z-20"
            >
                <Link href="/" className="flex items-center no-underline hover:opacity-80 transition-opacity">
                    <div className="relative w-64 h-16 overflow-hidden flex items-center justify-center">
                        <Image
                            src="/logo.png"
                            alt="pluravita Logo"
                            width={500}
                            height={500}
                            className="h-44 w-auto object-contain mix-blend-multiply brightness-105"
                            priority
                        />
                    </div>
                </Link>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass-card w-full rounded-[2rem] p-8 sm:p-12 bg-white/60 backdrop-blur-md shadow-xl border border-white/40">
                    {/* Back Button */}
                    <Link
                        href="/login"
                        className="absolute top-6 left-6 text-gray-400 hover:text-[#A68363] transition-colors z-20 group flex items-center gap-2"
                    >
                        <div className="p-2 rounded-full hover:bg-[#A68363]/5 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </div>
                    </Link>

                    <div className="text-center space-y-4 mt-8">
                        <div className="w-16 h-16 bg-[#A68363]/10 rounded-2xl flex items-center justify-center mx-auto ring-1 ring-[#A68363]/20">
                            <KeyRound className="h-8 w-8 text-[#A68363]" />
                        </div>
                        <h3 className="text-2xl font-black text-[#4A3C31] tracking-tight">¿Recuperar contraseña?</h3>
                        <p className="text-[#8B6B4E] font-medium text-sm leading-relaxed">
                            Introduce tu correo y te enviaremos las instrucciones de recuperación.
                        </p>
                    </div>

                    <form action={formAction} className="space-y-6 mt-10">
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
                            {state?.success && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-sm text-green-600 font-bold bg-green-50 p-4 rounded-2xl border border-green-100 flex items-center gap-3 shadow-sm"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    {state.success}
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
                        className="text-center pt-8 border-t border-gray-100/50 mt-10"
                    >
                        <p className="text-gray-400 font-medium text-sm">
                            ¿Recordaste tu contraseña?{" "}
                            <Link href="/login" className="text-[#A68363] font-black hover:text-[#8B6B4E] transition-colors ml-1 inline-block hover:-translate-y-0.5 transform duration-200">
                                Inicia sesión
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
