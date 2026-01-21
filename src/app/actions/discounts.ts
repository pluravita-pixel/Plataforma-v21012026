"use server";

import { db } from "@/db";
import { discountCodes, appointments, users } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export async function validateDiscountCode(code: string, userId: string, email?: string) {
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
        const isFirstSessionCode = discountCode.isFirstSessionOnly || normalizedCode === 'PRIMERA25';

        if (isFirstSessionCode) {
            let targetUserId = userId !== "guest" ? userId : null;

            // If it's a guest but we have an email, try to find the user
            if (!targetUserId && email) {
                const [foundUser] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, email));
                if (foundUser) targetUserId = foundUser.id;
            }

            if (targetUserId) {
                const [result] = await db
                    .select({ count: count() })
                    .from(appointments)
                    .where(eq(appointments.patientId, targetUserId));

                if (result.count > 0) {
                    return { error: "Este código es válido solo para tu primera sesión." };
                }
            }
        }

        // 4. Check if user already used THIS specific code
        let targetUserId = userId !== "guest" ? userId : null;
        if (!targetUserId && email) {
            const [foundUser] = await db
                .select()
                .from(users)
                .where(eq(users.email, email));
            if (foundUser) targetUserId = foundUser.id;
        }

        if (targetUserId) {
            const [usedResult] = await db
                .select({ count: count() })
                .from(appointments)
                .where(and(
                    eq(appointments.patientId, targetUserId),
                    eq(appointments.discountCodeId, discountCode.id)
                ));

            if (usedResult.count > 0) {
                return { error: "Ya has utilizado este código de descuento anteriormente." };
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
