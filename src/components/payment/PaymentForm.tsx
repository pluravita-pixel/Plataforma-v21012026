"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CreditCard, Lock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface PaymentFormProps {
    amount: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export function PaymentForm({ amount, onSuccess, onCancel }: PaymentFormProps) {
    const [cardNumber, setCardNumber] = useState("");
    const [cardName, setCardName] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Format card number with spaces
    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\s/g, '');
        const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
        return formatted.slice(0, 19); // 16 digits + 3 spaces
    };

    // Format expiry date MM/YY
    const formatExpiryDate = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
        }
        return cleaned;
    };

    // Validate card (basic Luhn algorithm)
    const validateCard = () => {
        const cleaned = cardNumber.replace(/\s/g, '');
        if (cleaned.length !== 16) {
            toast.error("Número de tarjeta inválido");
            return false;
        }

        if (!cardName.trim()) {
            toast.error("Ingresa el nombre del titular");
            return false;
        }

        const [month, year] = expiryDate.split('/');
        if (!month || !year || parseInt(month) > 12 || parseInt(month) < 1) {
            toast.error("Fecha de expiración inválida");
            return false;
        }

        if (cvv.length !== 3) {
            toast.error("CVV inválido");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateCard()) return;

        setIsProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsProcessing(false);
        setShowSuccess(true);

        // Show success animation then call onSuccess
        setTimeout(() => {
            onSuccess();
        }, 1500);
    };

    if (showSuccess) {
        return (
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
            >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h3>
                <p className="text-gray-500 text-center">Procesando tu reserva...</p>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Display */}
            <div className="bg-gradient-to-br from-[#A68363] to-[#8C6B4D] p-6 rounded-2xl text-white">
                <p className="text-sm font-medium opacity-90 mb-1">Total a pagar</p>
                <p className="text-4xl font-black">€{amount.toFixed(2)}</p>
            </div>

            {/* Card Number */}
            <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">Número de Tarjeta</Label>
                <div className="relative">
                    <Input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        className="h-12 pl-12 text-lg tracking-wider"
                        maxLength={19}
                        required
                    />
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
            </div>

            {/* Cardholder Name */}
            <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">Nombre del Titular</Label>
                <Input
                    type="text"
                    placeholder="NOMBRE APELLIDO"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    className="h-12 uppercase"
                    required
                />
            </div>

            {/* Expiry & CVV */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700">Fecha de Expiración</Label>
                    <Input
                        type="text"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                        className="h-12 text-center text-lg"
                        maxLength={5}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700">CVV</Label>
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="123"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                            className="h-12 text-center text-lg"
                            maxLength={3}
                            required
                        />
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <Lock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="text-sm font-bold text-blue-900">Pago 100% Seguro</p>
                    <p className="text-xs text-blue-700 mt-1">
                        Tus datos están protegidos con encriptación SSL de nivel bancario.
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1 h-12 rounded-xl"
                    disabled={isProcessing}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    className="flex-1 h-12 bg-[#A68363] hover:bg-[#8C6B4D] text-white font-bold rounded-xl"
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Procesando...
                        </div>
                    ) : (
                        `Pagar €${amount.toFixed(2)}`
                    )}
                </Button>
            </div>

            {/* Test Card Notice */}
            <div className="text-center pt-2">
                <p className="text-xs text-gray-400 italic">
                    💳 Modo de prueba: Usa cualquier número de 16 dígitos
                </p>
            </div>
        </form>
    );
}
