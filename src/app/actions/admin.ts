"use server";

import { db } from "@/db";
import { users, psychologists, appointments, supportTickets } from "@/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAdminStats() {
    const [totalUsers] = await db.select({ value: count() }).from(users);
    const [totalPsychologists] = await db.select({ value: count() }).from(psychologists);
    const [totalSessions] = await db.select({ value: count() }).from(appointments);

    return {
        users: totalUsers.value,
        psychologists: totalPsychologists.value,
        sessions: totalSessions.value,
    };
}

export async function getAllUsers() {
    return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getAllPsychologists() {
    return await db.select().from(psychologists).orderBy(desc(psychologists.createdAt));
}

export async function createPsychologistProfile(name: string, email: string) {
    try {
        // In a real app, you'd also create an auth user or invite them.
        // For now, we seed the DB.
        const [newUser] = await db.insert(users).values({
            email,
            fullName: name,
            role: "psychologist",
        }).returning();

        await db.insert(psychologists).values({
            userId: newUser.id,
            fullName: name,
            email: email,
            specialty: "General",
        });

        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error:", error);
        return { error: "No se pudo crear el perfil" };
    }
}

export async function resolveTicket(ticketId: string) {
    await db.update(supportTickets)
        .set({ status: "resolved" })
        .where(eq(supportTickets.id, ticketId));
    revalidatePath("/admin/support");
}

export async function getTickets() {
    return await db.query.supportTickets.findMany({
        orderBy: (supportTickets, { desc }) => [desc(supportTickets.createdAt)],
    });
}
