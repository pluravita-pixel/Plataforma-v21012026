"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, Check, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { markTestAsCompleted } from "@/app/actions/auth"

const STEPS = [
    {
        id: "therapy_type",
        title: "¿Cómo te gustaría que fuera este camino?",
        options: [
            { id: "individual", label: "Para mí (individual)" },
            { id: "couple", label: "Con mi pareja" }
        ],
        type: "single"
    },
    {
        id: "first_time",
        title: "¿Ya habías probado algo parecido antes?",
        options: [
            { id: "yes", label: "Es mi primera vez" },
            { id: "no", label: "Sí, ya he tenido procesos similares" }
        ],
        type: "single"
    },
    {
        id: "gender",
        title: "¿Con qué género te identificas?",
        options: [
            { id: "woman", label: "Mujer" },
            { id: "man", label: "Hombre" },
            { id: "nonbinary", label: "No binario" },
            { id: "other", label: "Otro" },
            { id: "prefer_not_to_say", label: "Prefiero no decir" }
        ],
        type: "single"
    },
    {
        id: "practical_exercises",
        title: "¿Te gustaría recibir ideas para aplicar en tu día a día?",
        options: [
            { id: "totally", label: "¡Sí! Me encanta pasar a la acción" },
            { id: "no", label: "Prefiero solo conversar por ahora" },
            { id: "maybe", label: "Lo vemos según avance el proceso" }
        ],
        type: "single"
    },
    {
        id: "focus_area",
        title: "¿En qué te gustaría enfocarte más?",
        options: [
            { id: "goals", label: "Mis metas y crecimiento personal" },
            { id: "balance", label: "Mi equilibrio mental y emocional" },
            { id: "relationships", label: "Mis relaciones con los demás" },
            { id: "self_knowledge", label: "Simplemente conocerme mejor" }
        ],
        type: "single"
    },
    {
        id: "therapist_gender",
        title: "¿Prefieres que tu coach sea hombre o mujer?",
        options: [
            { id: "woman", label: "Mujer" },
            { id: "man", label: "Hombre" },
            { id: "indifferent", label: "Me es totalmente igual" }
        ],
        type: "single"
    },
    {
        id: "age",
        title: "¿Qué edad tienes?",
        type: "select",
        placeholder: "Elige tu edad"
    }
]

