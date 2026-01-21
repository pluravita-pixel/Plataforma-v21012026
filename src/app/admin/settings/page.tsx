import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { SettingsClient } from "./SettingsClient";

export default async function AdminSettingsPage() {
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
        redirect("/login");
    }

    return <SettingsClient currentUser={user} />;
}
