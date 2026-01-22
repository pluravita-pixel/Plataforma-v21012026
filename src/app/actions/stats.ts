"use server";

import { db } from "@/db";
import { appointments, users, psychologists } from "@/db/schema";
import { count, eq } from "drizzle-orm";

export async function getGlobalStats() {
    try {
        const [totalUsersRes, totalSessionsRes, totalCoachesRes] = await Promise.all([
            db.select({ value: count() }).from(users).where(eq(users.role, "patient")),
            db.select({ value: count() }).from(appointments).where(eq(appointments.status, "completed")),
            db.select({ value: count() }).from(psychologists)
        ]);

        return {
            realUsers: totalUsersRes[0].value,
            realSessions: totalSessionsRes[0].value,
            realCoaches: totalCoachesRes[0].value
        };
    } catch (error) {
        console.error("Error fetching global stats:", error);
        return {
            realUsers: 0,
            realSessions: 0,
            realCoaches: 0
        };
    }
}
