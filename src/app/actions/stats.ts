"use server";

import { db } from "@/db";
import { appointments, users, oyentes } from "@/db/schema";
import { count, eq, or } from "drizzle-orm";

export async function getGlobalStats() {
    try {
        const [totalUsersRes, totalSessionsRes, totalOyentesRes] = await Promise.all([
            db.select({ value: count() }).from(users),
            db.select({ value: count() }).from(appointments),
            db.select({ value: count() }).from(users).where(
                or(
                    eq(users.role, "oyente"),
                    eq(users.role, "psychologist"),
                    eq(users.role, "coach")
                )
            )
        ]);

        return {
            realUsers: totalUsersRes[0]?.value || 0,
            realSessions: totalSessionsRes[0]?.value || 0,
            realOyentes: totalOyentesRes[0]?.value || 0
        };
    } catch (error) {
        console.error("Error fetching global stats:", error);
        return {
            realUsers: 0,
            realSessions: 0,
            realOyentes: 0
        };
    }
}
