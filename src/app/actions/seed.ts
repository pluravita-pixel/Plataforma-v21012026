"use server";

import { client, db } from "@/db";
import { oyentes, availabilitySlots } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function ensureUsernames() {
    try {
        const psychologists = await client`SELECT id, full_name, username FROM oyentes`;

        for (const p of psychologists) {
            if (!p.username) {
                const baseUsername = p.full_name
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "") // Remove accents
                    .replace(/[^a-z0-9]/g, "-") // Replace non-alphanumeric with hyphens
                    .replace(/-+/g, "-") // Remove double hyphens
                    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

                let username = baseUsername;
                let counter = 1;

                // Ensure uniqueness
                while (true) {
                    const existing = await client`SELECT id FROM oyentes WHERE username = ${username} AND id != ${p.id} LIMIT 1`;
                    if (existing.length === 0) break;
                    username = `${baseUsername}-${counter}`;
                    counter++;
                }

                await client`UPDATE oyentes SET username = ${username} WHERE id = ${p.id}`;
            }
        }
        return { success: true };
    } catch (error) {
        console.error("Error ensuring usernames:", error);
        return { error: "Failed to ensure usernames" };
    }
}

export async function randomizeAvailability(oyenteId: string) {
    try {
        // Clear existing unbooked slots
        await client`DELETE FROM availability_slots WHERE oyente_id = ${oyenteId} AND is_booked = false`;

        const slotsToAdd = [];
        const now = new Date();

        // Generate slots for the next 14 days
        for (let i = 2; i < 16; i++) { // Start from 2 days ahead
            const date = new Date(now);
            date.setDate(now.getDate() + i);
            date.setHours(0, 0, 0, 0);

            // Skip weekends sometimes? Or just vary hours
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            // Randomly decide how many slots for this day
            const numSlots = isWeekend ? Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 5);

            const usedHours = new Set();
            for (let j = 0; j < numSlots; j++) {
                let hour;
                // Work hours: 9-14 and 16-20
                if (Math.random() > 0.4) {
                    hour = 9 + Math.floor(Math.random() * 5); // Morning
                } else {
                    hour = 16 + Math.floor(Math.random() * 5); // Afternoon
                }

                if (usedHours.has(hour)) continue;
                usedHours.add(hour);

                const start = new Date(date);
                start.setHours(hour, 0, 0, 0);
                const end = new Date(start);
                end.setHours(hour + 1, 0, 0, 0);

                slotsToAdd.push({
                    oyenteId,
                    startTime: start,
                    endTime: end,
                    isBooked: false
                });
            }
        }

        if (slotsToAdd.length > 0) {
            await db.insert(availabilitySlots).values(slotsToAdd);
        }

        revalidatePath("/oyente/calendar");
        return { success: true };
    } catch (error) {
        console.error("Error randomizing availability:", error);
        return { error: "Failed to randomize availability" };
    }
}

export async function randomizeAllAvailability() {
    try {
        const psychologists = await client`SELECT id FROM oyentes`;
        for (const p of psychologists) {
            await randomizeAvailability(p.id);
        }
        return { success: true };
    } catch (error) {
        console.error("Error randomizing all availability:", error);
        return { error: "Failed to randomize all availability" };
    }
}
