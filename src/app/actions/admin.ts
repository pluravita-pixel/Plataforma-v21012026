"use server";

import { db, client } from "@/db";
import { users, oyentes, appointments, supportTickets, availabilitySlots, withdrawals, oyenteSolicitudes } from "@/db/schema";
import { eq, count, desc, sql, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./auth";
import { createAdminClient } from "@/lib/supabase/server";

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
export async function deleteUser(userId: string) {
    await ensureAdmin();
    try {
        // 1. Si el usuario es un oyente, eliminar el perfil de oyente y sus dependencias (citas, slots, etc)
        const psychResult = await db.select()
            .from(oyentes)
            .where(eq(oyentes.userId, userId))
            .limit(1);

        const psych = psychResult[0];
        if (psych) {
            const oyenteId = psych.id;
            await db.delete(availabilitySlots).where(eq(availabilitySlots.oyenteId, oyenteId));
            await db.delete(withdrawals).where(eq(withdrawals.oyenteId, oyenteId));
            // Eliminar citas relacionadas al oyente
            await db.delete(appointments).where(eq(appointments.oyenteId, oyenteId));
            await db.delete(oyentes).where(eq(oyentes.id, oyenteId));
        }

        // 2. Eliminar citas donde el usuario fue paciente/cliente
        await db.delete(appointments).where(eq(appointments.usuarioId, userId));

        // 3. Eliminar tickets de soporte
        await db.delete(supportTickets).where(eq(supportTickets.userId, userId));

        // 4. Eliminar solicitudes de oyente
        await db.delete(oyenteSolicitudes).where(eq(oyenteSolicitudes.userId, userId));

        // 5. Eliminar el usuario de Supabase Auth (usando el cliente admin)
        const supabaseAdmin = await createAdminClient();
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authError) {
            console.error("Error deleting from Supabase Auth:", authError);
            // Opcional: Podrías decidir si fallar aquí o continuar. 
            // Si el usuario ya no existe en Auth, lanzará un error que podemos ignorar o loguear.
        }

        // 6. Eliminar el usuario de la tabla principal de la DB
        await db.delete(users).where(eq(users.id, userId));

        revalidatePath("/admin/usuarios");
        revalidatePath("/admin/oyentes");
        revalidatePath("/admin/dashboard");
        return { success: true, message: "Usuario eliminado correctamente" };
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return { error: "No se pudo eliminar el usuario. Error técnico: " + error.message };
    }
}

export async function getUserAffinityTest(userId: string) {
    await ensureAdmin();
    try {
        const result = await client`
            SELECT responses, created_at
            FROM affinity_tests
            WHERE user_id = ${userId}::uuid
            ORDER BY created_at DESC
            LIMIT 1
        `;

        if (result.length > 0) {
            return {
                responses: result[0].responses,
                createdAt: result[0].created_at
            };
        }
        return null;
    } catch (error) {
        console.error("Error getting affinity test:", error);
        return null;
    }
}

export async function toggleOyenteVisibility(oyenteId: string, isHidden: boolean) {
    await ensureAdmin();
    try {
        await client`
            UPDATE oyentes
            SET is_hidden = ${isHidden}
            WHERE id = ${oyenteId}
        `;
        revalidatePath("/admin/oyentes");
        revalidatePath("/usuario/search");
        return { success: true };
    } catch (error: any) {
        console.error("Error toggling oyente visibility:", error);
        return { error: "Error al actualizar visibilidad." };
    }
}
