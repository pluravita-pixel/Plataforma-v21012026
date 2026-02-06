export const dynamic = 'force-dynamic';

import { getAllOyentes } from "@/app/actions/admin";
import { CoachesManagementClient } from "./OyentesManagementClient";

export default async function OyentesPage() {
    // Map to the Interface expected by Client
    const oyentesRaw = await getAllOyentes();

    // Map to the format needed by the client component
    const coaches = oyentesRaw.map(p => ({
        id: p.id,
        userId: p.userId,
        fullName: p.fullName,
        email: p.email,
        specialty: p.specialty,
        image: null,
        totalSessions: 0,
        completedSessions: 0,
        totalPatients: 0,
        activePatients: 0,
        balance: "0",
        rating: "5.0",
        createdAt: new Date(p.createdAt),
    }));

    return <CoachesManagementClient coaches={coaches} />;
}
