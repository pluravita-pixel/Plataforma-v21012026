'use server'

import { client } from "@/db";

export async function createLead(email: string, source: string) {
    try {
        const result = await client`
            INSERT INTO leads (email, source)
            VALUES (${email.toLowerCase().trim()}, ${source})
            ON CONFLICT (email) DO NOTHING
            RETURNING id;
        `;

        return { success: true, data: result[0] };
    } catch (error: any) {
        console.error('Error creating lead:', error);
        return { success: false, error: error.message };
    }
}
