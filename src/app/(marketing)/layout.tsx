"use client"

import { Button } from "@/components/ui/button";
import { MessageCircle, Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";
import Link from "next/link";
import { useModals } from "@/components/modal-provider";
import { UserNav } from "@/components/user-nav";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { openAffinityModal } = useModals();

    return (
        <div className="min-h-screen flex flex-col font-sans">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm border-b border-gray-100">
                <div className="container mx-auto px-4 h-20 flex items-center">
                    {/* Logo - Scrolls to Top */}
                    <Link href="#" className="flex items-center gap-2">
                        <div className="text-[#4A3C31] font-black text-2xl tracking-tighter flex items-center gap-1">
                            <MessageCircle className="h-6 w-6 fill-current" />
                            pluravita
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600 ml-auto mr-8">
                        <Link href="/affinity-test" className="text-[#6B6B6B] hover:text-[#A68363] transition-colors">Coaches en línea</Link>
                        <Link href="#" className="text-[#6B6B6B] hover:text-[#A68363] transition-colors">Precios</Link>
                        <Link href="#faq" className="text-[#6B6B6B] hover:text-[#A68363] transition-colors">Preguntas frecuentes</Link>
                    </nav>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-4">
                        <UserNav />
                    </div>
                </div>
            </header>

            <main className="flex-1 bg-[#F9F5F0]">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        {/* Logo */}
                        <div className="flex items-center gap-1">
                            <div className="text-[#4A3C31] font-black text-2xl tracking-tighter flex items-center gap-1">
                                <MessageCircle className="h-6 w-6 fill-current" />
                                pluravita
                            </div>
                        </div>

                        {/* Center Content */}
                        <div className="text-center max-w-md">
                            <h3 className="font-bold text-[#4A3C31] mb-3">Sobre nosotros</h3>
                            <p className="text-sm text-[#6B6B6B] leading-relaxed">
                                pluravita es una plataforma de coaches en línea. Ayudamos a las personas a encontrar a su coach ideal y a comenzar su proceso en línea de forma fácil, segura y privada.
                            </p>
                        </div>

                        {/* Social Icons */}
                        <div className="flex items-center gap-4">
                            <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 text-[#6B6B6B] hover:text-[#A68363] hover:bg-beige-50 transition-all">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-[#0077FF] hover:bg-blue-50 transition-all">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-[#0077FF] hover:bg-blue-50 transition-all">
                                <Linkedin className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-[#0077FF] hover:bg-blue-50 transition-all">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-[#0077FF] hover:bg-blue-50 transition-all">
                                <Youtube className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-50 text-center text-xs text-gray-400">
                        © {new Date().getFullYear()} pluravita. Todos los derechos reservados.
                    </div>
                </div>
            </footer>
        </div>
    );
}
