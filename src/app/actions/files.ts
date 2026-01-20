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

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                headers: sessionId ? { Authorization: `Bearer ${sessionId}` } : {}
            }
        }
    );
    return supabase;
};

export async function uploadSessionFile(appointmentId: string, formData: FormData) {
    const file = formData.get("file") as File;
    const uploaderId = formData.get("uploaderId") as string;

    if (!file || !appointmentId || !uploaderId) {
        return { error: "Faltan datos para subir el archivo." };
    }

    const supabase = await getSupabase();

    // 1. Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${appointmentId}/${Date.now()}.${fileExt}`;

    // Need to convert File to ArrayBuffer for supabase-js upload in Node environment
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

    // 2. Get Public URL (or Signed URL if private)
    // Since we made the bucket private (good practice), we technically need signed URLs to view.
    // For now, let's store the path. We will generate signed URLs on fetch.
    const filePath = uploadData.path;

    // 3. Save Metadata to DB
    try {
        await db.insert(sessionFiles).values({
            appointmentId,
            uploaderId,
            fileName: file.name,
            fileUrl: filePath, // Storing the storage path
            fileSize: file.size,
        });

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
