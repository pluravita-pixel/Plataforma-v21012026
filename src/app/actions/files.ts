"use server";

import { createClient } from "@supabase/supabase-js";
import { db } from "@/db";
import { sessionFiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getCurrentUser } from "./auth";
import { client } from "@/db";

const getSupabase = async () => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key || url.includes("placeholder")) {
        console.error("CRITICAL: Supabase environment variables are missing in getSupabase (files.ts)!");
        throw new Error("Servidor no configurado correctamente (Supabase URL/Key missing)");
    }

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


export async function uploadSessionFile(appointmentId: string, formData: FormData) {
    const user = await getCurrentUser();

    if (!user || (user.role !== 'oyente' && user.role !== 'admin' && user.role !== 'psychologist' && user.role !== 'coach')) {
        return { error: "Solo los oyentes pueden subir archivos a las sesiones." };
    }

    const file = formData.get("file") as File;
    if (!file || !appointmentId) {
        return { error: "Faltan datos para subir el archivo." };
    }

    const results = await client`
        SELECT id FROM appointments 
        WHERE id = ${appointmentId} AND oyente_id = (SELECT id FROM oyentes WHERE user_id = ${user.id} LIMIT 1)
        LIMIT 1
    `;

    if (results.length === 0 && user.role !== 'admin') {
        return { error: "No tienes permisos para subir archivos a esta sesión." };
    }

    const supabase = await getSupabase();

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

    try {
        await db.insert(sessionFiles).values({
            appointmentId,
            uploaderId: user.id,
            fileName: file.name,
            fileUrl: filePath,
            fileSize: file.size,
        });

        revalidatePath(`/oyente/dashboard`);
        revalidatePath(`/usuario/dashboard`);
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

    const supabase = await getSupabase();

    const filesWithUrls = await Promise.all(files.map(async (file) => {
        const { data } = await supabase
            .storage
            .from('consultas-files')
            .createSignedUrl(file.fileUrl, 3600);

        return {
            ...file,
            signedUrl: data?.signedUrl
        };
    }));

    return filesWithUrls;
}
