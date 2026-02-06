import { getCurrentUser } from "@/app/actions/auth";
import { getOyenteStatus, getWithdrawals } from "@/app/actions/oyentes";
import { redirect } from "next/navigation";
import { BalanceClient } from "./BalanceClient";

export default async function BalancePage() {
    const user = await getCurrentUser();

    if (!user || user.role !== 'oyente') {
        redirect("/login");
    }

    const oyente = await getOyenteStatus(user.id);

    if (!oyente) {
        return (
            <div className="p-8 text-center bg-white rounded-3xl border border-gray-100">
                <p className="text-gray-500">No se encontraron datos de coach para este usuario.</p>
            </div>
        );
    }

    const withdrawals = await getWithdrawals(oyente.id);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Saldo y Pagos</h1>
                <p className="text-gray-500 mt-1">Gestiona tus ingresos y configura tus datos bancarios.</p>
            </div>

            <BalanceClient
                psychologist={{
                    id: oyente.id,
                    userId: oyente.userId,
                    balance: oyente.balance,
                    iban: oyente.iban,
                    payoutName: oyente.payoutName,
                }}
                withdrawals={withdrawals}
            />
        </div>
    );
}
