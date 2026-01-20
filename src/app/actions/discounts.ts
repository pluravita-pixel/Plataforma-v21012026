"use server";

import { db } from "@/db";
import { discountCodes, appointments } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export async function validateDiscountCode(code: string, userId: string) {
    try {
        const normalizedCode = code.toUpperCase().trim();

        // 1. Check if code exists and is active
        const [discountCode] = await db
            .select()
            .from(discountCodes)
            .where(and(eq(discountCodes.code, normalizedCode), eq(discountCodes.active, true)));

        if (!discountCode) {
            return { error: "Código inválido o inactivo." };
        }

        // 2. Check expiration
        if (discountCode.expiresAt && new Date() > discountCode.expiresAt) {
            return { error: "El código ha expirado." };
        }

        // 3. Check "First Session Only" condition
        if (discountCode.isFirstSessionOnly) {
            const [result] = await db
                .select({ count: count() })
                .from(appointments)
                .where(eq(appointments.patientId, userId));

            // If user has ANY appointments recorded (past or upcoming), they are not new.
            // (Unless we want to count only 'completed' ones, but typically first-booking implies 0 bookings)
            if (result.count > 0) {
                return { error: "Este código es válido solo para tu primera sesión." };
            }
        }

        return { success: true, discount: discountCode };
    } catch (error) {
        console.error("Error validating discount code:", error);
        return { error: "Error al validar el código." };
    }
}

export async function createDiscountCode(data: {
    code: string;
    discountPercentage: number;
    isFirstSessionOnly?: boolean;
    expiresAt?: Date;
}) {
    try {
        await db.insert(discountCodes).values({
            code: data.code.toUpperCase().trim(),
            discountPercentage: data.discountPercentage,
            active: true,
            isFirstSessionOnly: data.isFirstSessionOnly ?? false,
            expiresAt: data.expiresAt,
        });
        return { success: true };
    } catch (error) {
        return { error: "Error creating code" };
    }
}
