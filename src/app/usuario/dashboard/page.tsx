export const dynamic = 'force-dynamic';
import { getUsuarioDashboardData } from "@/app/actions/usuarios";
import UsuarioDashboardClient from "./UsuarioDashboardClient";
import { redirect } from "next/navigation";

export default async function PatientDashboard() {
    const data = await getUsuarioDashboardData();

    if (!data) {
        redirect("/login");
    }

    return <UsuarioDashboardClient initialData={data} />;
}
