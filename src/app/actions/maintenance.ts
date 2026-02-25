"use server";

import { client } from "@/db";
import { ensureUsernames, randomizeAllAvailability } from "@/app/actions/seed";
import { revalidatePath } from "next/cache";

export async function runMaintenanceTasks() {
    try {
        await ensureUsernames();
        await randomizeAllAvailability();
        revalidatePath("/");
        revalidatePath("/admin/dashboard");
        return { success: "Usernames generated and availability randomized successfully." };
    } catch (error: any) {
        console.error("Maintenance task error:", error);
        return { error: error.message || "Failed to run maintenance tasks." };
    }
}
