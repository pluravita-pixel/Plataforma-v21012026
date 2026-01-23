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
    Lock
} from "lucide-react";
import Link from "next/link";
import { createAvailabilitySlot, deleteAvailabilitySlot, saveSchedule } from "@/app/actions/booking";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
    psychologistId
}: {
    initialAppointments: Appointment[];
    initialSlots: Slot[];
    psychologistId: string;
}) {
    const router = useRouter();
    const [view, setView] = useState("Semanas");
    const [isEditingAvailability, setIsEditingAvailability] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Batch Saving Logic
    const [tempSlots, setTempSlots] = useState<Slot[]>(initialSlots);
    const [originalSlots, setOriginalSlots] = useState<Slot[]>(initialSlots);

    // Sync when not editing? Or just on load? 
    // Usually standard is to sync on prop change if not dirty.
    // For now we assume initialSlots comes from server.

    // On Enter Edit Mode
    const toggleEditMode = async () => {
        if (isEditingAvailability) {
            // Save Changes
            if (JSON.stringify(tempSlots) !== JSON.stringify(originalSlots)) {
                // Call bulk update
                const result = await saveSchedule(psychologistId, tempSlots);
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
        newDate.setDate(currentDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const goToNext = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 7);
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

    const gridCols = view === "Día" ? "grid-cols-[auto_1fr]" : "grid-cols-[auto_repeat(7,1fr)]";

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

                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex bg-[#F9F9F9] rounded-xl p-1">
                        {["Mes", "Semanas", "Día"].map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${view === v
                                    ? "bg-white text-[#4A3C31] shadow-md transform scale-105"
                                    : "text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>

                    <Button
                        onClick={toggleEditMode}
                        className={`rounded-xl px-6 h-11 font-bold text-sm transition-all duration-300 flex items-center gap-2 ${isEditingAvailability
                            ? "bg-[#4A3C31] text-white hover:bg-[#2C241D] shadow-lg shadow-[#4A3C31]/20"
                            : "bg-white text-[#4A3C31] border border-gray-200 hover:bg-[#F9F9F9]"
                            }`}
                    >
                        {isEditingAvailability ? (
                            <>
                                <CheckUser className="h-4 w-4" />
                                Guardar Cambios
                            </>
                        ) : (
                            <>
                                <Settings className="h-4 w-4" />
                                Editar Horario
                            </>
                        )}
                    </Button>
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
                    <div className="flex items-center gap-6">
                        <div className="flex gap-2 bg-[#F9F9F9] rounded-xl p-1">
                            <button onClick={goToPrevious} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 transition-all hover:text-[#4A3C31]">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button onClick={goToNext} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 transition-all hover:text-[#4A3C31]">
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                        <h2 className="text-2xl font-black text-[#4A3C31] capitalize tracking-tight">
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
                    <div className={`grid ${view === 'Día' ? 'grid-cols-[auto_1fr]' : 'grid-cols-[auto_repeat(7,1fr)]'} divide-x divide-gray-200 min-w-[800px]`}>

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
                                <div className="p-5 text-center border-b border-gray-200 sticky top-0 z-10 bg-white/95 backdrop-blur-sm">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A68363] mb-1.5">{d.day}</p>
                                    <div className={`w-10 h-10 mx-auto flex items-center justify-center rounded-full text-lg font-black transition-all ${d.fullDate.toDateString() === new Date().toDateString()
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
                                                {appointment && (
                                                    <Link
                                                        href={`/psychologist/appointments/${appointment.id}`}
                                                        className={`w-full h-full bg-white border-l-[3px] rounded-r-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all p-3 flex flex-col justify-center relative z-20 group/card ${appointment.status === 'cancelled'
                                                            ? "border-red-500 bg-red-50"
                                                            : "border-[#A68363]"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className={`p-1 rounded-md ${appointment.status === 'cancelled'
                                                                ? "bg-red-100"
                                                                : "bg-[#A68363]/10"
                                                                }`}>
                                                                <Clock className={`h-3 w-3 ${appointment.status === 'cancelled' ? "text-red-500" : "text-[#A68363]"
                                                                    }`} />
                                                            </div>
                                                            <span className={`text-[10px] font-black uppercase tracking-wider ${appointment.status === 'cancelled' ? "text-red-500" : "text-[#A68363]"
                                                                }`}>
                                                                {appointment.status === 'cancelled' ? "Cancelada" : "Confirmada"}
                                                            </span>
                                                        </div>
                                                        <p className={`text-xs font-bold truncate ml-1 ${appointment.status === 'cancelled' ? "text-red-700" : "text-[#4A3C31]"
                                                            }`}>{appointment.patientName}</p>
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
        </div>
    );
}
