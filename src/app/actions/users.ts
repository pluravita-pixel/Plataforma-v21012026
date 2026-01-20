"use server";

import { db } from "@/db";
import { users, type NewUser } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function updateUserAccount(userId: string, data: {
    email?: string,
    phone?: string
}) {
    try {
        await db.update(users)
            .set(data)
            .where(eq(users.id, userId));
        revalidatePath("/psychologist/settings");
        return { success: true };
    } catch (error) {
        console.error("Error updating user account:", error);
        return { success: false, error: "Error al actualizar los datos de la cuenta" };
    }
}

export async function createUser(data: NewUser) {
    try {
        const result = await db.insert(users).values(data).returning();
        revalidatePath("/");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, error: "No se pudo crear el usuario. Asegúrate de que las tablas existan en Supabase." };
    }
}

export async function getUsers() {
    try {
        return await db.select().from(users).orderBy(users.createdAt);
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}
