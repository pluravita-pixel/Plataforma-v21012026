"use client";

import { useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    Plus,
    MoreHorizontal,
    Trash2,
    Settings,
    Check as CheckUser,
    Lock,
    Clock3
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createAvailabilitySlot, deleteAvailabilitySlot, saveSchedule, saveRecurringSchedule } from "@/app/actions/booking";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface Appointment {
    id: string;
    date: Date;
    patientName: string;
    status: string;
}

interface Slot {
    id: string;
    startTime: Date;
    endTime: Date;
    isBooked: boolean;
}

export function CalendarClient({
    initialAppointments,
    initialSlots,
    oyenteId
}: {
    initialAppointments: Appointment[];
    initialSlots: Slot[];
    oyenteId: string;
}) {
    const router = useRouter();
    const [view, setView] = useState("Semanas");
    const [isEditingAvailability, setIsEditingAvailability] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Batch Saving Logic
    const [tempSlots, setTempSlots] = useState<Slot[]>(initialSlots);
    const [originalSlots, setOriginalSlots] = useState<Slot[]>(initialSlots);
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Sync when not editing? Or just on load? 
    // Usually standard is to sync on prop change if not dirty.
    // For now we assume initialSlots comes from server.

    // On Enter Edit Mode
    const toggleEditMode = async () => {
        if (isEditingAvailability) {
            // Save Changes
            if (JSON.stringify(tempSlots) !== JSON.stringify(originalSlots)) {
                // Call bulk update
                const result = await saveSchedule(oyenteId, tempSlots);
                if (result.success) {
                    toast.success("Horario guardado correctamente");
                    setOriginalSlots(tempSlots);
                    router.refresh();
                } else {
                    toast.error("Error al guardar horario");
                }
            }
            setIsEditingAvailability(false);
        } else {
            // Enter Edit Mode
            setTempSlots([...initialSlots]);
            setOriginalSlots([...initialSlots]);
            setIsEditingAvailability(true);
        }
    };

    // --- Date Navigation Logic ---
    const goToPrevious = () => {
        const newDate = new Date(currentDate);
        if (view === "Día") {
            newDate.setDate(currentDate.getDate() - 1);
        } else {
            newDate.setDate(currentDate.getDate() - 7);
        }
        setCurrentDate(newDate);
    };

    const goToNext = () => {
        const newDate = new Date(currentDate);
        if (view === "Día") {
            newDate.setDate(currentDate.getDate() + 1);
        } else {
            newDate.setDate(currentDate.getDate() + 7);
        }
        setCurrentDate(newDate);
    };

    // --- Slots Management Logic (Local) ---
    function handleAddSlotLocal(dateStr: string, hour: number) {
        if (!isEditingAvailability) return;

        const targetDate = dates.find(d => d.date === dateStr)?.fullDate;
        if (!targetDate) return;

        const start = new Date(targetDate);
        start.setHours(hour, 0, 0, 0);

        const end = new Date(start);
        end.setHours(hour + 1, 0, 0, 0);

        const newSlot: Slot = {
            id: `temp-${Date.now()}-${Math.random()}`, // Temp ID
            startTime: start,
            endTime: end,
            isBooked: false
        };

        setTempSlots([...tempSlots, newSlot]);
    }

    function handleDeleteSlotLocal(slotId: string, startTime: Date) {
        if (!isEditingAvailability) return;

        // Remove from tempSlots
        setTempSlots(tempSlots.filter(s => s.id !== slotId && s.startTime.getTime() !== startTime.getTime()));
    }

    // --- Recurring Schedule Template Logic ---
    const [template, setTemplate] = useState([
        { dayOfWeek: 1, active: true, start: "09:00", end: "18:00" },
        { dayOfWeek: 2, active: true, start: "09:00", end: "18:00" },
        { dayOfWeek: 3, active: true, start: "09:00", end: "18:00" },
        { dayOfWeek: 4, active: true, start: "09:00", end: "18:00" },
        { dayOfWeek: 5, active: true, start: "09:00", end: "18:00" },
        { dayOfWeek: 6, active: false, start: "10:00", end: "14:00" },
        { dayOfWeek: 0, active: false, start: "10:00", end: "14:00" },
    ]);

    const handleApplyRecurring = async () => {
        setIsGenerating(true);
        const activeDays = template.filter(t => t.active).map(t => {
            const startHour = parseInt(t.start.split(":")[0]);
            const endHour = parseInt(t.end.split(":")[0]);
            const hours = [];
            for (let h = startHour; h < endHour; h++) {
                hours.push(h);
            }
            return { dayOfWeek: t.dayOfWeek, hours };
        });

        const result = await saveRecurringSchedule(oyenteId, activeDays);
        setIsGenerating(false);

        if (result.success) {
            toast.success("Horario recurrente generado para las próximas 4 semanas");
            setIsRecurringModalOpen(false);
            router.refresh();
        } else {
            toast.error(result.error || "Error al generar horario");
        }
    };

    // Determine which slots to show
    const displaySlots = isEditingAvailability ? tempSlots : initialSlots;



    // --- View Grouping ---
    let daysToShow = 5; // Default Week (Mon-Fri)
    if (view === "Mes") daysToShow = 30; // Simply show 30 days for now, vertical scrolling might be much? month view usually is a box grid.
    if (view === "Día") daysToShow = 1;
    if (view === "Semanas") daysToShow = 7; // Show full week

    // Adjust start date based on view
    let startOfView = new Date(currentDate);
    if (view === "Semanas") {
        const day = currentDate.getDay();
        const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // Monday
        startOfView.setDate(diff);
    } else if (view === "Mes") {
        // Start from 1st of month? Or just rolling 30 days?
        // Rolling is easier for the "infinite scroll" style grid.
        // User likely expects standard month view.
        // Given the current grid layout is `flex-col` with `flex-1 overflow-auto`, a horizontal scroll for 30 days is bad.
        // The current layout is `grid-cols-[auto_repeat(5,1fr)]`.
        // For month view, we'd need `grid-cols-[auto_repeat(7,1fr)]` and multiple rows?
        // The current implementation is a single row of headers and time slots.
        // Supporting a real "Month View" (box calendar) requires significant UI change.
        // Let's stick to "Rolling Days" for now but just change the count if `view === 'Mes'` is effectively meaningless in this linear layout.
        // The request "que el calendario cambie la vista" implies they expect it to work.
        // Let's implement Day and Week (7 days) properly.
        // For Month, maybe we just show 2 weeks? Or ignore?
        // Let's try to support 7 days for "Semana" and 1 for "Día".
    } else {
        // Day view
        startOfView = new Date(currentDate);
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const gridCols = view === "Día" ? "grid-cols-[auto_1fr]" : "grid-cols-[auto_1fr] md:grid-cols-[auto_repeat(7,1fr)]";

    const dates = Array.from({ length: view === "Día" ? 1 : 7 }).map((_, i) => {
        const d = new Date(startOfView);
        d.setDate(startOfView.getDate() + i);
        return {
            day: d.toLocaleDateString('es-ES', { weekday: 'short' }),
            date: d.getDate().toString(),
            fullDate: d,
        };
    });

    // Generate grid hours (e.g., 9:00 to 18:00)
    const hours = Array.from({ length: 11 }).map((_, i) => i + 8); // 8:00 to 19:00

    return (
        <div className="space-y-6 h-full flex flex-col font-sans">
            {/* Top Bar */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#4A3C31] tracking-tight">
                        {isEditingAvailability ? "Gestionar Disponibilidad" : "Calendario"}
                    </h1>
                    <p className="text-[#8C8C8C] mt-2 font-medium">
                        {isEditingAvailability
                            ? "Selecciona las franjas horarias que deseas habilitar."
                            : "Tu agenda semanal de sesiones."}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 md:gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex bg-[#F9F9F9] rounded-xl p-1 overflow-x-auto">
                        {["Semanas", "Día"].map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-3 md:px-5 py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all duration-300 whitespace-nowrap ${view === v
                                    ? "bg-white text-[#4A3C31] shadow-md transform scale-105"
                                    : "text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-8 bg-gray-200 hidden md:block"></div>

                    <div className="flex gap-2">
                        <Button
                            onClick={() => setIsRecurringModalOpen(true)}
                            variant="outline"
                            className="rounded-xl px-4 h-11 font-bold text-sm border-dashed border-[#A68363] text-[#A68363] hover:bg-[#A68363]/5"
                        >
                            <CalendarIcon className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Horario Recurrente</span>
                        </Button>

                        <Button
                            onClick={toggleEditMode}
                            className={`rounded-xl px-4 md:px-6 h-11 font-bold text-sm transition-all duration-300 flex items-center gap-2 ${isEditingAvailability
                                ? "bg-[#4A3C31] text-white hover:bg-[#2C241D] shadow-lg shadow-[#4A3C31]/20"
                                : "bg-white text-[#4A3C31] border border-gray-200 hover:bg-[#F9F9F9]"
                                }`}
                        >
                            {isEditingAvailability ? (
                                <>
                                    <CheckUser className="h-4 w-4" />
                                    <span className="hidden sm:inline">Guardar Cambios</span>
                                    <span className="sm:hidden">Guardar</span>
                                </>
                            ) : (
                                <>
                                    <Settings className="h-4 w-4" />
                                    <span className="hidden sm:inline">Editar Horario</span>
                                    <span className="sm:hidden">Editar</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Calendar Card */}
            <div className={`bg-white rounded-[2.5rem] border transition-all duration-500 flex-1 flex flex-col overflow-hidden relative ${isEditingAvailability
                ? "border-[#A68363]/50 shadow-2xl shadow-[#A68363]/10"
                : "border-gray-100 shadow-xl shadow-gray-200/50"
                }`}>

                {/* Decoration Gradient (Top) */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#A68363] via-[#D4B99F] to-[#A68363] opacity-20"></div>

                {/* Calendar Controls */}
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                        <div className="flex gap-2 bg-[#F9F9F9] rounded-xl p-1 w-fit">
                            <button onClick={goToPrevious} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 transition-all hover:text-[#4A3C31]">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button onClick={goToNext} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 transition-all hover:text-[#4A3C31]">
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-[#4A3C31] capitalize tracking-tight">
                            {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                        </h2>
                    </div>

                    {isEditingAvailability && (
                        <div className="px-4 py-2 bg-amber-50 text-[#A68363] text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-2 animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-[#A68363]" />
                            Modo Edición
                        </div>
                    )}
                </div>

                {/* Scrollable Grid */}
                <div className="flex-1 overflow-auto bg-[#FFFFFF]"> {/* Main bg white */}
                    <div className={`grid ${gridCols} divide-x divide-gray-200 ${view === 'Día' ? '' : 'min-w-[800px] md:min-w-0'}`}>

                        {/* Time Column */}
                        <div className="pt-16 pb-4 flex flex-col items-center gap-[60px] bg-[#FAFAFA] border-r border-gray-200 w-20">
                            {hours.map(h => (
                                <span key={h} className="text-[11px] font-bold text-gray-400 h-5 flex items-center">
                                    {h}:00
                                </span>
                            ))}
                        </div>

                        {/* Days Columns */}
                        {dates.map((d, i) => (
                            <div key={i} className="flex flex-col relative group/col hover:bg-[#FAFAFA]/50 transition-colors">
                                {/* Day Header */}
                                <div className="p-3 md:p-5 text-center border-b border-gray-200 sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
                                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#A68363] mb-1.5">{d.day}</p>
                                    <div className={`w-8 h-8 md:w-10 md:h-10 mx-auto flex items-center justify-center rounded-full text-sm md:text-lg font-black transition-all ${d.fullDate.toDateString() === new Date().toDateString()
                                        ? "bg-[#4A3C31] text-white shadow-lg shadow-[#4A3C31]/30"
                                        : "text-[#4A3C31]"
                                        }`}>
                                        {d.date}
                                    </div>
                                </div>

                                {/* Hourly Slots */}
                                <div className="flex-1 relative py-2">
                                    {hours.map(h => {
                                        // Slot Logic calculation
                                        const currentSlotTime = new Date(d.fullDate);
                                        currentSlotTime.setHours(h, 0, 0, 0);

                                        const appointment = initialAppointments.find(app =>
                                            new Date(app.date).getTime() === currentSlotTime.getTime()
                                        );
                                        const slot = displaySlots.find(s =>
                                            new Date(s.startTime).getTime() === currentSlotTime.getTime()
                                        );

                                        return (
                                            <div
                                                key={h}
                                                className="h-20 border-b border-gray-100 relative p-1.5"
                                            >
                                                {/* 1. APPOINTMENT CARD */}
                                                {appointment && appointment.status !== 'cancelled' && (
                                                    <Link
                                                        href={`/psychologist/appointments/${appointment.id}`}
                                                        className="w-full h-full bg-white border-l-[3px] border-[#A68363] rounded-r-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all p-3 flex flex-col justify-center relative z-20 group/card"
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className="bg-[#A68363]/10 p-1 rounded-md">
                                                                <Clock className="h-3 w-3 text-[#A68363]" />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-wider text-[#A68363]">
                                                                Confirmada
                                                            </span>
                                                        </div>
                                                        <p className="text-xs font-bold truncate ml-1 text-[#4A3C31]">{appointment.patientName}</p>
                                                    </Link>
                                                )}

                                                {/* 2. AVAILABLE SLOT */}
                                                {!appointment && slot && !slot.isBooked && (
                                                    <div className={`w-full h-full rounded-xl flex flex-col justify-center items-center relative transition-all duration-300 border ${isEditingAvailability
                                                        ? "bg-[#F2EDE7] border-[#A68363]/20 group/slot hover:border-[#A68363] hover:shadow-md"
                                                        : "bg-gray-50/50 border-transparent hover:bg-gray-100"
                                                        }`}>
                                                        {isEditingAvailability ? (
                                                            <>
                                                                <span className="text-xs font-bold text-[#A68363]">Disponible</span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteSlotLocal(slot.id, slot.startTime);
                                                                    }}
                                                                    className="absolute -top-2 -right-2 bg-white text-red-500 p-1.5 rounded-full shadow-lg border border-gray-100 opacity-0 group-hover/slot:opacity-100 transition-all hover:bg-red-50 hover:scale-110 z-30"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-1 opacity-40">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* 3. EMPTY STATE (Add) */}
                                                {!appointment && !slot && isEditingAvailability && (
                                                    <button
                                                        onClick={() => handleAddSlotLocal(d.date, h)}
                                                        className="absolute inset-1.5 rounded-xl border-2 border-dashed border-[#E5E5E5] flex flex-col items-center justify-center text-gray-300 hover:text-[#A68363] hover:border-[#A68363] hover:bg-[#A68363]/5 transition-all duration-300 gap-1 group/add"
                                                    >
                                                        <Plus className="h-5 w-5 transition-transform group-hover/add:scale-110" />
                                                        <span className="text-[10px] font-bold opacity-0 group-hover/add:opacity-100 transform translate-y-2 group-hover/add:translate-y-0 transition-all">
                                                            Habilitar
                                                        </span>
                                                    </button>
                                                )}

                                                {/* 4. BLOCKED CUE (View Mode) */}
                                                {!appointment && !slot && !isEditingAvailability && (
                                                    <div className="w-full h-full text-center flex justify-center pt-2 opacity-0 hover:opacity-100 transition-opacity">
                                                        <span className="text-[10px] text-gray-300 font-medium select-none">-</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Recurring Schedule Modal */}
            <Dialog open={isRecurringModalOpen} onOpenChange={setIsRecurringModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-0 border-none shadow-2xl">
                    <div className="bg-[#4A3C31] p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px]"></div>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                                <Clock3 className="h-7 w-7 text-[#A68363]" />
                                Configurar Horario Base
                            </DialogTitle>
                            <DialogDescription className="text-white/60 font-medium">
                                Define tu horario ideal para que se aplique automáticamente a las próximas 4 semanas.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="space-y-4">
                            {template.map((day, idx) => (
                                <div key={idx} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all ${day.active ? 'bg-[#F2EDE7]/30 border-[#A68363]/20' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                        <Switch
                                            checked={day.active}
                                            onCheckedChange={(val) => {
                                                const newTemplate = [...template];
                                                newTemplate[idx].active = val;
                                                setTemplate(newTemplate);
                                            }}
                                        />
                                        <div>
                                            <p className="font-bold text-[#4A3C31] capitalize">
                                                {new Date(2024, 0, day.dayOfWeek === 0 ? 7 : day.dayOfWeek).toLocaleDateString('es-ES', { weekday: 'long' })}
                                            </p>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-[#A68363]">
                                                {day.active ? 'Activo' : 'Inactivo'}
                                            </p>
                                        </div>
                                    </div>

                                    {day.active && (
                                        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                                            <div className="flex flex-col">
                                                <Label className="text-[9px] uppercase font-black text-gray-400 mb-1 ml-1">Inicio</Label>
                                                <Input
                                                    type="time"
                                                    value={day.start}
                                                    onChange={(e) => {
                                                        const newTemplate = [...template];
                                                        newTemplate[idx].start = e.target.value;
                                                        setTemplate(newTemplate);
                                                    }}
                                                    className="h-9 w-28 border-none bg-transparent font-bold text-[#4A3C31] focus-visible:ring-0"
                                                />
                                            </div>
                                            <div className="w-px h-6 bg-gray-100"></div>
                                            <div className="flex flex-col">
                                                <Label className="text-[9px] uppercase font-black text-gray-400 mb-1 ml-1">Fin</Label>
                                                <Input
                                                    type="time"
                                                    value={day.end}
                                                    onChange={(e) => {
                                                        const newTemplate = [...template];
                                                        newTemplate[idx].end = e.target.value;
                                                        setTemplate(newTemplate);
                                                    }}
                                                    className="h-9 w-28 border-none bg-transparent font-bold text-[#4A3C31] focus-visible:ring-0"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                            <Plus className="h-5 w-5 text-amber-600 flex-shrink-0" />
                            <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                <b>Nota:</b> Al aplicar este horario, se generarán nuevos huecos de disponibilidad en los días seleccionados. Esto no borrará las citas que ya tengas confirmadas.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="p-8 bg-gray-50 flex flex-col sm:flex-row gap-3 border-t border-gray-100">
                        <Button
                            variant="outline"
                            onClick={() => setIsRecurringModalOpen(false)}
                            className="rounded-xl h-12 px-8 font-bold order-2 sm:order-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleApplyRecurring}
                            disabled={isGenerating}
                            className="bg-[#4A3C31] hover:bg-black text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-[#4A3C31]/20 order-1 sm:order-2"
                        >
                            {isGenerating ? "Generando..." : "Aplicar Horario"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