export default function AffinityTestPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<Record<string, any>>({})
    const [isSearching, setIsSearching] = useState(false)

    useEffect(() => {
        const checkTestStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('users')
                    .select('has_completed_affinity')
                    .eq('id', user.id)
                    .single()

                if (data?.has_completed_affinity) {
                    router.push("/patient/search")
                }
            }
        }
        checkTestStatus()
    }, [router])

    const step = STEPS[currentStep]
    const progress = ((currentStep + 1) / STEPS.length) * 100

    const finishTest = async () => {
        setIsSearching(true)

        try {
            await markTestAsCompleted()
        } catch (error) {
            console.error("Error updating test status:", error)
        }

        setTimeout(() => {
            router.push("/affinity-results")
        }, 3500)
    }

    const handleOptionSelect = (optionId: string) => {
        if (step.id === "age") {
            const nextAnswers = { ...answers, [step.id]: optionId }
            setAnswers(nextAnswers)
            if (currentStep < STEPS.length - 1) {
                setTimeout(() => setCurrentStep(currentStep + 1), 350)
            } else {
                finishTest()
            }
            return
        }

        if (step.type === "single") {
            const nextAnswers = { ...answers, [step.id]: optionId }
            setAnswers(nextAnswers)

            if (currentStep < STEPS.length - 1) {
                setTimeout(() => setCurrentStep(currentStep + 1), 350)
            } else {
                finishTest()
            }
        } else {
            // Multiple select
            const currentAnswers = answers[step.id] || []
            let nextAnswersList
            if (currentAnswers.includes(optionId)) {
                nextAnswersList = currentAnswers.filter((id: string) => id !== optionId)
            } else {
                if (currentAnswers.length < (step.max || 1)) {
                    nextAnswersList = [...currentAnswers, optionId]
                } else {
                    return
                }
            }
            setAnswers({ ...answers, [step.id]: nextAnswersList })
        }
    }

    const handleContinue = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            finishTest()
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        } else {
            router.back()
        }
    }

    const ages = Array.from({ length: 82 }, (_, i) => i + 18) // 18 to 99

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col items-center bg-[#F9F5F0] px-4">
            <title>Test de Afinidad | pluravita</title>
            <meta name="description" content="Encuentra a tu coach ideal con nuestro test de afinidad." />

            {/* Background */}
            <div className="absolute inset-0 z-0 bg-[#F9F5F0]">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-white/40 to-[#F9F5F0]" />
            </div>

            <AnimatePresence mode="wait">
                {!isSearching ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-2xl z-10 flex flex-col items-center"
                    >
                        {/* Header */}
                        <div className="w-full text-center pt-16">
                            <div className="flex items-center justify-center mb-6">
                                <div className="relative w-64 h-16 overflow-hidden flex items-center justify-center">
                                    <Image
                                        src="/logo.png"
                                        alt="pluravita Logo"
                                        width={500}
                                        height={500}
                                        className="h-44 w-auto object-contain mix-blend-multiply brightness-105"
                                        priority
                                    />
                                </div>
                            </div>
                            <h1 className="text-xl font-medium text-[#4A3C31] mb-8">
                                Encuentra a tu coach ideal
                            </h1>

                            {/* Progress Bar Container */}
                            <div className="w-full max-w-xl mx-auto mb-12">
                                <div className="w-full h-1.5 bg-[#F2EDE7] rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-[#A68363]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>

                            {currentStep === 0 && (
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed font-medium"
                                >
                                    Las siguientes preguntas están diseñadas para encontrar a tu coach ideal según tus necesidades y preferencias personales.
                                </motion.p>
                            )}
                        </div>

                        {/* Form Body */}
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="w-full bg-white rounded-[24px] border border-[#F2EDE7] p-8 sm:p-10 shadow-lg shadow-gray-200/20 mb-20"
                        >
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-[#4A3C31] mb-2">
                                        {step.title}
                                    </h2>
                                    {step.subtitle && (
                                        <p className="text-sm text-gray-500 font-medium">{step.subtitle}</p>
                                    )}
                                </div>

                                <div className={step.type === "multiple" ? "flex flex-wrap gap-2.5 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar" : "space-y-3"}>
                                    {step.type === "select" ? (
                                        <div className="relative">
                                            <select
                                                className="w-full appearance-none bg-[#F2EDE7]/50 border border-[#F2EDE7] rounded-[16px] px-6 py-5 text-[#4A3C31] font-medium focus:outline-none focus:border-[#A68363] transition-all cursor-pointer"
                                                onChange={(e) => handleOptionSelect(e.target.value)}
                                                value={answers[step.id] || ""}
                                            >
                                                <option value="" disabled>{step.placeholder}</option>
                                                {ages.map((age) => (
                                                    <option key={age} value={age}>{age}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </div>
                                    ) : (
                                        step.options && step.options.map((option) => {
                                            const isSelected = step.type === "single"
                                                ? answers[step.id] === option.id
                                                : (answers[step.id] || []).includes(option.id)

                                            if (step.type === "single") {
                                                return (
                                                    <button
                                                        key={option.id}
                                                        onClick={() => handleOptionSelect(option.id)}
                                                        className={`
                                                            w-full text-left px-6 py-5 rounded-[16px] border transition-all flex items-center justify-between group
                                                            ${isSelected
                                                                ? "border-[#A68363] bg-[#F2EDE7] text-[#A68363]"
                                                                : "border-[#F2EDE7] bg-[#F2EDE7]/20 hover:border-[#A68363]/40 hover:bg-[#F2EDE7]/50 text-[#6B6B6B]"}
                                                        `}
                                                    >
                                                        <span className="font-bold text-[15px]">{option.label}</span>
                                                        <div className={`
                                                            h-6 w-6 rounded-full border flex items-center justify-center transition-all
                                                            ${isSelected ? "border-[#A68363] bg-[#A68363] text-white" : "border-gray-300 text-transparent"}
                                                        `}>
                                                            <Check className="h-4 w-4 stroke-[3.5px]" />
                                                        </div>
                                                    </button>
                                                )
                                            }

                                            return (
                                                <button
                                                    key={option.id}
                                                    onClick={() => handleOptionSelect(option.id)}
                                                    className={`
                                                        px-5 py-2.5 rounded-full border transition-all text-[14px] font-bold
                                                        ${isSelected
                                                            ? "border-[#A68363] bg-[#F2EDE7] text-[#A68363]"
                                                            : "border-[#F2EDE7] bg-[#F2EDE7]/50 hover:border-[#A68363]/40 hover:bg-[#F2EDE7]/80 text-[#6B6B6B]"}
                                                    `}
                                                >
                                                    {option.label}
                                                </button>
                                            )
                                        })
                                    )}
                                </div>

                                <div className="flex flex-col items-center gap-6">
                                    {step.type === "multiple" && (
                                        <Button
                                            onClick={handleContinue}
                                            disabled={!(answers[step.id]?.length > 0)}
                                            className="w-full sm:w-auto min-w-[180px] bg-[#A68363] hover:opacity-90 text-white font-bold py-6 rounded-xl shadow-lg shadow-gray-200 text-md transition-all active:scale-[0.98]"
                                        >
                                            Continuar
                                        </Button>
                                    )}

                                    <button
                                        onClick={handleBack}
                                        className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Atrás
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                ) : (
                    /* Searching Screen */
                    <motion.div
                        key="searching"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col items-center justify-center z-10 text-center space-y-8 min-h-screen"
                    >
                        <div className="relative flex items-center justify-center">
                            {/* Animated Cards Decoration */}
                            <motion.div
                                className="absolute -left-20 w-24 h-32 bg-white rounded-xl shadow-xl flex flex-col p-4 border border-gray-50"
                                animate={{
                                    x: [-10, 0, -10],
                                    rotate: [-5, -2, -5]
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div className="w-8 h-8 rounded-full bg-orange-100 mb-2" />
                                <div className="space-y-1.5">
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full" />
                                    <div className="h-1.5 w-3/4 bg-gray-100 rounded-full" />
                                </div>
                            </motion.div>

                            <motion.div
                                className="absolute -right-20 w-24 h-32 bg-white rounded-xl shadow-xl flex flex-col p-4 border border-gray-50"
                                animate={{
                                    x: [10, 0, 10],
                                    rotate: [5, 2, 5]
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            >
                                <div className="w-8 h-8 rounded-full bg-pink-100 mb-2" />
                                <div className="space-y-1.5">
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full" />
                                    <div className="h-1.5 w-3/4 bg-gray-100 rounded-full" />
                                </div>
                            </motion.div>

                            <motion.div
                                className="relative w-32 h-44 bg-white rounded-2xl shadow-2xl flex flex-col p-6 border border-blue-50 z-20"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div className="w-12 h-12 rounded-full bg-blue-100 mb-4" />
                                <div className="space-y-2">
                                    <div className="h-2 w-full bg-gray-100 rounded-full" />
                                    <div className="h-2 w-full bg-gray-100 rounded-full" />
                                    <div className="h-2 w-2/3 bg-gray-100 rounded-full" />
                                </div>

                                {/* Magnifying Glass Animation */}
                                <motion.div
                                    className="absolute -top-4 -right-4 w-12 h-12 bg-[#A68363] rounded-full flex items-center justify-center text-white border-4 border-white shadow-lg"
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 10, 0]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                                    </svg>
                                </motion.div>
                            </motion.div>
                        </div>

                        <div className="space-y-3 pt-6">
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-[#4A3C31] font-bold text-lg"
                            >
                                Espera un momento...
                            </motion.p>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="text-gray-500 font-medium text-md"
                            >
                                Estamos buscando a los mejores coaches para ti
                            </motion.p>
                        </div>

                        {/* Pulsing indicator */}
                        <div className="flex gap-2 pt-4">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-2.5 h-2.5 bg-[#A68363] rounded-full"
                                    animate={{
                                        opacity: [0.3, 1, 0.3],
                                        scale: [1, 1.2, 1]
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: i * 0.2
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E5E7EB;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #D1D5DB;
                }
            `}</style>
        </div>
    )
}
