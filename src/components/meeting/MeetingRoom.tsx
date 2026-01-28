"use client";

import { useEffect, useState } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { Loader2, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format, differenceInSeconds, addMinutes } from "date-fns";
import { es } from "date-fns/locale";

interface MeetingRoomProps {
    appointmentId: string;
    startTime: string; // ISO string
    userRole: 'psychologist' | 'patient';
    userName: string;
    userEmail: string;
    patientId: string;
    psychologistId: string;
}

export default function MeetingRoom({
    appointmentId,
    startTime,
    userRole,
    userName,
    userEmail
}: MeetingRoomProps) {
    const router = useRouter();
    const [status, setStatus] = useState<'waiting' | 'active' | 'ended'>('waiting');
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);

    // Calculate session timing
    useEffect(() => {
        const calculateTime = () => {
            const start = new Date(startTime);
            const end = addMinutes(start, 60); // 60 minute session
            const now = new Date();

            const secondsUntilStart = differenceInSeconds(start, now);
            const secondsUntilEnd = differenceInSeconds(end, now);

            if (secondsUntilEnd <= 0) {
                setStatus('ended');
                setTimeLeft(0);
                return;
            }

            const isSpecialUser = userEmail === 'sanmiguelgil1@gmail.com';

            if (isSpecialUser) {
                // Special user bypasses timing checks unless session passed 50 min mark
                setStatus('active');
            } else if (secondsUntilStart > 300) {
                setStatus('waiting');
            } else {
                setStatus('active');
            }

            setTimeLeft(secondsUntilEnd);
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    const handleReadyToClose = () => {
        toast.info("La sesión ha finalizado.");
        if (userRole === 'psychologist') {
            router.push(`/psychologist/appointments/${appointmentId}`);
        } else {
            router.push(`/patient/appointments`); // Or feedback page
        }
    };

    if (status === 'ended') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-4">
                <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-xl border-neutral-200">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <Clock className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-900">Sesión Finalizada</h1>
                    <p className="text-neutral-600">
                        El tiempo de la sesión (60 min) ha expirado o la fecha de la cita ya pasó.
                    </p>
                    <Button
                        onClick={() => router.back()}
                        className="w-full bg-[#4A3C31] hover:bg-[#2C241D]"
                    >
                        Volver al Dashboard
                    </Button>
                </Card>
            </div>
        );
    }

    if (status === 'waiting') {
        const start = new Date(startTime);
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-4 text-center">
                <Card className="max-w-md w-full p-8 space-y-6 shadow-xl border-neutral-200">
                    <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center animate-pulse">
                        <Clock className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">Esperando la hora de inicio</h1>
                        <p className="text-neutral-500 mt-2">
                            Tu sesión está programada para el:
                        </p>
                        <p className="text-lg font-semibold text-[#A68363] mt-1">
                            {format(start, "EEEE d 'de' MMMM, HH:mm", { locale: es })}
                        </p>
                    </div>
                    <div className="bg-neutral-100 p-4 rounded-lg text-sm text-neutral-600">
                        {userEmail === 'sanmiguelgil1@gmail.com'
                            ? "Como usuario prioritario, tienes acceso ilimitado a esta sala en cualquier momento."
                            : "Podrás ingresar 5 minutos antes de la hora programada."
                        }
                    </div>
                    <Button variant="outline" onClick={() => router.back()}>
                        Volver
                    </Button>
                </Card>
            </div>
        );
    }

    // Active Session
    return (
        <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col">
            {/* Custom Toolbar / Timer Overlay */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4 flex justify-between items-center text-white pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    <Clock className={`w-4 h-4 ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`} />
                    <span className="font-mono font-bold">
                        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-white/60 ml-1 hidden sm:inline">minutos restantes</span>
                </div>

                <div className="flex items-center gap-2 pointer-events-auto">
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleReadyToClose}
                        className="rounded-full px-6 shadow-lg shadow-red-900/20"
                    >
                        Salir
                    </Button>
                </div>
            </div>

            {!isJitsiLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 text-white z-0">
                    <Loader2 className="w-10 h-10 animate-spin text-[#A68363]" />
                    <span className="ml-3">Conectando llamada segura...</span>
                </div>
            )}

            <JitsiMeeting
                domain="meet.jit.si"
                roomName={`pluravita-secure-session-${appointmentId}`}
                configOverwrite={{
                    startWithAudioMuted: true,
                    disableDeepLinking: true,
                    remoteVideoMenu: {
                        disableKick: userRole !== 'psychologist', // Psychologists can kick if needed
                    },
                    prejoinPageEnabled: false,
                    toolbarButtons: [
                        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                        'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                        'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                        'videoquality', 'filmstrip', 'tileview', 'videobackgroundblur', 'download', 'help',
                        userRole === 'psychologist' ? 'mute-everyone' : '',
                        userRole === 'psychologist' ? 'security' : '',
                    ],
                }}
                userInfo={{
                    displayName: userName,
                    email: userEmail
                }}
                onApiReady={(externalApi) => {
                    setIsJitsiLoaded(true);

                    // Add listeners if needed
                    externalApi.addEventListener('videoConferenceLeft', () => {
                        handleReadyToClose();
                    });
                }}
                getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = '100%';
                    iframeRef.style.width = '100%';
                    iframeRef.style.border = 'none';
                }}
            />
        </div>
    );
}
