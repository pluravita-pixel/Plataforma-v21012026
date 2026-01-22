"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Clock, CreditCard, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Eye, EyeOff, Lock } from "lucide-react";
import { getAvailabilitySlots, createPendingAppointment, confirmAppointmentPayment } from "@/app/actions/booking";
import { createCheckoutSession } from "@/app/actions/stripe";
import { checkUserExists } from "@/app/actions/auth";
import { validateDiscountCode } from "@/app/actions/discounts";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { PaymentForm } from "@/components/payment/PaymentForm";
import { useRouter, useSearchParams } from "next/navigation";

interface Slot {
    id: string;
    startTime: Date;
    endTime: Date;
    isBooked: boolean;
}

interface BookingModalProps {
    psychologistId: string;
    psychologistName: string;
    price: number;
    currentUser: any | null;
    customTrigger?: React.ReactNode;
}

export function BookingModal({ psychologistId, psychologistName, price, currentUser, customTrigger }: BookingModalProps) {
    const supabase = createClient();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isOpen, setIsOpen] = useState(false);
    const [isCanceledReturn, setIsCanceledReturn] = useState(false);
    const searchParams = useSearchParams();

    // Form Data
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isLoginMode, setIsLoginMode] = useState(false); // Toggle between register/login if needed, defaulting to register for new users

    // Calendar State
    const getTomorrow = () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d;
    };
    const [selectedDate, setSelectedDate] = useState<Date>(getTomorrow());
    const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

    // Discount Logic
    const [discountCode, setDiscountCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number; id: string } | null>(null);
    const [validationError, setValidationError] = useState("");

    // Payment/Loading States
    const [isLoading, setIsLoading] = useState(false);

    // --- Init Data on Open & Handle Canceled Return ---
    useEffect(() => {
        if (isOpen && currentUser) {
            setFormData(prev => ({
                ...prev,
                name: currentUser.fullName || "",
                email: currentUser.email || ""
            }));
        }
    }, [isOpen, currentUser]);

    useEffect(() => {
        const checkCanceled = () => {
            const isCanceled = searchParams.get("canceled") === "true";
            const apptId = searchParams.get("appt");
            const storedPsychId = localStorage.getItem("last_psych_id");

            if (isCanceled && storedPsychId === psychologistId) {
                // Recover data
                const savedData = localStorage.getItem("booking_form_data");
                const savedSlot = localStorage.getItem("booking_selected_slot");

                if (savedData) setFormData(JSON.parse(savedData));
                if (savedSlot) setSelectedSlot(JSON.parse(savedSlot));

                setIsOpen(true);
                setStep(3);
                setIsCanceledReturn(true);

                // Clear state from URL
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            }
        };

        checkCanceled();
    }, [searchParams, psychologistId]);

    // --- Fetch Slots ---
    useEffect(() => {
        if (isOpen && step === 2) {
            const fetchSlots = async () => {
                const start = new Date(selectedDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(selectedDate);
                end.setHours(23, 59, 59, 999);

                const slots = await getAvailabilitySlots(psychologistId, start, end);
                setAvailableSlots(slots);
            };
            fetchSlots();
        }
    }, [selectedDate, isOpen, step, psychologistId]);

    // --- Actions ---

    const handleNextStep = async () => {
        if (step === 1) {
            // Unauthenticated Flow
            if (!currentUser) {
                if (!formData.name || !formData.email || !formData.password) {
                    toast.error("Por favor completa todos los campos.");
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
                        const { error } = await supabase.auth.signUp({
                            email: formData.email,
                            password: formData.password,
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
                        }
                    }
                } catch (err) {
                    console.error("User check error:", err);
                } finally {
                    setIsLoading(false);
                }
            }
            setStep(2);

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

    const handleStripePayment = async () => {
        if (!selectedSlot) return;
        setIsLoading(true);

        try {
            const finalPriceCalc = appliedDiscount
                ? price * (1 - appliedDiscount.percent / 100)
                : price;

            // Determine Name to save
            const anonymousId = Math.random().toString(36).substring(2, 8).toUpperCase();
            const patientName = isAnonymous ? `Usuario-${anonymousId}` : formData.name;

            // 1. Create Pending Appointment
            const result = await createPendingAppointment({
                patientName: patientName,
                patientEmail: formData.email,
                psychologistId,
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

            // 2. Create Stripe Checkout Session
            const returnUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : undefined;

            // Save state for recovery
            localStorage.setItem("booking_form_data", JSON.stringify(formData));
            localStorage.setItem("booking_selected_slot", JSON.stringify(selectedSlot));
            localStorage.setItem("last_psych_id", psychologistId);

            const stripeResult = await createCheckoutSession(result.appointmentId, returnUrl);

            if (stripeResult.error || !stripeResult.url) {
                toast.error(stripeResult.error || "Error al conectar con Stripe");
                setIsLoading(false);
                return;
            }

            // 3. Redirect to Stripe
            window.location.href = stripeResult.url;

        } catch (error) {
            console.error("Stripe redirect error:", error);
            toast.error("Error al iniciar el pago");
            setIsLoading(false);
        }
    };

    // --- Helpers ---
    const finalPrice = appliedDiscount ? price * (1 - appliedDiscount.percent / 100) : price;

    const changeDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + days);

        // Enforce 24h rule
        const tomorrow = getTomorrow();
        tomorrow.setHours(0, 0, 0, 0);

        const checkDate = new Date(newDate);
        checkDate.setHours(0, 0, 0, 0);

        if (checkDate < tomorrow) return;

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
            <DialogContent className="sm:max-w-[500px] p-0 bg-[#FDFCFB] overflow-hidden rounded-3xl border-none shadow-2xl">

                {/* Header */}
                <div className="bg-[#A68363] p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <DialogTitle className="text-2xl font-black relative z-10">
                        {step === 4 ? "¡Reserva Confirmada!" : `Reservar con ${psychologistName}`}
                    </DialogTitle>
                    <p className="text-white/80 text-sm mt-1 relative z-10 font-medium">
                        {step === 1 && (currentUser ? "Confirma tus datos" : "Crea tu cuenta")}
                        {step === 2 && "Selecciona un horario"}
                        {step === 3 && "Pago y Confirmación"}
                    </p>
                </div>

                <div className="p-6">
                    <AnimatePresence mode="wait">

                        {/* STEP 1: CONTACT INFO / AUTH */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                {currentUser ? (
                                    // LOGGED IN VIEW
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-[#A68363] flex items-center justify-center text-white font-bold">
                                                {currentUser.fullName?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#4A3C31]">{currentUser.fullName}</p>
                                                <p className="text-xs text-gray-400">{currentUser.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-2">
                                                {isAnonymous ? <EyeOff className="h-4 w-4 text-[#A68363]" /> : <Eye className="h-4 w-4 text-gray-400" />}
                                                <div>
                                                    <p className="text-sm font-bold text-[#4A3C31]">Modo Anónimo</p>
                                                    <p className="text-[10px] text-gray-400">Ocultar mi nombre real al especialista</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={isAnonymous}
                                                onCheckedChange={setIsAnonymous}
                                                className="data-[state=checked]:bg-[#A68363]"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    // GUEST / REGISTER VIEW
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[#A68363] font-bold text-xs uppercase tracking-wider">Nombre Completo</Label>
                                            <Input
                                                placeholder="Ej. Juan Pérez"
                                                className="rounded-xl border-gray-200 focus:border-[#A68363] h-12"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[#A68363] font-bold text-xs uppercase tracking-wider">Correo Electrónico</Label>
                                            <Input
                                                type="email"
                                                placeholder="juan@ejemplo.com"
                                                className="rounded-xl border-gray-200 focus:border-[#A68363] h-12"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[#A68363] font-bold text-xs uppercase tracking-wider">Contraseña</Label>
                                            <Input
                                                type="password"
                                                placeholder="******"
                                                className="rounded-xl border-gray-200 focus:border-[#A68363] h-12"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                            <p className="text-[10px] text-gray-400">Se creará una cuenta para que puedas gestionar tus citas.</p>
                                        </div>

                                        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 mt-4">
                                            <div className="flex items-center gap-2">
                                                <EyeOff className="h-4 w-4 text-[#A68363]" />
                                                <div>
                                                    <p className="text-sm font-bold text-[#4A3C31]">Modo Anónimo</p>
                                                    <p className="text-[10px] text-gray-400">Ocultar mi nombre real al especialista</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={isAnonymous}
                                                onCheckedChange={setIsAnonymous}
                                                className="data-[state=checked]:bg-[#A68363]"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Discount Code Input (Moved from Step 3) */}
                                <div className="space-y-2 pt-2 border-t border-gray-100 mt-2">
                                    <Label className="text-[#A68363] font-bold text-[10px] uppercase tracking-wider">¿Tienes un código de descuento?</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="ej. PRIMERA25"
                                            value={discountCode}
                                            onChange={(e) => setDiscountCode(e.target.value)}
                                            className="rounded-xl border-gray-200 focus:border-[#A68363] h-10 text-sm"
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleApplyDiscount}
                                            className="bg-[#4A3C31] text-white rounded-xl px-4 h-10 text-xs font-bold shadow-md"
                                        >
                                            Aplicar
                                        </Button>
                                    </div>
                                    {appliedDiscount && (
                                        <p className="text-green-600 text-[10px] font-black uppercase flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Código {appliedDiscount.code} aplicado (-{appliedDiscount.percent}%)
                                        </p>
                                    )}
                                    {validationError && (
                                        <p className="text-red-500 text-[10px] font-bold flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {validationError}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    onClick={handleNextStep}
                                    disabled={isLoading}
                                    className="w-full mt-4 bg-[#4A3C31] hover:bg-[#3A2E26] text-white rounded-xl h-12 font-bold shadow-lg"
                                >
                                    {isLoading ? "Creando cuenta..." : "Continuar"}
                                </Button>
                            </motion.div>
                        )}

                        {/* STEP 2: CALENDAR & SLOTS */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <Button variant="ghost" size="icon" onClick={() => changeDate(-1)}><ChevronLeft className="h-4 w-4 text-gray-400" /></Button>
                                    <div className="text-center">
                                        <p className="font-black text-[#4A3C31] uppercase text-sm">
                                            {format(selectedDate, "EEEE", { locale: es })}
                                        </p>
                                        <p className="text-xs text-gray-500 font-bold">
                                            {format(selectedDate, "d 'de' MMMM", { locale: es })}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => changeDate(1)}><ChevronRight className="h-4 w-4 text-gray-400" /></Button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                    {availableSlots.length === 0 ? (
                                        <p className="col-span-2 text-center text-gray-400 text-sm py-8 font-medium">No hay disponibilidad para este día.</p>
                                    ) : (availableSlots.map((slot) => (
                                        <button
                                            key={slot.id}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`p-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${selectedSlot?.id === slot.id
                                                ? "bg-[#A68363] text-white border-[#A68363] shadow-md transform scale-[1.02]"
                                                : "bg-white border-gray-100 text-gray-600 hover:border-[#A68363]/50 hover:bg-[#A68363]/5 hover:text-[#A68363]"
                                                }`}
                                        >
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(slot.startTime), "HH:mm")}
                                        </button>
                                    )))}
                                </div>

                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl h-12 font-bold border-gray-200">Atrás</Button>
                                    <Button
                                        onClick={() => setStep(3)}
                                        disabled={!selectedSlot}
                                        className="flex-1 bg-[#4A3C31] hover:bg-[#3A2E26] text-white rounded-xl h-12 font-bold disabled:opacity-50 shadow-lg"
                                    >
                                        Continuar al Pago →
                                    </Button>
                                </div>
                            </motion.div>
                        )}


                        {/* STEP 3: PAYMENT SUMMARY & REDIRECT */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                {isCanceledReturn && (
                                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-black text-amber-900">Has cancelado el pago</p>
                                            <p className="text-xs text-amber-700">Tus datos y el horario siguen reservados por unos minutos. Si quieres proceder, pulsa el botón de abajo.</p>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-4 mb-6">
                                    <div className="bg-gray-50 p-5 rounded-[1.5rem] space-y-3 border border-gray-100">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 font-bold">Sesión con {psychologistName}</span>
                                            <span className="font-bold text-[#4A3C31]">{price.toFixed(2)}€</span>
                                        </div>
                                        {selectedSlot && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 font-bold">Fecha y Hora</span>
                                                <span className="font-bold text-[#4A3C31]">{format(new Date(selectedSlot.startTime), "d 'de' MMMM, HH:mm", { locale: es })}</span>
                                            </div>
                                        )}
                                        {appliedDiscount && (
                                            <div className="flex justify-between items-center text-sm text-green-700 bg-green-50 p-3 rounded-xl border border-green-100">
                                                <span className="font-bold flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Cupón {appliedDiscount.code}
                                                </span>
                                                <span className="font-bold">-{appliedDiscount.percent}%</span>
                                            </div>
                                        )}
                                        <div className="border-t border-gray-200/50 pt-4 flex justify-between items-center">
                                            <span className="font-black text-[#4A3C31] uppercase tracking-wider text-xs">Total</span>
                                            <span className="font-black text-[#A68363] text-3xl">{finalPrice.toFixed(2)}€</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                                        <Lock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-blue-700">
                                            Serás redirigido a la pasarela segura de <span className="font-bold">Stripe</span> para completar tu pago.
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-xl h-12 font-bold border-gray-200">Atrás</Button>
                                        <Button
                                            onClick={handleStripePayment}
                                            disabled={isLoading}
                                            className="flex-1 bg-[#A68363] hover:bg-[#8C6B4D] text-white rounded-xl h-12 font-bold shadow-lg"
                                        >
                                            {isLoading ? "Cargando..." : `Pagar con Stripe →`}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4: SUCCESS */}
                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8 space-y-4"
                            >
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-black text-[#4A3C31] tracking-tight">¡Cita Reservada!</h3>
                                <p className="text-gray-500 max-w-[280px] mx-auto text-sm font-medium leading-relaxed">
                                    Hemos enviado los detalles de tu cita con {psychologistName} a <span className="text-[#4A3C31] font-bold">{formData.email}</span>.
                                </p>
                                <Button
                                    onClick={() => {
                                        setIsOpen(false);
                                        router.push('/patient/dashboard');
                                    }}
                                    className="mt-8 bg-[#A68363] hover:bg-[#8C6B4D] text-white rounded-xl font-bold px-10 h-12 shadow-lg"
                                >
                                    Ver mi Dashboard
                                </Button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
