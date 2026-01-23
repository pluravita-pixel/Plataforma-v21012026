"use server";

import { db } from "@/db";
import { users, psychologists, appointments, supportTickets } from "@/db/schema";
import { eq, count, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./auth";

async function ensureAdmin() {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error("No autorizado: Se requiere rol de administrador.");
    }
    return user;
}

// Note: Make sure to import sql from drizzle-orm at the top
export async function getAdminStats() {
    await ensureAdmin();
    const [totalUsersRes, totalPsychologistsRes, totalSessionsRes, totalRevenueRes] = await Promise.all([
        db.select({ value: count() }).from(users),
        db.select({ value: count() }).from(psychologists),
        db.select({ value: count() }).from(appointments),
        db.select({ value: sql<number>`sum(${appointments.price})` }).from(appointments)
    ]);

    return {
        users: totalUsersRes[0].value,
        psychologists: totalPsychologistsRes[0].value,
        sessions: totalSessionsRes[0].value,
        revenue: Number(totalRevenueRes[0]?.value || 0),
    };
}

export async function getAllUsers() {
    await ensureAdmin();
    return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getAllPsychologists() {
    await ensureAdmin();
    return await db.select().from(psychologists).orderBy(desc(psychologists.createdAt));
}

export async function createPsychologistProfile(name: string, email: string) {
    await ensureAdmin();
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
    await ensureAdmin();
    await db.update(supportTickets)
        .set({ status: "resolved" })
        .where(eq(supportTickets.id, ticketId));
    revalidatePath("/admin/support");
}

export async function preApproveAdmin(email: string) {
    await ensureAdmin();
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
    await ensureAdmin();
    return await db.query.supportTickets.findMany({
        orderBy: (supportTickets, { desc }) => [desc(supportTickets.createdAt)],
    });
}

export async function updateAdminSelf(userId: string, data: { fullName: string; email: string }) {
    await ensureAdmin();
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.id !== userId) {
        throw new Error("No autorizado para editar este perfil.");
    }

    try {
        await db.update(users)
            .set({
                fullName: data.fullName,
                email: data.email
            })
            .where(eq(users.id, userId));

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        console.error("Error updating admin profile:", error);
        return { error: "Error al actualizar el perfil." };
    }
}
