"use server";

import { db } from "@/db";
import { appointments, users, psychologists } from "@/db/schema";
import { count, eq } from "drizzle-orm";

export async function getGlobalStats() {
    try {
        const [totalUsersRes, totalSessionsRes, totalCoachesRes] = await Promise.all([
            db.select({ value: count() }).from(users),
            db.select({ value: count() }).from(appointments),
            db.select({ value: count() }).from(users).where(eq(users.role, "psychologist"))
        ]);

        return {
            realUsers: totalUsersRes[0]?.value || 0,
            realSessions: totalSessionsRes[0]?.value || 0,
            realCoaches: totalCoachesRes[0]?.value || 0
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
