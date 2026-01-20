"use server";

import { db } from "@/db";
import { appointments, psychologists, users, sessionFiles } from "@/db/schema";
import { eq, and, gte, asc, desc } from "drizzle-orm";
import { getCurrentUser } from "./auth";

export async function getPatientDashboardData() {
    const user = await getCurrentUser();
    if (!user) return null;

    // 1. Fetch next appointment
    const nextAppointment = await db.query.appointments.findFirst({
        where: and(
            eq(appointments.patientId, user.id),
            eq(appointments.status, "scheduled"),
            gte(appointments.date, new Date())
        ),
        orderBy: [asc(appointments.date)],
        with: {
            psychologist: true,
            files: {
                with: {
                    uploader: true
                }
            }
        }
    });

    // 2. Fetch some coaches for exploration (dynamic)
    const coaches = await db.query.psychologists.findMany({
        limit: 3,
        orderBy: [desc(psychologists.rating)]
    });

    return {
        user,
        nextAppointment,
        recommendedCoaches: coaches
    };
}
