"use client";

import { useState, useEffect } from "react";
import { UserCircle, Mail, Phone, ShieldCheck, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getCurrentUser } from "@/app/actions/auth";
import { updateUsuarioProfile } from "@/app/actions/usuarios";

export default function PatientProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: ""
    });

    useEffect(() => {
        async function loadUser() {
            setLoading(true);
            const data = await getCurrentUser();
            if (data) {
                setUser(data);
                setForm({
                    fullName: data.fullName || "",
                    email: data.email || "",
                    phone: data.phone || ""
                });
            }
            setLoading(false);
        }
        loadUser();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        const result = await updateUsuarioProfile(form);
        setIsSaving(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.message || "Perfil actualizado correctamente");
        }
    };

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin w-12 h-12 border-4 border-[#A68363] border-t-transparent rounded-full mx-auto"></div>
                </div>
            ) : (
                <>
                    <div>
                        <h1 className="text-4xl font-black text-[#4A3C31] tracking-tight flex items-center gap-3">
                            <UserCircle className="h-10 w-10 text-[#A68363]" />
                            MI CUENTA
                        </h1>
                        <p className="text-[#8C8C8C] mt-2 font-medium text-lg uppercase tracking-widest text-xs">Gestiona tu información personal y de contacto</p>
                    </div>

                    {/* Full Width - Form */}
                    <div className="space-y-6">
                        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#A68363]/5 rounded-bl-[100px] pointer-events-none"></div>

                            <div className="space-y-8 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Nombre Completo</Label>
                                        <div className="relative">
                                            <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                            <Input
                                                value={form.fullName}
                                                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                                className="h-14 pl-12 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-[#A68363]/5 focus:border-[#A68363] transition-all font-medium"
                                                placeholder="Tu nombre completo"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Teléfono</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                            <Input
                                                value={form.phone}
                                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                className="h-14 pl-12 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-[#A68363]/5 focus:border-[#A68363] transition-all font-medium"
                                                placeholder="+52 000 000 0000"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Correo Electrónico</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                                        <Input
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="h-14 pl-12 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-[#A68363]/5 focus:border-[#A68363] transition-all font-medium"
                                            placeholder="ejemplo@email.com"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold ml-1 mt-2">Usaremos este email para enviarte recordatorios de tus citas.</p>
                                </div>

                                <div className="pt-6 flex justify-end">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="bg-[#4A3C31] hover:bg-black text-white font-black uppercase tracking-widest text-xs rounded-2xl px-12 h-14 shadow-xl shadow-[#4A3C31]/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                                    >
                                        {isSaving ? "Guardando..." : (
                                            <span className="flex items-center gap-2">
                                                <Save className="h-4 w-4" />
                                                Guardar Cambios
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
