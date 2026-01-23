"use server";

import { db } from "@/db";
import { supportTickets, users } from "@/db/schema";
import { getCurrentUser } from "./auth";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createTicket(subject: string, message: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("No autorizado");

    try {
        await db.insert(supportTickets).values({
            userId: user.id,
            subject,
            message,
            status: "open",
        });

        revalidatePath("/psychologist/support");
        revalidatePath("/admin/support");
        return { success: true };
    } catch (error) {
        console.error("Error creating ticket:", error);
        return { error: "No se pudo crear el ticket" };
    }
}

export async function getMyTickets() {
    const user = await getCurrentUser();
    if (!user) return [];

    return await db.query.supportTickets.findMany({
        where: eq(supportTickets.userId, user.id),
        orderBy: [desc(supportTickets.createdAt)],
    });
}

export async function getAllTickets() {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error("No autorizado");
    }

    return await db.query.supportTickets.findMany({
        with: {
            user: true,
        },
        orderBy: [desc(supportTickets.createdAt)],
    });
}

export async function resolveTicket(ticketId: string) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error("No autorizado");
    }

    try {
        await db.update(supportTickets)
            .set({
                status: "resolved",
                isRead: true
            })
            .where(eq(supportTickets.id, ticketId));

        revalidatePath("/admin/support");
        return { success: true };
    } catch (error) {
        return { error: "No se pudo actualizar el ticket" };
    }
}

export async function replyToTicket(ticketId: string, response: string) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error("No autorizado");
    }

    try {
        await db.update(supportTickets)
            .set({
                adminResponse: response,
                isRead: true
                // Keep status open so user can see reply, or maybe resolved?
                // Usually reply means admin acted. Let's keep it open or have a 'replied' status?
                // Schema limits to 'open'/'resolved'. Let's keep 'open' or move to 'resolved' if checking.
                // For now, just adding response. Admin can resolve separately or I'll add auto-resolve?
                // Let's leave status as is, just add response.
            })
            .where(eq(supportTickets.id, ticketId));

        revalidatePath("/admin/support");
        return { success: true };
    } catch (error) {
        return { error: "No se pudo enviar la respuesta" };
    }
}

export async function markAsRead(ticketId: string) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        throw new Error("No autorizado");
    }

    try {
        await db.update(supportTickets)
            .set({ isRead: true })
            .where(eq(supportTickets.id, ticketId));

        revalidatePath("/admin/support");
        return { success: true };
    } catch (error) {
        return { error: "Error al marcar como leído" };
    }
}
