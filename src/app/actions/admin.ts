"use server";

import { db } from "@/db";
import { users, oyentes, appointments, supportTickets, availabilitySlots, withdrawals } from "@/db/schema";
import { eq, count, desc, sql, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./auth";

async function ensureAdmin() {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error("No autorizado: Se requiere rol de administrador.");
    }
    return user;
}

export async function getAdminStats() {
    try {
        await ensureAdmin();

        const [
            totalUsersRes,
            totalOyentesRes,
            totalSessionsRes,
        ] = await Promise.all([
            db.select({ value: count() }).from(users),
            db.select({ value: count() }).from(users).where(
                or(
                    eq(users.role, 'oyente'),
                    eq(users.role, 'psychologist'),
                    eq(users.role, 'coach')
                )
            ),
            db.select({ value: count() }).from(appointments),
        ]);

        return {
            users: totalUsersRes[0]?.value || 0,
            oyentes: totalOyentesRes[0]?.value || 0,
            sessions: totalSessionsRes[0]?.value || 0,
            revenue: 0,
            appointmentsToday: 0,
        };
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return {
            users: 0,
            oyentes: 0,
            sessions: 0,
            revenue: 0,
            appointmentsToday: 0,
        };
    }
}

export async function getAllUsers() {
    await ensureAdmin();
    return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getAllOyentes() {
    try {
        await ensureAdmin();
        return await db.select().from(oyentes).orderBy(desc(oyentes.createdAt));
    } catch (error) {
        console.error("Error fetching all oyentes:", error);
        return [];
    }
}

export async function createOyenteProfile(name: string, email: string) {
    await ensureAdmin();
    try {
        const normalizedEmail = email.toLowerCase().trim();

        const existing = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);

        let userId: string;

        if (existing.length > 0) {
            const [updatedUser] = await db.update(users)
                .set({
                    role: "oyente",
                    fullName: name
                })
                .where(eq(users.email, normalizedEmail))
                .returning();

            userId = updatedUser.id;

            const existingPsych = await db.select()
                .from(oyentes)
                .where(eq(oyentes.userId, userId))
                .limit(1);

            if (existingPsych.length > 0) {
                await db.update(oyentes)
                    .set({
                        fullName: name,
                        email: normalizedEmail,
                    })
                    .where(eq(oyentes.userId, userId));
            } else {
                await db.insert(oyentes).values({
                    userId: userId,
                    fullName: name,
                    email: normalizedEmail,
                    specialty: "General",
                });
            }
        } else {
            const [newUser] = await db.insert(users).values({
                email: normalizedEmail,
                fullName: name,
                role: "oyente",
            }).returning();

            userId = newUser.id;

            await db.insert(oyentes).values({
                userId: userId,
                fullName: name,
                email: normalizedEmail,
                specialty: "General",
            });
        }

        revalidatePath("/admin/dashboard");
        return { success: true, message: existing.length > 0 ? "Oyente actualizado correctamente" : "Oyente pre-registrado. Recibirá acceso al registrarse." };
    } catch (error: any) {
        if (error.digest === 'DYNAMIC_SERVER_USAGE' || (error.message && error.message.includes('Dynamic server usage'))) {
            throw error;
        }
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
        const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);

        if (existing.length > 0) {
            await db.update(users)
                .set({ role: "admin" })
                .where(eq(users.email, email.toLowerCase().trim()));
        } else {
            await db.insert(users).values({
                email: email.toLowerCase().trim(),
                fullName: "Admin Pendiente",
                role: "admin",
            });
        }

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error: any) {
        if (error.digest === 'DYNAMIC_SERVER_USAGE' || (error.message && error.message.includes('Dynamic server usage'))) {
            throw error;
        }
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
    } catch (error: any) {
        if (error.digest === 'DYNAMIC_SERVER_USAGE' || (error.message && error.message.includes('Dynamic server usage'))) {
            throw error;
        }
        console.error("Error updating admin profile:", error);
        return { error: "Error al actualizar el perfil." };
    }
}

export async function deleteOyente(oyenteId: string) {
    await ensureAdmin();
    try {
        const psychResult = await db.select()
            .from(oyentes)
            .where(eq(oyentes.id, oyenteId))
            .limit(1);

        const psych = psychResult[0];
        if (!psych) {
            return { error: "Oyente no encontrado" };
        }

        const userId = psych.userId;

        await db.delete(availabilitySlots).where(eq(availabilitySlots.oyenteId, oyenteId));
        await db.delete(withdrawals).where(eq(withdrawals.oyenteId, oyenteId));
        await db.delete(appointments).where(eq(appointments.oyenteId, oyenteId));

        await db.delete(oyentes).where(eq(oyentes.id, oyenteId));

        await db.delete(users).where(eq(users.id, userId));

        revalidatePath("/admin/oyentes");
        revalidatePath("/admin/dashboard");
        return { success: true, message: "Oyente eliminado correctamente" };
    } catch (error: any) {
        console.error("Error deleting oyente:", error);
        return { error: "No se pudo eliminar al oyente. Asegúrate de que no tenga dependencias críticas." };
    }
}
