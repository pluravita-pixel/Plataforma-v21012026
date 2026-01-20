import { getCurrentUser } from "@/app/actions/auth";
import { getPsychologistStatus, getWithdrawals } from "@/app/actions/psychologists";
import { redirect } from "next/navigation";
import { BalanceClient } from "./BalanceClient";

export default async function BalancePage() {
    const user = await getCurrentUser();

    if (!user || user.role !== 'psychologist') {
        redirect("/login");
    }

    const psychologist = await getPsychologistStatus(user.id);

    if (!psychologist) {
        return (
            <div className="p-8 text-center bg-white rounded-3xl border border-gray-100">
                <p className="text-gray-500">No se encontraron datos de coach para este usuario.</p>
            </div>
        );
    }

    const withdrawals = await getWithdrawals(psychologist.id);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Saldo y Pagos</h1>
                <p className="text-gray-500 mt-1">Gestiona tus ingresos y configura tus datos bancarios.</p>
            </div>

            <BalanceClient
                psychologist={{
                    id: psychologist.id,
                    userId: psychologist.userId,
                    balance: psychologist.balance,
                    iban: psychologist.iban,
                    payoutName: psychologist.payoutName,
                }}
                withdrawals={withdrawals}
            />
        </div>
    );
}
