'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F9F5F0] text-center">
            <div className="max-w-md w-full glass-card p-12 rounded-[2.5rem] space-y-6">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">⚠️</span>
                </div>
                <h2 className="text-2xl font-bold text-[#4A3C31]">¡Ups! Algo ha salido mal</h2>
                <p className="text-gray-500 font-medium leading-relaxed">
                    Ha ocurrido un error inesperado. Estamos trabajando para solucionarlo.
                </p>
                <div className="pt-4 flex flex-col gap-3">
                    <Button
                        onClick={() => reset()}
                        className="w-full bg-[#A68363] hover:bg-[#8B6B4E] text-white font-bold py-6 rounded-2xl transition-all shadow-lg shadow-[#A68363]/20"
                    >
                        Reintentar
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => window.location.href = '/'}
                        className="w-full text-gray-500 font-bold"
                    >
                        Volver al inicio
                    </Button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-red-50 rounded-xl overflow-auto text-left">
                        <p className="text-xs font-mono text-red-800 break-all">{error.message}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
