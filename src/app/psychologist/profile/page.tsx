export const dynamic = 'force-dynamic';
import { getCurrentUser } from "@/app/actions/auth";
import { getPsychologistStatus } from "@/app/actions/psychologists";
import { redirect } from "next/navigation";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
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

    return (
        <ProfileClient
            psychologist={{
                id: psychologist.id,
                userId: psychologist.userId,
                fullName: psychologist.fullName,
                description: psychologist.description,
                specialty: psychologist.specialty,
                username: psychologist.username,
                image: psychologist.image,
                price: psychologist.price,
                languages: psychologist.languages,
                tags: psychologist.tags
            }}
        />
    );
}
