"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { AffinityInfoModal } from "@/components/affinity-info-modal"
import { TestCompletedModal } from "@/components/test-completed-modal"
import { usePathname } from "next/navigation"

interface ModalContextType {
    openAffinityModal: () => void;
    openTestCompletedModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [isAffinityModalOpen, setIsAffinityModalOpen] = useState(false)
    const [isTestCompletedModalOpen, setIsTestCompletedModalOpen] = useState(false)
    const pathname = usePathname()

    const openAffinityModal = () => setIsAffinityModalOpen(true)
    const openTestCompletedModal = () => setIsTestCompletedModalOpen(true)

    // Close all modals when navigating
    useEffect(() => {
        setIsAffinityModalOpen(false)
        setIsTestCompletedModalOpen(false)
    }, [pathname])

    return (
        <ModalContext.Provider value={{ openAffinityModal, openTestCompletedModal }}>
            {children}
            <AffinityInfoModal
                isOpen={isAffinityModalOpen}
                onOpenChange={setIsAffinityModalOpen}
            />
            <TestCompletedModal
                isOpen={isTestCompletedModalOpen}
                onOpenChange={setIsTestCompletedModalOpen}
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
