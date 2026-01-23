"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, Mail, User, PlusCircle, CheckCircle2, Edit2, Save, X } from "lucide-react";
import { preApproveAdmin, updateAdminSelf } from "@/app/actions/admin";

interface SettingsClientProps {
    currentUser: any;
}

export function SettingsClient({ currentUser }: SettingsClientProps) {
    const [adminEmail, setAdminEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Profile Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        fullName: currentUser.fullName || "",
        email: currentUser.email || ""
    });
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminEmail) return;

        setIsSubmitting(true);
        const result = await preApproveAdmin(adminEmail);
        setIsSubmitting(false);

        if (result.success) {
            toast.success(`Email ${adminEmail} autorizado como administrador.`);
            setAdminEmail("");
        } else {
            toast.error(result.error || "Ocurrió un error.");
        }
    };

    const handleUpdateProfile = async () => {
        if (!profileData.fullName.trim() || !profileData.email.trim()) {
            toast.error("Todos los campos son obligatorios");
            return;
        }

        setIsSavingProfile(true);
        const result = await updateAdminSelf(currentUser.id, profileData);
        setIsSavingProfile(false);

        if (result.success) {
            toast.success("Perfil actualizado correctamente");
            setIsEditing(false);
            // Optionally update local state or router refresh manually if needed, 
            // but revalidatePath usually handles it on next navigation/action.
        } else {
            toast.error(result.error || "Error al actualizar perfil");
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    <Shield className="h-10 w-10 text-blue-600" />
                    CONFIGURACIÓN
                </h1>
                <p className="text-gray-500 mt-2 uppercase text-xs font-bold tracking-widest px-1">Gestión de cuenta y acceso administrativo</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Account Details */}
                <Card className="rounded-[2.5rem] border-gray-100 shadow-xl overflow-hidden">
                    <CardHeader className="bg-gray-50 border-b border-gray-100 p-8 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black uppercase tracking-tight">Tu Cuenta</CardTitle>
                            <CardDescription className="text-xs font-bold uppercase tracking-widest text-gray-400">Detalles del administrador actual</CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (isEditing) {
                                    setProfileData({
                                        fullName: currentUser.fullName || "",
                                        email: currentUser.email || ""
                                    });
                                }
                                setIsEditing(!isEditing);
                            }}
                            className="bg-white shadow-sm border border-gray-100 rounded-xl hover:bg-gray-50"
                        >
                            {isEditing ? <X className="h-4 w-4 text-gray-500" /> : <Edit2 className="h-4 w-4 text-blue-600" />}
                        </Button>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="flex items-center gap-6 p-6 rounded-3xl bg-gray-50/50 border border-gray-100 shadow-inner">
                            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                                {profileData.fullName?.[0] || profileData.email[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1">
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <Input
                                            value={profileData.fullName}
                                            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                            placeholder="Nombre Completo"
                                            className="h-9 bg-white text-sm font-bold"
                                        />
                                        <Input
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            placeholder="Email"
                                            className="h-9 bg-white text-xs font-medium"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm font-black text-gray-900 uppercase">{profileData.fullName || "Administrador"}</p>
                                        <p className="text-xs text-gray-500 font-bold">{profileData.email}</p>
                                    </>
                                )}
                                <div className="mt-2 inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">
                                    Status: Root Admin
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <Button
                                onClick={handleUpdateProfile}
                                disabled={isSavingProfile}
                                className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                            >
                                {isSavingProfile ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        )}

                        <div className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                                <div className="p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Último Acceso</p>
                                    <p className="text-gray-900">{new Date(currentUser.lastLogin).toLocaleDateString()}</p>
                                </div>
                                <div className="p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Rol</p>
                                    <p className="text-gray-900">ADMINISTRADOR</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Admins */}
                <Card className="rounded-[2.5rem] border-gray-100 shadow-xl overflow-hidden">
                    <CardHeader className="bg-gray-50 border-b border-gray-100 p-8">
                        <CardTitle className="text-xl font-black uppercase tracking-tight">Añadir Administrador</CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-widest text-gray-400">Autoriza nuevos correos para acceso total</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleAddAdmin} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Email del nuevo administrador</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="ejemplo@terapify.com"
                                        value={adminEmail}
                                        onChange={(e) => setAdminEmail(e.target.value)}
                                        className="h-14 pl-12 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                                <p className="text-xs text-blue-900/70 leading-relaxed font-medium">
                                    Al añadir este email, el sistema le asignará automáticamente el rol de <strong>ADMINISTRADOR</strong> en cuanto complete su registro o inicie sesión.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-14 rounded-2xl bg-gray-900 hover:bg-black text-white font-black uppercase tracking-tighter text-sm shadow-xl shadow-gray-200 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                            >
                                {isSubmitting ? "Procesando..." : (
                                    <span className="flex items-center gap-2">
                                        <PlusCircle className="h-5 w-5" />
                                        Autorizar Acceso
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
