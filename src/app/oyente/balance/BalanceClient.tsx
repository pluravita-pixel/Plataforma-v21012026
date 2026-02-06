"use client";

import { useState } from "react";
import {
    Wallet,
    ArrowDownToLine,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    Info,
    ArrowUpRight
} from "lucide-react";
import { withdrawBalance, updatePsychologistSettings } from "@/app/actions/psychologists";
import { toast } from "sonner";

interface Withdrawal {
    id: string;
    amount: string;
    status: string;
    createdAt: Date;
}

interface BalanceClientProps {
    psychologist: {
        id: string;
        userId: string;
        balance: string | null;
        iban: string | null;
        payoutName: string | null;
    };
    withdrawals: Withdrawal[];
}

export function BalanceClient({ psychologist, withdrawals }: BalanceClientProps) {
    const [balance, setBalance] = useState(Number(psychologist.balance || 0));
    const [iban, setIban] = useState(psychologist.iban || "");
    const [payoutName, setPayoutName] = useState(psychologist.payoutName || "");
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleWithdraw = async () => {
        if (balance < 50) {
            toast.error("El saldo mínimo para retirar es de 50€");
            return;
        }

        setIsWithdrawing(true);
        const result = await withdrawBalance(psychologist.id, balance);
        setIsWithdrawing(false);

        if (result.success) {
            setSuccess(true);
            setBalance(0);
        } else {
            toast.error(result.error || "Error al procesar el retiro");
        }
    };

    const handleSavePayoutDetails = async () => {
        setIsSaving(true);
        try {
            await updatePsychologistSettings(psychologist.userId, {
                iban,
                payoutName
            });
            toast.success("Detalles de cobro actualizados");
        } catch (error) {
            toast.error("Error al guardar los detalles");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Balance Card */}
                <div className="lg:col-span-1">
                    <div className="bg-[#0077FF] p-8 rounded-[2rem] text-white shadow-xl shadow-blue-200 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                    <Wallet className="h-6 w-6" />
                                </div>
                                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold ring-1 ring-white/30">
                                    Saldo Disponible
                                </span>
                            </div>
                            <p className="text-5xl font-black tracking-tighter mb-2">€{balance.toFixed(2)}</p>
                            <p className="text-white/70 text-sm font-medium">Acumulado este mes</p>

                            <button
                                onClick={handleWithdraw}
                                disabled={balance < 50 || isWithdrawing}
                                className="w-full mt-8 bg-white text-[#0077FF] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ArrowDownToLine className="h-5 w-5" />
                                {isWithdrawing ? "Procesando..." : "Retirar Fondos"}
                            </button>
                        </div>

                        {/* Decorative circles */}
                        <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                    </div>

                    {balance < 50 && (
                        <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-3 text-orange-700">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p className="text-xs font-medium">
                                Necesitas al menos <strong>50,00€</strong> para solicitar un retiro.
                            </p>
                        </div>
                    )}
                </div>

                {/* Payout Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-gray-50 rounded-xl">
                                <CreditCard className="h-5 w-5 text-gray-400" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Detalles de Cobro</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">Nombre del titular</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    placeholder="Nombre completo tal como aparece en el banco"
                                    value={payoutName}
                                    onChange={(e) => setPayoutName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">IBAN</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all uppercase"
                                    placeholder="ES00 0000 0000 0000 0000 0000"
                                    value={iban}
                                    onChange={(e) => setIban(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Info className="h-4 w-4" />
                                <p className="text-xs">Los pagos tardan entre 2-3 días laborales.</p>
                            </div>
                            <button
                                onClick={handleSavePayoutDetails}
                                disabled={isSaving}
                                className="bg-gray-900 text-white font-bold px-8 py-3 rounded-xl text-sm hover:bg-gray-800 transition-all disabled:opacity-50"
                            >
                                {isSaving ? "Guardando..." : "Guardar Datos"}
                            </button>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Últimos Retiros</h2>
                        <div className="space-y-4">
                            {withdrawals.length > 0 ? withdrawals.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl shadow-sm">
                                            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">Retiro a cuenta</p>
                                            <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-gray-900">€{Number(tx.amount).toFixed(2)}</p>
                                        <div className="flex items-center justify-end gap-1 mt-1">
                                            <CheckCircle2 className={`h-3 w-3 ${tx.status === 'completed' ? 'text-emerald-500' : 'text-orange-500'}`} />
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${tx.status === 'completed' ? 'text-emerald-600' : 'text-orange-600'}`}>
                                                {tx.status === 'completed' ? 'Completado' : tx.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-400 text-sm italic py-4">No hay retiros registrados.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {success && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2.5rem] p-12 max-w-md w-full text-center shadow-2xl scale-in-center">
                        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle2 className="h-12 w-12" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4">¡Retiro Solicitado!</h2>
                        <p className="text-gray-500 leading-relaxed mb-8">
                            Hemos recibido tu solicitud de retiro. En un plazo de <span className="text-gray-900 font-bold">24 a 48 horas</span> verás reflejado el saldo en tu cuenta bancaria.
                        </p>
                        <button
                            onClick={() => setSuccess(false)}
                            className="w-full bg-[#0077FF] text-white font-bold py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-100"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
