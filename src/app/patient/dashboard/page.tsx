import { getPatientDashboardData } from "@/app/actions/patient";
import PatientDashboardClient from "./PatientDashboardClient";
import { redirect } from "next/navigation";

export default async function PatientDashboard() {
    const data = await getPatientDashboardData();

    if (!data) {
        redirect("/login");
    }

    return <PatientDashboardClient initialData={data} />;
}
