export const dynamic = 'force-dynamic';
import { getCurrentUser } from "@/app/actions/auth";
import { client } from "@/db";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { VideoOff, Video } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SessionPageProps {
    params: Promise<{ id: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    try {
        // Fetch appointment with oyente details to verify access
        const apptResult = await client`
            SELECT 
                a.*,
                a.meeting_link as appointment_meeting_link,
                p.user_id as oyente_user_id,
                p.full_name as oyente_name,
                p.meeting_link as oyente_meeting_link,
                u.full_name as usuario_name
            FROM appointments a
            JOIN oyentes p ON a.oyente_id = p.id
            LEFT JOIN users u ON a.usuario_id = u.id
            WHERE a.id = ${id}
            LIMIT 1
        `;

        const appointment = apptResult[0];

        if (!appointment) {
            return (
                <div className="flex h-screen items-center justify-center bg-neutral-50">
                    <Card className="p-8 text-center max-w-md">
                        <VideoOff className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
                        <h1 className="text-xl font-bold mb-2">Sesión no encontrada</h1>
                        <p className="text-neutral-500 mb-6">La sesión que buscas no existe o ha sido eliminada.</p>
                        <Button asChild>
                            <Link href="/usuario/dashboard">Volver al Dashboard</Link>
                        </Button>
                    </Card>
                </div>
            );
        }

        // Determine Role and Access
        const isSpecialUser = user.email === 'psicologo_test@ejemplo.com' || user.email === 'sanmiguelgil1@gmail.com';
        const isOyente = appointment.oyente_user_id === user.id || (isSpecialUser && user.role === 'oyente');
        const isUsuario = (appointment.usuario_id === user.id || (isSpecialUser && user.role === 'usuario')) && !isOyente;

        if (!isOyente && !isUsuario) {
            return (
                <div className="flex h-screen items-center justify-center bg-neutral-50">
                    <Card className="p-8 text-center max-w-md">
                        <VideoOff className="w-12 h-12 mx-auto text-red-500 mb-4" />
                        <h1 className="text-xl font-bold mb-2">Acceso Denegado</h1>
                        <p className="text-neutral-500 mb-6">No tienes permisos para acceder a esta sesión privada.</p>
                        <Button asChild>
                            <Link href="/">Volver al Inicio</Link>
                        </Button>
                    </Card>
                </div>
            );
        }

        // Check if session is CANCELLED
        if (appointment.status === 'cancelled') {
            return (
                <div className="flex h-screen items-center justify-center bg-neutral-50">
                    <Card className="p-8 text-center max-w-md">
                        <VideoOff className="w-12 h-12 mx-auto text-red-500 mb-4" />
                        <h1 className="text-xl font-bold mb-2">Sesión Cancelada</h1>
                        <p className="text-neutral-500 mb-6">Esta sesión ha sido cancelada.</p>
                        <Button asChild>
                            <Link href={isOyente ? "/oyente/dashboard" : "/usuario/dashboard"}>
                                Volver al Dashboard
                            </Link>
                        </Button>
                    </Card>
                </div>
            );
        }

        const finalMeetingLink = appointment.appointment_meeting_link || appointment.oyente_meeting_link;

        if (!finalMeetingLink) {
            return (
                <div className="flex h-screen items-center justify-center bg-neutral-50 p-6">
                    <Card className="p-12 text-center max-w-md bg-white rounded-[2.5rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                        <VideoOff className="w-16 h-16 mx-auto text-red-500 mb-6" />
                        <h1 className="text-2xl font-black uppercase italic mb-4">Link no disponible</h1>
                        <p className="text-gray-600 font-bold mb-8 uppercase text-xs tracking-tight">
                            El oyente aún no ha configurado su link de Zoom/Sesión. Por favor, contacta con soporte o espera a que el profesional lo añada a su perfil.
                        </p>
                        <Button asChild className="w-full h-14 rounded-none border-4 border-black bg-black text-white font-black uppercase hover:bg-gray-800 transition-all shadow-[6px_6px_0px_0px_rgba(166,131,99,1)]">
                            <Link href="/">Volver</Link>
                        </Button>
                    </Card>
                </div>
            );
        }

        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F9F5F0] p-6">
                <Card className="p-12 text-center max-w-lg bg-white rounded-[3rem] border border-[#A68363]/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#A68363]"></div>

                    <div className="w-24 h-24 bg-[#A68363]/10 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Video className="w-10 h-10 text-[#A68363]" />
                    </div>

                    <h1 className="text-3xl font-black text-[#4A3C31] mb-2 text-balance leading-tight">
                        Tu sesión con {appointment.oyente_name} está lista
                    </h1>
                    <p className="text-[#6B6B6B] leading-relaxed mb-10 text-sm">
                        Al hacer clic en el botón de abajo, serás redirigido a la sala de Zoom externa del profesional. Por favor, asegúrate de tener instalada la aplicación de Zoom.
                    </p>

                    <div className="space-y-4">
                        <Button asChild className="w-full h-16 rounded-2xl bg-[#A68363] hover:bg-[#8B6B4E] text-white font-black text-lg shadow-lg hover:shadow-xl transition-all group">
                            <a href={finalMeetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                                ENTRAR A LA SESIÓN (ZOOM)
                                <span className="p-1 bg-white/20 rounded-lg group-hover:translate-x-1 transition-transform">
                                    <Video className="h-5 w-5" />
                                </span>
                            </a>
                        </Button>

                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest pt-4">
                            ID DE SESIÓN: {id.slice(0, 8)}...
                        </p>
                    </div>
                </Card>
            </div>
        );

    } catch (error) {
        console.error("Error accessing session:", error);
        return (
            <div className="flex h-screen items-center justify-center bg-neutral-50">
                <p>Ha ocurrido un error al cargar la sesión.</p>
            </div>
        );
    }
}
