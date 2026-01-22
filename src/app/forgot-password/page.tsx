"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { resetPassword } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Link from "next/link";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            className="w-full bg-[#0077FF] hover:bg-[#0066CC] font-bold py-6 rounded-xl text-md"
            disabled={pending}
        >
            {pending ? "Enviando..." : "Restablecer contraseña"}
        </Button>
    );
}

export default function ForgotPasswordPage() {
    const [state, formAction] = useActionState(resetPassword, null);

    return (
        <div className="min-h-screen bg-[#0077FF] flex flex-col items-center justify-center p-4">
            {/* Top Logo */}
            <div className="absolute top-8 left-8 text-white font-black text-2xl tracking-tighter flex items-center gap-2">
                <MessageCircle className="h-8 w-8 fill-current" />
                pluravita
            </div>

            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-12 relative">
                {/* Back Button */}
                <Link href="/login" className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 z-10 font-medium flex items-center gap-1 text-sm">
                    <ArrowLeft className="h-4 w-4" />
                    Volver
                </Link>

                <div className="text-center space-y-4 mt-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-2xl">🔑</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">¿Olvidaste tu contraseña?</h3>
                    <p className="text-gray-500">Introduce tu correo electrónico y te enviaremos un enlace para restablecerla.</p>
                </div>

                <form action={formAction} className="space-y-6 mt-8">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-500 font-normal">Correo electrónico</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="ejemplo@correo.com"
                            required
                            className="h-12 rounded-xl bg-gray-50 border-gray-200"
                        />
                    </div>

                    {state?.error && (
                        <div className="text-sm text-destructive font-bold text-center bg-red-50 p-3 rounded-lg border border-red-100">
                            {state.error}
                        </div>
                    )}

                    {state?.success && (
                        <div className="text-sm text-green-600 font-bold text-center bg-green-50 p-3 rounded-lg border border-green-100">
                            {state.success}
                        </div>
                    )}

                    <SubmitButton />
                </form>

                <div className="mt-8 text-center text-sm">
                    <p className="text-gray-500">
                        ¿Recordaste tu contraseña?{" "}
                        <Link href="/login" className="text-[#0077FF] font-bold hover:underline">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
