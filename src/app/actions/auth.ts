"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/db";
import { users, psychologists, supportTickets } from "@/db/schema";
import { eq } from "drizzle-orm";

// Helper to get Supabase client
const getSupabase = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
};

export async function login(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = getSupabase();
    let redirectPath: string | null = null;
    let authError: string | null = null;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            if (error.message.includes("Email not confirmed")) {
                authError = "Debes confirmar tu correo electrónico antes de entrar.";
            } else {
                authError = "Email no registrado o contraseña incorrecta";
            }
        } else if (data.session && data.user) {
            const cookieStore = await cookies();
            cookieStore.set("session_id", data.session.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: data.session.expires_in,
                path: "/",
            });

            // Update last login in both tables if applicable
            try {
                await db.update(users)
                    .set({ lastLogin: new Date() })
                    .where(eq(users.id, data.user.id));

                const userRecord = await db.query.users.findFirst({
                    where: eq(users.id, data.user.id),
                });

                if (userRecord?.role === 'admin') {
                    redirectPath = "/admin/dashboard";
                } else if (userRecord?.role === 'psychologist') {
                    await db.update(psychologists)
                        .set({ lastLogin: new Date() })
                        .where(eq(psychologists.userId, data.user.id));
                    redirectPath = "/psychologist/dashboard";
                } else {
                    redirectPath = "/patient/dashboard"; // Landing for patients
                }
            } catch (dbError) {
                console.error("DB Sync error:", dbError);
                redirectPath = "/patient/dashboard"; // Fallback
            }
        }
    } catch (err) {
        authError = "Error al iniciar sesión";
    }

    if (authError) return { error: authError };
    if (redirectPath) redirect(redirectPath);
    return { error: "Error inesperado" };
}

export async function loginAnonymously() {
    const supabase = getSupabase();
    let redirectPath: string | null = null;
    let authError: string | null = null;

    try {
        const { data, error } = await supabase.auth.signInAnonymously();

        if (error) {
            authError = "No se pudo iniciar sesión como invitado: " + error.message;
        } else if (data.session && data.user) {
            const cookieStore = await cookies();
            cookieStore.set("session_id", data.session.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: data.session.expires_in,
                path: "/",
            });

            // Sync with DB
            try {
                await db.insert(users).values({
                    id: data.user.id,
                    email: `guest_${data.user.id}@pluravita.com`, // Artificial unique email for DB constraint
                    fullName: "Invitado",
                    role: "patient"
                }).onConflictDoNothing();
            } catch (dbError) {
                console.error("DB Sync Error for guest:", dbError);
            }

            redirectPath = "/";
        }
    } catch (err) {
        authError = "Ocurrió un error inesperado";
    }

    if (authError) return { error: authError };
    if (redirectPath) redirect(redirectPath);
    return { error: "Error de flujo en el inicio de sesión de invitado" };
}

export async function register(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const supabase = getSupabase();

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } }
        });

        if (error) return { error: error.message };

        if (data.user) {
            // 1. Check if the user was already pre-created by an admin
            const existingUser = await db.query.users.findFirst({
                where: eq(users.email, email),
            });

            if (existingUser) {
                // Merge logic: Migrate data from old stub to new account
                if (existingUser.id !== data.user.id) {
                    // a. Rename stub to free email
                    await db.update(users)
                        .set({ email: `old_${data.user.id}_${email}` })
                        .where(eq(users.id, existingUser.id));

                    // b. Insert new
                    await db.insert(users).values({
                        id: data.user.id,
                        email: email,
                        fullName: fullName,
                        role: existingUser.role,
                        hasCompletedAffinity: existingUser.hasCompletedAffinity,
                    });

                    // c. Migrate kids
                    await db.update(psychologists)
                        .set({ userId: data.user.id })
                        .where(eq(psychologists.userId, existingUser.id));

                    await db.update(supportTickets)
                        .set({ userId: data.user.id })
                        .where(eq(supportTickets.userId, existingUser.id));

                    // d. Delete stub
                    await db.delete(users).where(eq(users.id, existingUser.id));
                }
            } else {
                // Regular registration for new users
                await db.insert(users).values({
                    id: data.user.id,
                    email: email,
                    fullName: fullName,
                    role: "patient", // Default for direct web registrations
                });
            }

            if (data.session) {
                const cookieStore = await cookies();
                cookieStore.set("session_id", data.session.access_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    maxAge: data.session.expires_in,
                    path: "/",
                });
                redirect("/patient/dashboard");
            } else {
                return { success: "Registro exitoso. Verifica tu email." };
            }
        }
    } catch (err) {
        if ((err as Error).message === "NEXT_REDIRECT") throw err;
        return { error: "Error en el registro" };
    }
}

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;
    if (!sessionId) return null;

    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(sessionId);
    if (error || !user) return null;

    return await db.query.users.findFirst({
        where: eq(users.id, user.id),
    });
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("session_id");
    redirect("/");
}

export async function updateProfile(fullName: string) {
    const user = await getCurrentUser();
    if (!user) return { error: "No autorizado" };

    try {
        await db.update(users).set({ fullName }).where(eq(users.id, user.id));
        return { success: "Perfil actualizado" };
    } catch (error) {
        return { error: "Error al actualizar" };
    }
}
