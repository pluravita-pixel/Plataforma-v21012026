"use server";

import { db } from "@/db";
import { users, psychologists, appointments, supportTickets } from "@/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAdminStats() {
    const [totalUsersRes, totalPsychologistsRes, totalSessionsRes] = await Promise.all([
        db.select({ value: count() }).from(users),
        db.select({ value: count() }).from(psychologists),
        db.select({ value: count() }).from(appointments)
    ]);

    return {
        users: totalUsersRes[0].value,
        psychologists: totalPsychologistsRes[0].value,
        sessions: totalSessionsRes[0].value,
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
        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        const existing = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);

        let userId: string;

        if (existing.length > 0) {
            // User already exists - update their role to psychologist
            const [updatedUser] = await db.update(users)
                .set({
                    role: "psychologist",
                    fullName: name // Update name if provided
                })
                .where(eq(users.email, normalizedEmail))
                .returning();

            userId = updatedUser.id;

            // Check if psychologist profile already exists
            const existingPsych = await db.select()
                .from(psychologists)
                .where(eq(psychologists.userId, userId))
                .limit(1);

            if (existingPsych.length > 0) {
                // Psychologist profile already exists, just update it
                await db.update(psychologists)
                    .set({
                        fullName: name,
                        email: normalizedEmail,
                    })
                    .where(eq(psychologists.userId, userId));
            } else {
                // Create new psychologist profile
                await db.insert(psychologists).values({
                    userId: userId,
                    fullName: name,
                    email: normalizedEmail,
                    specialty: "General",
                });
            }
        } else {
            // User doesn't exist - create a "pending" user that will be completed on registration
            const [newUser] = await db.insert(users).values({
                email: normalizedEmail,
                fullName: name,
                role: "psychologist",
            }).returning();

            userId = newUser.id;

            // Create psychologist profile for the pending user
            await db.insert(psychologists).values({
                userId: userId,
                fullName: name,
                email: normalizedEmail,
                specialty: "General",
            });
        }

        revalidatePath("/admin/dashboard");
        return { success: true, message: existing.length > 0 ? "Psicólogo actualizado correctamente" : "Psicólogo pre-registrado. Recibirá acceso al registrarse." };
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

export async function preApproveAdmin(email: string) {
    try {
        // Check if user already exists
        const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);

        if (existing.length > 0) {
            // If exists, just update role to admin
            await db.update(users)
                .set({ role: "admin" })
                .where(eq(users.email, email.toLowerCase().trim()));
        } else {
            // If not, pre-insert placeholder user
            await db.insert(users).values({
                email: email.toLowerCase().trim(),
                fullName: "Admin Pendiente",
                role: "admin",
            });
        }

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        console.error("Error pre-approving admin:", error);
        return { error: "No se pudo invitar al administrador." };
    }
}

export async function getTickets() {
    return await db.query.supportTickets.findMany({
        orderBy: (supportTickets, { desc }) => [desc(supportTickets.createdAt)],
    });
}
