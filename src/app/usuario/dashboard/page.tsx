export const dynamic = 'force-dynamic';
import { getUsuarioDashboardData } from "@/app/actions/usuarios";
import UsuarioDashboardClient from "./UsuarioDashboardClient";
import { redirect } from "next/navigation";

import { Suspense } from "react";

export default async function PatientDashboard() {
    const data = await getUsuarioDashboardData();

    if (!data) {
        redirect("/login");
    }

    return (
        <Suspense fallback={<div className="p-8 animate-pulse text-gray-400">Cargando dashboard...</div>}>
            <UsuarioDashboardClient initialData={data} />
        </Suspense>
    );
}
