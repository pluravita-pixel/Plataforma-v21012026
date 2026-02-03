export const dynamic = 'force-dynamic';

import { getAllPsychologists } from "@/app/actions/admin";
import { CoachesManagementClient } from "./CoachesManagementClient";

export default async function CoachesPage() {
    // We reuse the existing admin action to fetch psychologists
    const psychologistsRaw = await getAllPsychologists();

    // Map to the format needed by the client component
    const coaches = psychologistsRaw.map(p => ({
        id: p.id,
        userId: p.userId,
        fullName: p.fullName,
        email: p.email,
        specialty: p.specialty,
        image: p.image,
        totalSessions: p.totalSessions,
        completedSessions: p.completedSessions,
        totalPatients: p.totalPatients,
        activePatients: p.activePatients,
        balance: p.balance,
        rating: p.rating,
        createdAt: p.createdAt,
    }));

    return <CoachesManagementClient coaches={coaches} />;
}
