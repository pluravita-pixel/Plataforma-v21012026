"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
            // Delay social proof showing a bit
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie-consent", "accepted");
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem("cookie-consent", "declined");
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-2xl"
                >
                    <div className="relative overflow-hidden group bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-zinc-800/50 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
                        {/* Animated Background Glow */}
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 blur-[80px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-700" />
                        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-all duration-700" />

                        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center border border-emerald-500/20 shadow-inner overflow-hidden relative">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                            >
                                <Cookie className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                            </motion.div>
                        </div>

                        <div className="flex-grow text-center md:text-left space-y-2">
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                                Privacidad y Cookies
                                <ShieldCheck className="w-4 h-4 text-blue-500" />
                            </h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md">
                                Utilizamos cookies para mejorar tu experiencia, analizar el tráfico y ofrecerte servicios personalizados. Al aceptarlas, nos ayudas a mejorar pluravita.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <Button
                                variant="ghost"
                                onClick={handleDecline}
                                aria-label="Aceptar solo cookies necesarias"
                                className="rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 h-11 px-6 active:scale-95 transition-all"
                            >
                                Solo necesarias
                            </Button>
                            <Button
                                onClick={handleAccept}
                                aria-label="Aceptar todas las cookies"
                                className="rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 font-semibold h-11 px-8 active:scale-95 transition-all shadow-lg shadow-zinc-500/20"
                            >
                                Aceptar todas
                            </Button>
                        </div>

                        <button
                            onClick={() => setIsVisible(false)}
                            aria-label="Cerrar aviso de cookies"
                            className="absolute top-4 right-4 p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
