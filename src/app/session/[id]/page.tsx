import { getCurrentUser } from "@/app/actions/auth";
import { client } from "@/db";
import { redirect } from "next/navigation";
import MeetingRoom from "@/components/meeting/MeetingRoom";
import { Card } from "@/components/ui/card";
import { VideoOff } from "lucide-react";
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
        // Fetch appointment with psychologist details to verify access
        const apptResult = await client`
            SELECT 
                a.*,
                p.user_id as psychologist_user_id,
                p.full_name as psychologist_name,
                u.full_name as patient_name
            FROM appointments a
            JOIN psychologists p ON a.psychologist_id = p.id
            LEFT JOIN users u ON a.patient_id = u.id
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
                            <Link href="/patient/dashboard">Volver al Dashboard</Link>
                        </Button>
                    </Card>
                </div>
            );
        }

        // Determine Role and Access
        const isPsychologist = appointment.psychologist_user_id === user.id;
        const isPatient = appointment.patient_id === user.id;

        if (!isPsychologist && !isPatient) {
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
                            <Link href={isPsychologist ? "/psychologist/dashboard" : "/patient/dashboard"}>
                                Volver al Dashboard
                            </Link>
                        </Button>
                    </Card>
                </div>
            );
        }

        // Pass necessary data to the Client Component
        const sessionProps = {
            appointmentId: appointment.id,
            startTime: appointment.date ? new Date(appointment.date).toISOString() : new Date().toISOString(),
            userRole: isPsychologist ? 'psychologist' : 'patient' as 'psychologist' | 'patient',
            userName: isPsychologist ? appointment.psychologist_name : (appointment.patient_name || user.fullName),
            userEmail: user.email,
            patientId: appointment.patient_id,
            psychologistId: appointment.psychologist_id
        };

        return <MeetingRoom {...sessionProps} />;

    } catch (error) {
        console.error("Error accessing session:", error);
        return (
            <div className="flex h-screen items-center justify-center bg-neutral-50">
                <p>Ha ocurrido un error al cargar la sesión.</p>
            </div>
        );
    }
}
