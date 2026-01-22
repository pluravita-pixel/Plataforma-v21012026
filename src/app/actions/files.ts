"use server";

import { createClient } from "@supabase/supabase-js";
import { db } from "@/db";
import { sessionFiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Initialize Supabase Admin Client for server-side operations
// We use the Service Role key if available to bypass RLS during upload if needed, 
// OR simpler: just use the regular client and rely on the user's session if I had a way to pass it.
// For server actions, we usually reconstruct the client with cookies.
// Let's us the pattern from auth.ts
import { cookies } from "next/headers";

const getSupabase = async () => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    // We need to pass the access token to context if we want RLS to work properly with "authenticated" role.
    // However, the standard supabase-js client doesn't automatically pick up cookies in a server action 
    // unless using the Next.js helper. Since we seem to be using the raw js client in auth.ts:
    // We will use the SERVICE_ROLE key for storage operations to ensure permissions, 
    // then manually check DB permissions if needed, OR we trust the session validation we do here.

    // ACTUALLY, checking auth.ts:
    // It uses createClient(url, anon_key).

    // For Storage, we need the user to be authenticated.
    // Let's try to set the session.

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

    const supabase = createClient(
        url,
        key,
        {
            global: {
                headers: sessionId ? { Authorization: `Bearer ${sessionId}` } : {}
            }
        }
    );
    return supabase;
};

import { getCurrentUser } from "./auth";
import { client } from "@/db";

export async function uploadSessionFile(appointmentId: string, formData: FormData) {
    const user = await getCurrentUser();

    if (!user || user.role !== 'psychologist') {
        return { error: "Solo los psicólogos pueden subir archivos a las sesiones." };
    }

    const file = formData.get("file") as File;
    if (!file || !appointmentId) {
        return { error: "Faltan datos para subir el archivo." };
    }

    // Verify appointment ownership
    const results = await client`
        SELECT id FROM appointments 
        WHERE id = ${appointmentId} AND psychologist_id = (SELECT id FROM psychologists WHERE user_id = ${user.id} LIMIT 1)
        LIMIT 1
    `;

    if (results.length === 0) {
        return { error: "No tienes permisos para subir archivos a esta sesión." };
    }

    const supabase = await getSupabase();

    // 1. Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${appointmentId}/${Date.now()}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('consultas-files')
        .upload(fileName, fileBuffer, {
            contentType: file.type,
            upsert: false
        });

    if (uploadError) {
        console.error("Storage Upload Error:", uploadError);
        return { error: "Error al guardar el archivo en la nube." };
    }

    const filePath = uploadData.path;

    // 3. Save Metadata to DB
    try {
        await db.insert(sessionFiles).values({
            appointmentId,
            uploaderId: user.id,
            fileName: file.name,
            fileUrl: filePath,
            fileSize: file.size,
        });

        revalidatePath(`/psychologist/dashboard`);
        revalidatePath(`/patient/dashboard`);
        return { success: true };
    } catch (dbError) {
        console.error("DB Insert Error:", dbError);
        return { error: "Error al registrar el archivo." };
    }
}

export async function getSessionFiles(appointmentId: string) {
    const files = await db.query.sessionFiles.findMany({
        where: eq(sessionFiles.appointmentId, appointmentId),
        orderBy: [desc(sessionFiles.createdAt)],
        with: {
            uploader: true
        }
    });

    // Generate Signed URLs for these files
    const supabase = await getSupabase();

    const filesWithUrls = await Promise.all(files.map(async (file) => {
        const { data } = await supabase
            .storage
            .from('consultas-files')
            .createSignedUrl(file.fileUrl, 3600); // 1 hour expiry

        return {
            ...file,
            signedUrl: data?.signedUrl
        };
    }));

    return filesWithUrls;
}
