"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { AffinityInfoModal } from "@/components/affinity-info-modal"
import { usePathname } from "next/navigation"

interface ModalContextType {
    openAffinityModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [isAffinityModalOpen, setIsAffinityModalOpen] = useState(false)
    const pathname = usePathname()

    const openAffinityModal = () => setIsAffinityModalOpen(true)

    // Close all modals when navigating
    useEffect(() => {
        setIsAffinityModalOpen(false)
    }, [pathname])

    return (
        <ModalContext.Provider value={{ openAffinityModal }}>
            {children}
            <AffinityInfoModal
                isOpen={isAffinityModalOpen}
                onOpenChange={setIsAffinityModalOpen}
            />
        </ModalContext.Provider>
    )
}

export function useModals() {
    const context = useContext(ModalContext)
    if (context === undefined) {
        throw new Error("useModals must be used within a ModalProvider")
    }
    return context
}
