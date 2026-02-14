"use client"

import { Button } from "@/components/ui/button";
import { MessageCircle, Facebook, Twitter, Linkedin, Instagram, Youtube, Menu, X } from "lucide-react";
import Link from "next/link";
import { useModals } from "@/components/modal-provider";
import { UserNav } from "@/components/user-nav";
import { useState, useEffect } from "react";
import { getCurrentUser } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Logo } from "@/components/logo";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { openAffinityModal } = useModals();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [hasCompletedTest, setHasCompletedTest] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        getCurrentUser().then(u => {
            if (u) {
                setUser(u);
                setHasCompletedTest(u.hasCompletedAffinity);
            }
        });
    }, []);

    const handleCoachesLinkClick = (e: React.MouseEvent) => {
        if (hasCompletedTest) {
            e.preventDefault();
            router.push("/usuario/search");
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans">
            {/* Navbar */}
            <header className={`sticky top-0 z-50 w-full border-b border-gray-100 transition-all duration-300 ${mobileMenuOpen ? 'bg-white shadow-lg' : 'bg-white shadow-sm'}`}>
                <div className="container mx-auto px-6 md:px-12 lg:px-20 h-20 flex items-center">
                    <Link href="#" className="flex items-center h-full group">
                        <Logo className="w-48 sm:w-64 h-16 sm:h-20" />
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600 ml-auto mr-8">
                        <Link
                            href="/affinity-test"
                            onClick={handleCoachesLinkClick}
                            className="text-[#6B6B6B] hover:text-[#A68363] transition-colors"
                        >
                            Oyentes en línea
                        </Link>
                        {(!user || !hasCompletedTest) && (
                            <Link
                                href={user ? "/affinity-test" : "/register"}
                                className="text-[#6B6B6B] hover:text-[#A68363] transition-colors"
                            >
                                Test de Afinidad
                            </Link>
                        )}
                        <Link href="#faq" className="text-[#6B6B6B] hover:text-[#A68363] transition-colors">Preguntas frecuentes</Link>
                        {user?.role === 'oyente' ? (
                            <Link href="/oyente/dashboard" className="text-[#A68363] font-bold border-l pl-8 hover:opacity-80 transition-opacity">Panel de Oyente</Link>
                        ) : !user && (
                            <Link href="/register?role=coach" className="text-[#A68363] font-bold border-l pl-8 hover:opacity-80 transition-opacity">Únete como oyente</Link>
                        )}
                    </nav>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden lg:flex items-center gap-4">
                        <UserNav />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden ml-auto p-2 text-[#6B6B6B] hover:text-[#A68363] transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />

                        {/* Menu Panel */}
                        <div className="fixed top-20 right-0 bottom-0 w-full max-w-sm bg-white z-50 lg:hidden shadow-2xl animate-in slide-in-from-right duration-300">
                            <nav className="flex flex-col p-6 space-y-4">
                                <Link
                                    href="/affinity-test"
                                    onClick={(e) => {
                                        handleCoachesLinkClick(e);
                                        setMobileMenuOpen(false);
                                    }}
                                    className="text-[#6B6B6B] hover:text-[#A68363] transition-colors py-3 px-4 rounded-lg hover:bg-[#F2EDE7] font-medium"
                                >
                                    Oyentes en línea
                                </Link>
                                {(!user || !hasCompletedTest) && (
                                    <Link
                                        href={user ? "/affinity-test" : "/register"}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-[#6B6B6B] hover:text-[#A68363] transition-colors py-3 px-4 rounded-lg hover:bg-[#F2EDE7] font-medium"
                                    >
                                        Test de Afinidad
                                    </Link>
                                )}
                                <Link
                                    href="#faq"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-[#6B6B6B] hover:text-[#A68363] transition-colors py-3 px-4 rounded-lg hover:bg-[#F2EDE7] font-medium"
                                >
                                    Preguntas frecuentes
                                </Link>

                                <div className="border-t border-gray-100 pt-4 mt-4">
                                    {user?.role === 'oyente' ? (
                                        <Link
                                            href="/oyente/dashboard"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="text-[#A68363] font-bold py-3 px-4 rounded-lg hover:bg-[#F2EDE7] block"
                                        >
                                            Panel de Oyente
                                        </Link>
                                    ) : !user && (
                                        <Link
                                            href="/register?role=coach"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="text-[#A68363] font-bold py-3 px-4 rounded-lg hover:bg-[#F2EDE7] block"
                                        >
                                            Únete como oyente
                                        </Link>
                                    )}
                                </div>

                                <div className="border-t border-gray-100 pt-4 mt-4">
                                    <UserNav />
                                </div>
                            </nav>
                        </div>
                    </>
                )}
            </header>

            <main className="flex-1 bg-[#F9F5F0]">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="container mx-auto px-6 md:px-12 lg:px-20">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center">
                            <Logo className="w-40 h-12 opacity-80" />
                        </div>

                        {/* Center Content */}
                        <div className="text-center max-w-md">
                            <h3 className="font-bold text-[#4A3C31] mb-3">Sobre nosotros</h3>
                            <p className="text-sm text-[#6B6B6B] leading-relaxed">
                                pluravita es una plataforma de oyentes en línea. Ayudamos a las personas a encontrar a su oyente ideal y a comenzar su proceso en línea de forma fácil, segura y privada.
                            </p>
                        </div>

                        {/* Social Icons */}
                        {/* Social Icons removed */}
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-50 text-center text-xs text-gray-400">
                        © {new Date().getFullYear()} pluravita. Todos los derechos reservados.
                    </div>

                    <div className="mt-4 flex flex-wrap justify-center gap-6 text-xs text-gray-500">
                        <Link href="/aviso-legal" className="hover:text-[#A68363] transition-colors">Aviso Legal</Link>
                        <Link href="/politica-privacidad" className="hover:text-[#A68363] transition-colors">Política de Privacidad</Link>
                        <Link href="/politica-cookies" className="hover:text-[#A68363] transition-colors">Política de Cookies</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
