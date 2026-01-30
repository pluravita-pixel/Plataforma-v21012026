"use client"

import { Button } from "@/components/ui/button";
import { MessageCircle, Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";
import Link from "next/link";
import { useModals } from "@/components/modal-provider";
import { UserNav } from "@/components/user-nav";
import { useState, useEffect } from "react";
import { getCurrentUser } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { openAffinityModal } = useModals();
    const router = useRouter();
    const [hasCompletedTest, setHasCompletedTest] = useState(false);

    useEffect(() => {
        getCurrentUser().then(user => {
            if (user) {
                setHasCompletedTest(user.hasCompletedAffinity);
            }
        });
    }, []);

    const handleCoachesLinkClick = (e: React.MouseEvent) => {
        if (hasCompletedTest) {
            e.preventDefault();
            router.push("/patient/search");
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm border-b border-gray-100">
                <div className="container mx-auto px-4 h-20 flex items-center">
                    {/* Logo - Scrolls to Top */}
                    <Link href="#" className="flex items-center gap-2">
                        <div className="text-[#4A3C31] font-black text-2xl tracking-tighter flex items-center gap-1 uppercase">
                            LOGO
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600 ml-auto mr-8">
                        <Link
                            href="/affinity-test"
                            onClick={handleCoachesLinkClick}
                            className="text-[#6B6B6B] hover:text-[#A68363] transition-colors"
                        >
                            Coaches en línea
                        </Link>
                        <Link href="#" className="text-[#6B6B6B] hover:text-[#A68363] transition-colors">Precios</Link>
                        <Link href="#faq" className="text-[#6B6B6B] hover:text-[#A68363] transition-colors">Preguntas frecuentes</Link>
                        <Link href="/register?role=coach" className="text-[#A68363] font-bold border-l pl-8 hover:opacity-80 transition-opacity">Únete como coach</Link>
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
                            <div className="text-[#4A3C31] font-black text-2xl tracking-tighter flex items-center gap-1 uppercase">
                                LOGO
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
                            <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 text-[#6B6B6B] hover:text-[#A68363] hover:bg-beige-50 transition-all">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 text-[#6B6B6B] hover:text-[#A68363] hover:bg-beige-50 transition-all">
                                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M12.525.02c1.31-.032 2.61.02 3.91-.013.111 2.457 1.43 4.413 3.393 5.487v4.032a8.095 8.095 0 0 1-5.174-2.1c-.044 3.966.017 7.933-.034 11.9a7.255 7.255 0 0 1-1.282 3.867A7.016 7.016 0 0 1 6.94 24a6.962 6.962 0 0 1-5.462-2.185A7.182 7.182 0 0 1 0 17.186a7.13 7.13 0 0 1 1.481-4.226A6.992 6.992 0 0 1 6.91 10c.103.003.205.006.307.013V14.1a3.02 3.02 0 0 0-3.033 2.91 3.03 3.03 0 0 0 3.07 3.045c.033 0 .066 0 .098-.002a3.025 3.025 0 0 0 2.937-2.923c.036-3.953-.004-7.907.022-11.861.012-1.761.002-3.523.013-5.284 1.3.001 2.6.002 3.9.006.002.327.004.653.006.98-.106-1.5-.101-3-.122-4.503" /></svg>
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
