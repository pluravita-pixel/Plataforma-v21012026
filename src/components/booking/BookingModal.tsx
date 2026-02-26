"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Clock, CreditCard, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Eye, EyeOff, Lock, Star, User, BookOpen, Award, Languages, MapPin, Sparkles, GraduationCap } from "lucide-react";
import { getAvailabilitySlots, createPendingAppointment, confirmAppointmentPayment } from "@/app/actions/booking";
import { createCheckoutSession } from "@/app/actions/stripe";
import { checkUserExists } from "@/app/actions/auth";
import { validateDiscountCode } from "@/app/actions/discounts";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

interface Slot {
    id: string;
    startTime: Date;
    endTime: Date;
    isBooked: boolean;
}

interface BookingModalProps {
    listenerId: string;
    listenerName: string;
    price: number;
    currentUser: any | null;
    customTrigger?: React.ReactNode;
    defaultOpen?: boolean;
    initialSlotId?: string;
    initialSlot?: Slot | null;
    // New profile fields
    description?: string | null;
    tags?: string[] | null;
    experience?: string | null;
    studies?: string | null;
    specialty?: string | null;
    rating?: string | number | null;
    licenseNumber?: string | null;
    completedSessions?: number | null;
    image?: string | null;
}

export function BookingModal({
    listenerId,
    listenerName,
    price,
    currentUser,
    customTrigger,
    defaultOpen = false,
    initialSlotId,
    initialSlot: propInitialSlot,
    description,
    tags,
    experience,
    studies,
    specialty,
    rating,
    licenseNumber,
    completedSessions,
    image
}: BookingModalProps) {
    const supabase = createClient();
    const router = useRouter();
    const [step, setStep] = useState(initialSlotId || propInitialSlot ? 1 : 1);
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const [isCanceledReturn, setIsCanceledReturn] = useState(false);
    const searchParams = useSearchParams();

    // Form Data
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isLoginMode, setIsLoginMode] = useState(false); // Toggle between register/login if needed, defaulting to register for new users

    // Calendar State
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(propInitialSlot || null);
    const [isMounted, setIsMounted] = useState(false);

    // Discount Logic
    const [discountCode, setDiscountCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number; id: string } | null>(null);
    const [validationError, setValidationError] = useState("");

    // Payment/Loading States
    const [isLoading, setIsLoading] = useState(false);

    // Sync current user data
    useEffect(() => {
        if (isOpen && currentUser) {
            setFormData(prev => ({
                ...prev,
                name: currentUser.fullName || "",
                email: currentUser.email || ""
            }));
        }
    }, [isOpen, currentUser]);

    // Handle hydration and canceled return logic
    useEffect(() => {
        setIsMounted(true);

        // Initial date (Allow today)
        const minDate = new Date();
        minDate.setHours(0, 0, 0, 0);
        setSelectedDate(minDate);

        // If we have an initialSlotId but no object, we might need to fetch it (or we just hope parent passed object)
        if (propInitialSlot) {
            setSelectedSlot(propInitialSlot);
        }

        // Check for canceled payment return
        const isCanceled = searchParams.get("canceled") === "true";
        const storedPsychId = localStorage.getItem("last_oyente_id");

        if (isCanceled && storedPsychId === listenerId) {
            try {
                const savedData = localStorage.getItem("booking_form_data");
                const savedSlot = localStorage.getItem("booking_selected_slot");

                if (savedData) setFormData(JSON.parse(savedData));
                if (savedSlot) {
                    const parsedSlot = JSON.parse(savedSlot);
                    // Convert back to Date objects if needed
                    setSelectedSlot({
                        ...parsedSlot,
                        startTime: new Date(parsedSlot.startTime),
                        endTime: new Date(parsedSlot.endTime)
                    });
                }

                setIsOpen(true);
                setStep(3);
                setIsCanceledReturn(true);

                // Clear URL params
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            } catch (e) {
                console.error("Error recovering booking state:", e);
            }
        }
    }, [searchParams, listenerId, propInitialSlot]);

    const [multiDaySlots, setMultiDaySlots] = useState<{ [key: string]: Slot[] }>({});

    // --- Fetch Slots ---
    useEffect(() => {
        if (isOpen && selectedDate) {
            const fetchSlots = async () => {
                const start = new Date(selectedDate);
                start.setHours(0, 0, 0, 0);

                // Fetch 4 days of slots
                const end = new Date(selectedDate);
                end.setDate(end.getDate() + 4);
                end.setHours(23, 59, 59, 999);

                const slots = await getAvailabilitySlots(listenerId, start, end);

                // Group by date
                const grouped: { [key: string]: Slot[] } = {};
                slots.forEach(slot => {
                    const dateKey = format(new Date(slot.startTime), "yyyy-MM-dd");
                    if (!grouped[dateKey]) grouped[dateKey] = [];
                    grouped[dateKey].push(slot);
                });

                setMultiDaySlots(grouped);
                setAvailableSlots(slots);
            };
            fetchSlots();
        }
    }, [selectedDate, isOpen, listenerId]);

    // --- Actions ---

    const handleNextStep = async () => {
        if (step === 1) {
            // Unauthenticated Flow
            if (!currentUser) {
                if (!formData.name || !formData.email) {
                    toast.error("Por favor completa tu nombre y correo.");
                    return;
                }

                if (!selectedSlot) {
                    toast.error("Por favor selecciona un horario.");
                    return;
                }

                setIsLoading(true);
                try {
                    // 1. Check if user already exists in DB
                    const exists = await checkUserExists(formData.email);

                    if (exists) {
                        toast.info("Ya tienes una cuenta. Puedes continuar con la reserva y loguearte después.");
                        // We allow them to continue to step 2 as "identified but not auth'd"
                    } else {
                        // 2. Attempt Registration ONLY if doesn't exist
                        const generatedPassword = Math.random().toString(36).slice(-10);
                        const { data, error } = await supabase.auth.signUp({
                            email: formData.email,
                            password: formData.password || generatedPassword,
                            options: {
                                emailRedirectTo: typeof window !== 'undefined' ? window.location.href : undefined,
                                data: { full_name: formData.name }
                            }
                        });

                        if (error) {
                            if (error.message.includes("already registered")) {
                                toast.info("Ya tienes una cuenta. Continuando reserva...");
                            } else {
                                toast.error(error.message);
                                setIsLoading(false);
                                return;
                            }
                        } else {
                            toast.success("Cuenta creada. Por favor verifica tu email luego.");

                            // Sincronizar respuestas del test de afinidad si existen en localStorage
                            const affinityAnswers = localStorage.getItem('affinity_test_answers');
                            if (affinityAnswers && data.user) {
                                try {
                                    const { markTestAsCompleted } = await import("@/app/actions/auth");
                                    await markTestAsCompleted(JSON.parse(affinityAnswers));
                                    localStorage.removeItem('affinity_test_answers');
                                    localStorage.removeItem('affinity_test_completed');
                                } catch (syncError) {
                                    console.error("Error syncing affinity test:", syncError);
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error("User check error:", err);
                } finally {
                    setIsLoading(false);
                }
            }

            // If we have a preselected slot, go straight to payment (step 3)
            if (selectedSlot) {
                setStep(3);
            } else {
                setStep(2);
            }

        } else if (step === 2) {
            if (!selectedSlot) {
                toast.error("Selecciona un horario disponible.");
                return;
            }
            setStep(3);
        }
    };

    const handleApplyDiscount = async () => {
        setValidationError("");
        if (!discountCode) return;

        const result = await validateDiscountCode(discountCode, currentUser?.id || "guest", formData.email);

        if (result.error) {
            setValidationError(result.error);
            setAppliedDiscount(null);
        } else if (result.success && result.discount) {
            setAppliedDiscount({
                code: result.discount.code,
                percent: result.discount.discountPercentage,
                id: result.discount.id
            });
            setValidationError("");
            toast.success("Código aplicado correctamente");
        }
    };

    const handleBooking = async () => {
        // This now just moves to payment step
        setStep(3);
    };

    const handleFreeBooking = async (appointmentId: string) => {
        setIsLoading(true);
        try {
            await confirmAppointmentPayment(appointmentId);
            setStep(4);
            toast.success("¡Reserva confirmada!");
        } catch (error) {
            toast.error("Error al confirmar la reserva");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStripePayment = async () => {
        if (!selectedSlot) return;
        setIsLoading(true);

        try {
            const finalPriceCalc = (appliedDiscount
                ? price * (1 - appliedDiscount.percent / 100)
                : price) * 1.21; // Inc. VAT

            // Determine Name to save
            const anonymousId = Math.random().toString(36).substring(2, 8).toUpperCase();
            const patientName = isAnonymous ? `Usuario-${anonymousId}` : formData.name;

            // 1. Create Pending Appointment
            const result = await createPendingAppointment({
                usuarioNombre: patientName,
                usuarioEmail: formData.email,
                oyenteId: listenerId,
                slotId: selectedSlot.id,
                startTime: selectedSlot.startTime,
                discountCodeId: appliedDiscount?.id,
                finalPrice: finalPriceCalc.toFixed(2),
                isAnonymous: isAnonymous
            });

            if (result.error || !result.appointmentId) {
                toast.error(result.error || "Error al crear la reserva");
                setIsLoading(false);
                return;
            }

            // If price is 0, confirm immediately
            if (finalPriceCalc === 0) {
                await handleFreeBooking(result.appointmentId);
                return;
            }

            // 2. Stripe Checkout Session
            const session = await createCheckoutSession(result.appointmentId);

            if (session.error || !session.url) {
                toast.error(session.error || "Error al iniciar el pago con Stripe");
                setIsLoading(false);
                return;
            }

            // Save state to recover if canceled
            localStorage.setItem("last_oyente_id", listenerId);
            localStorage.setItem("booking_form_data", JSON.stringify(formData));
            localStorage.setItem("booking_selected_slot", JSON.stringify(selectedSlot));

            // Redirect to Stripe
            window.location.href = session.url;

        } catch (error) {
            console.error("Booking simulation error:", error);
            toast.error("Error al procesar la reserva");
            setIsLoading(false);
        }
    };



    // --- Helpers ---
    const finalPrice = appliedDiscount ? price * (1 - appliedDiscount.percent / 100) : price;

    const changeDate = (days: number) => {
        if (!selectedDate) return;
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);

        // Allow today
        const minDate = new Date();
        minDate.setHours(0, 0, 0, 0);

        const checkDate = new Date(newDate);
        checkDate.setHours(0, 0, 0, 0);

        if (checkDate < minDate) return;

        setSelectedDate(newDate);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {customTrigger || (
                    <Button className="btn-premium text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                        Reservar Cita
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1000px] p-0 bg-[#FDFCFB] overflow-hidden rounded-[2rem] border-none shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[800px]">
                <DialogDescription className="sr-only">Proceso de reserva de cita con {listenerName}.</DialogDescription>

                {/* LEFT SIDE: PSYCHOLOGIST PROFILE (Hidden on mobile) */}
                <div className="hidden md:flex flex-[0.8] bg-[#F9F5F0] border-r border-[#F2EDE7] flex-col overflow-y-auto custom-scrollbar">
                    <div className="p-8 space-y-8">
                        {/* Profile Header Block */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#F2EDE7]">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-[#F9F5F0] shadow-md">
                                    {image ? (
                                        <Image src={image} alt={listenerName} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-[#A68363] flex items-center justify-center text-white text-3xl font-black">
                                            {listenerName[0]}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#4A3C31] uppercase tracking-tight">{listenerName}</h3>
                                    <p className="text-xs font-bold text-[#A68363] uppercase tracking-widest">{specialty || "Psicólogo General"}</p>
                                    <div className="flex items-center justify-center gap-1 mt-2">
                                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                        <span className="text-xs font-black text-[#4A3C31]">{rating || "5.0"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-6">
                                <div className="bg-[#F9F5F0] p-2 rounded-xl text-center">
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Nacionalidad</p>
                                    <p className="text-[10px] font-bold text-[#4A3C31]">Española</p>
                                </div>
                                <div className="bg-[#F9F5F0] p-2 rounded-xl text-center">
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Experiencia</p>
                                    <p className="text-[10px] font-bold text-[#4A3C31]">+8 años</p>
                                </div>
                            </div>
                        </div>

                        {/* About Me */}
                        <div className="space-y-3">
                            <h4 className="flex items-center gap-2 text-sm font-black text-[#4A3C31] uppercase tracking-wider">
                                <User className="h-4 w-4 text-[#A68363]" /> Sobre mí
                            </h4>
                            <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                {description || "Psicólogo colegiado comprometido con el bienestar emocional de sus pacientes, utilizando herramientas prácticas y evidencia científica."}
                            </p>
                        </div>

                        {/* Areas of focus */}
                        {tags && tags.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="flex items-center gap-2 text-sm font-black text-[#4A3C31] uppercase tracking-wider">
                                    <Sparkles className="h-4 w-4 text-[#A68363]" /> Áreas de atención
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag, i) => (
                                        <span key={i} className="bg-white px-3 py-1 rounded-full text-[9px] font-bold text-[#A68363] border border-[#F2EDE7] shadow-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Experience */}
                        <div className="space-y-3">
                            <h4 className="flex items-center gap-2 text-sm font-black text-[#4A3C31] uppercase tracking-wider">
                                <Award className="h-4 w-4 text-[#A68363]" /> Experiencia Profesional
                            </h4>
                            <ul className="space-y-2">
                                {experience?.split(',').map((exp, i) => (
                                    <li key={i} className="text-[10px] text-gray-600 font-medium flex items-start gap-2">
                                        <div className="w-1 h-1 rounded-full bg-[#A68363] mt-1.5 flex-shrink-0" />
                                        {exp.trim()}
                                    </li>
                                )) || (
                                        <li className="text-[10px] text-gray-600 font-medium italic">Información profesional verificada por Pluravita.</li>
                                    )}
                            </ul>
                        </div>

                        {/* Education */}
                        <div className="space-y-3">
                            <h4 className="flex items-center gap-2 text-sm font-black text-[#4A3C31] uppercase tracking-wider">
                                <GraduationCap className="h-4 w-4 text-[#A68363]" /> Formación Académica
                            </h4>
                            <ul className="space-y-2">
                                {studies?.split(',').map((std, i) => (
                                    <li key={i} className="text-[10px] text-gray-600 font-medium flex items-start gap-2">
                                        <div className="w-1 h-1 rounded-full bg-[#A68363] mt-1.5 flex-shrink-0" />
                                        {std.trim()}
                                    </li>
                                )) || (
                                        <li className="text-[10px] text-gray-600 font-medium italic">Grado en Psicología y Máster habilitante.</li>
                                    )}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: BOOKING FLOW */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="bg-[#A68363] p-6 md:p-8 text-white relative overflow-hidden flex-shrink-0">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                        <DialogTitle className="text-2xl font-black relative z-10 flex items-center justify-between">
                            <span>{step === 4 ? "¡Todo listo!" : "Reserva tu sesión"}</span>
                            {step < 4 && <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{price.toFixed(0)}€</span>}
                        </DialogTitle>
                        <p className="text-white/80 text-xs mt-1 relative z-10 font-black uppercase tracking-widest">
                            {step === 1 && "Paso 1: Elige horario y datos"}
                            {step === 2 && "Paso 2: Confirmación"}
                            {step === 3 && "Paso 3: Pago Seguro"}
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-white">
                        <AnimatePresence mode="wait">

                            {/* STEP 1: MULTI-DAY PICKER + FORM */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-8"
                                >
                                    {/* Multi-Day Slot Picker */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-xs font-black text-[#A68363] uppercase tracking-widest">Selecciona un horario disponible</h4>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => changeDate(-1)} className="h-6 w-6 rounded-full"><ChevronLeft className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => changeDate(1)} className="h-6 w-6 rounded-full"><ChevronRight className="h-4 w-4" /></Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-2 bg-[#F9F5F0] p-2 rounded-[1.5rem] border border-[#F2EDE7]">
                                            {[0, 1, 2, 3].map(i => {
                                                const date = new Date(selectedDate || new Date());
                                                date.setDate(date.getDate() + i);
                                                const dateKey = format(date, "yyyy-MM-dd");
                                                const daySlots = multiDaySlots[dateKey] || [];
                                                const isToday = i === 0;

                                                return (
                                                    <div key={i} className="flex flex-col gap-2">
                                                        <div className="text-center py-2 border-b border-[#F2EDE7] mb-1">
                                                            <p className="text-[8px] font-black text-[#A68363] uppercase tracking-tighter">
                                                                {isToday ? "Hoy" : format(date, "EEE", { locale: es })}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-[#4A3C31]">{format(date, "d MMM")}</p>
                                                        </div>
                                                        <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-1 py-1 custom-scrollbar scrollbar-mini">
                                                            {daySlots.length === 0 ? (
                                                                <span className="text-[8px] text-gray-300 text-center py-4 italic">Sin huecos</span>
                                                            ) : daySlots.slice(0, 10).map(slot => (
                                                                <button
                                                                    key={slot.id}
                                                                    disabled={slot.isBooked}
                                                                    onClick={() => setSelectedSlot(slot)}
                                                                    className={`py-2 rounded-lg border text-[9px] font-black transition-all ${slot.isBooked
                                                                        ? "bg-gray-100 border-gray-100 text-gray-300 cursor-not-allowed"
                                                                        : selectedSlot?.id === slot.id
                                                                            ? "bg-[#A68363] text-white border-[#A68363] shadow-md scale-[1.05]"
                                                                            : "bg-white border-white text-gray-500 hover:border-[#A68363]/50 hover:text-[#A68363]"
                                                                        }`}
                                                                >
                                                                    {slot.isBooked ? "Ocupado" : format(new Date(slot.startTime), "HH:mm")}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* User Form */}
                                    <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-black text-[#A68363] uppercase tracking-wider ml-1">Tu Nombre</Label>
                                                <Input
                                                    placeholder="Ej. Juan Pérez"
                                                    className="rounded-xl border-gray-100 bg-[#F9F5F0]/50 focus:bg-white h-11 text-sm border-2"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-black text-[#A68363] uppercase tracking-wider ml-1">Tu Correo</Label>
                                                <Input
                                                    type="email"
                                                    placeholder="juan@ejemplo.com"
                                                    className="rounded-xl border-gray-100 bg-[#F9F5F0]/50 focus:bg-white h-11 text-sm border-2"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between bg-[#F9F5F0]/50 p-3 rounded-xl border-2 border-gray-100 h-11 mt-[26px]">
                                                <div className="flex items-center gap-2">
                                                    <EyeOff className="h-3.5 w-3.5 text-[#A68363]" />
                                                    <span className="text-[10px] font-bold text-[#4A3C31]">Modo Anónimo</span>
                                                </div>
                                                <Switch
                                                    checked={isAnonymous}
                                                    onCheckedChange={setIsAnonymous}
                                                    className="data-[state=checked]:bg-[#A68363] scale-75"
                                                />
                                            </div>

                                            <div className="flex gap-2 h-11">
                                                <Input
                                                    placeholder="Cupón DESCUENTO"
                                                    value={discountCode}
                                                    onChange={(e) => setDiscountCode(e.target.value)}
                                                    className="rounded-xl border-gray-100 h-full text-xs font-bold uppercase"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={handleApplyDiscount}
                                                    variant="secondary"
                                                    className="h-full rounded-xl bg-[#4A3C31] text-white hover:bg-black text-[10px] uppercase font-black px-4"
                                                >
                                                    <Sparkles className="h-3 w-3 mr-1" /> OK
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {appliedDiscount && (
                                        <p className="text-[10px] font-black text-green-600 uppercase flex items-center gap-1 bg-green-50 p-2 rounded-lg">
                                            <CheckCircle2 className="h-3 w-3" /> ¡Cupón {appliedDiscount.code} activo! (-{appliedDiscount.percent}%)
                                        </p>
                                    )}

                                    <Button
                                        onClick={handleNextStep}
                                        disabled={isLoading || !selectedSlot}
                                        className="w-full bg-[#A68363] hover:bg-[#8C6B4D] text-white rounded-2xl h-16 font-black uppercase tracking-[0.2em] text-[11px] shadow-xl transition-all hover:scale-[1.01] active:scale-[0.98]"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>Continuar reserva {(finalPrice * 1.21).toFixed(0)}€ →</>
                                        )}
                                    </Button>
                                </motion.div>
                            )}

                            {/* STEP 3: PAYMENT / SUMMARY */}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-[#F9F5F0] p-6 rounded-[2rem] border border-[#F2EDE7] space-y-4">
                                        <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase">
                                            <span>Sesión individual (60 min.)</span>
                                            <span>{price.toFixed(2)}€</span>
                                        </div>
                                        {appliedDiscount && (
                                            <div className="flex justify-between items-center text-xs text-green-600 bg-green-50 p-3 rounded-xl">
                                                <span className="font-black">DESCUENTO ({appliedDiscount.code})</span>
                                                <span className="font-black">-{((price * appliedDiscount.percent) / 100).toFixed(2)}€</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase">
                                            <span>IVA (21%)</span>
                                            <span>{((finalPrice) * 0.21).toFixed(2)}€</span>
                                        </div>
                                        <div className="pt-4 border-t border-dashed border-[#F2EDE7] flex justify-between items-end">
                                            <div>
                                                <p className="text-[9px] font-black text-[#A68363] uppercase tracking-widest">{format(new Date(selectedSlot!.startTime), "EEEE d MMMM", { locale: es })}</p>
                                                <p className="text-sm font-black text-[#4A3C31]">{format(new Date(selectedSlot!.startTime), "HH:mm")}h</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Total a pagar</p>
                                                <p className="text-4xl font-black text-[#A68363]">{(finalPrice * 1.21).toFixed(2)}€</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Button
                                            onClick={handleStripePayment}
                                            disabled={isLoading}
                                            className="w-full bg-[#A68363] hover:bg-[#8C6B4D] text-white rounded-2xl h-16 font-black uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-3"
                                        >
                                            {isLoading ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <CreditCard className="h-5 w-5" />
                                                    Pagar Seguro Ahora
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setStep(1)}
                                            className="w-full text-gray-400 font-bold hover:bg-transparent hover:text-gray-600 text-xs uppercase"
                                        >
                                            ← Modificar elección
                                        </Button>
                                    </div>

                                    <p className="text-[9px] text-center text-gray-400 font-medium leading-relaxed">
                                        Pago procesado de forma segura por Stripe. <br />
                                        Se aplica la política de cancelación de 24 horas.
                                    </p>
                                </motion.div>
                            )}

                            {/* STEP 4: SUCCESS */}
                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12 space-y-6"
                                >
                                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto shadow-inner border border-green-100">
                                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black text-[#4A3C31] uppercase tracking-tight">¡Cita Confirmada!</h3>
                                        <p className="text-sm text-gray-500 font-medium max-w-[300px] mx-auto">
                                            Te hemos enviado un correo con el enlace de conexión y los detalles de tu cita con {listenerName}.
                                        </p>
                                    </div>

                                    <div className="bg-[#F9F5F0] p-6 rounded-3xl border border-[#F2EDE7] max-w-sm mx-auto">
                                        <div className="flex justify-between items-center text-left">
                                            <div>
                                                <p className="text-[10px] font-black text-[#A68363] uppercase tracking-widest">Profesional</p>
                                                <p className="text-sm font-bold text-[#4A3C31]">{listenerName}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-[#A68363] uppercase tracking-widest">Horario</p>
                                                <p className="text-sm font-bold text-[#4A3C31]">{format(new Date(selectedSlot!.startTime), "d MMM, HH:mm")}h</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => {
                                            setIsOpen(false);
                                            router.push('/usuario/dashboard');
                                        }}
                                        className="bg-[#A68363] hover:bg-[#8C6B4D] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] px-12 h-14 shadow-lg"
                                    >
                                        Ir a mi Dashboard
                                    </Button>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
