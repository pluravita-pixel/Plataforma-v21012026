import { getCurrentUser } from "@/app/actions/auth";
import { getOyenteStatus } from "@/app/actions/oyentes";
import { redirect } from "next/navigation";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
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

    return (
        <ProfileClient
            psychologist={{
                id: oyente.id,
                userId: oyente.userId,
                fullName: oyente.fullName,
                description: oyente.description,
                specialty: oyente.specialty,
                username: oyente.username,
                image: oyente.image,
                price: oyente.price,
                languages: oyente.languages,
                tags: oyente.tags,
                meetingLink: oyente.meetingLink,
                studies: oyente.studies
            }}
        />
    );
}
