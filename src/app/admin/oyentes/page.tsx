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
        image: p.image,
        totalSessions: p.totalSessions || 0,
        completedSessions: p.completedSessions || 0,
        totalPatients: p.totalUsers || 0,
        activePatients: p.activeUsers || 0,
        balance: p.balance?.toString() || "0",
        rating: p.rating || "5.0",
        createdAt: new Date(p.createdAt),
        price: p.price?.toString() || "35.00",
        description: p.description,
        languages: p.languages || [],
        licenseNumber: p.licenseNumber,
        isHidden: p.isHidden || false,
    }));

    return <CoachesManagementClient coaches={coaches} />;
}
