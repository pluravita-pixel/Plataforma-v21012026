"use server";

import { client } from "@/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Función interna para asegurar que un usuario de Supabase Auth existe en nuestra tabla 'users'.
 * Centraliza la lógica de creación/actualización para evitar duplicidades.
 */
async function syncUser(supabaseUser: any) {
    const fullName = supabaseUser.user_metadata?.full_name ||
        supabaseUser.user_metadata?.name ||
        supabaseUser.email?.split('@')[0] ||
        'Usuario';
    const email = supabaseUser.email || '';

    const usersResult = await client`
        INSERT INTO users (id, email, full_name, role, last_login)
        VALUES (${supabaseUser.id}::uuid, ${email}::text, ${fullName}::text, 'usuario', NOW())
        ON CONFLICT (id) DO UPDATE 
        SET last_login = NOW(),
            email = EXCLUDED.email,
            full_name = COALESCE(users.full_name, EXCLUDED.full_name)
        RETURNING role, has_pending_application as "hasPendingApplication";
    `;
    return usersResult[0];
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error || !data.session) return { error: "Credenciales inválidas" };

        const cookieStore = await cookies();
        cookieStore.set("session_id", data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: data.session.expires_in,
            path: "/",
            sameSite: "lax",
        });

        const user = await syncUser(data.user);
        let redirectPath = "/usuario/dashboard";

        if (user) {
            if (['oyente', 'psychologist', 'coach'].includes(user.role)) {
                await client`UPDATE oyentes SET last_login = NOW() WHERE user_id = ${data.user.id}::uuid`;
                redirectPath = "/oyente/dashboard";
            } else if (user.role === 'admin') {
                redirectPath = "/admin/dashboard";
            } else if (user.hasPendingApplication) {
                redirectPath = "/registro-oyente";
            } else {
                const acceptedApp = await client`
                    SELECT id FROM oyente_solicitudes 
                    WHERE user_id = ${data.user.id}::uuid AND status = 'accepted'
                    LIMIT 1
                `;
                if (acceptedApp.length > 0) redirectPath = "/oyente/dashboard";
            }
        }
        redirect(redirectPath);
    } catch (err) {
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) throw err;
        console.error("Error en login:", err);
        return { error: "Error del sistema al iniciar sesión" };
    }
}

export async function register(prevState: any, formData: FormData) {
    const email = (formData.get("email") as string).toLowerCase().trim();
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const isOyenteApplication = formData.get("role") === "oyente" || formData.get("role") === "coach";

    try {
        const existingInDb = await client`SELECT id, role, has_pending_application as "hasPendingApplication" FROM users WHERE email = ${email} LIMIT 1`;

        if (existingInDb.length > 0) {
            const user = existingInDb[0];
            if (user.role === 'oyente' || user.role === 'psychologist' || user.role === 'coach' || user.hasPendingApplication) {
                return { error: "Este correo ya está registrado como Oyente o tiene una solicitud pendiente." };
            }
            if (isOyenteApplication) {
                return { error: "Ya tienes una cuenta de usuario. Por favor, inicia sesión y completa tu perfil de Oyente." };
            }
            return { error: "Este correo electrónico ya está registrado. Por favor, inicia sesión." };
        }

        const supabase = await createClient();
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
                data: { full_name: fullName, is_oyente_application: isOyenteApplication }
            }
        });

        if (error) {
            if (error.message.includes("already registered") || error.status === 400) {
                return { error: "Este correo electrónico ya está registrado. Por favor, inicia sesión." };
            }
            return { error: error.message };
        }

        if (data.user) {
            await syncUser(data.user);

            if (isOyenteApplication) {
                const ticketMessage = `El usuario ${fullName} (${email}) se ha registrado y desea ser Oyente.`;
                await client`
                    INSERT INTO support_tickets (user_id, subject, message, status)
                    VALUES (${data.user.id}::uuid, 'Nueva solicitud de Oyente', ${ticketMessage}::text, 'open')
                `;
            }

            if (data.session) {
                const cookieStore = await cookies();
                cookieStore.set("session_id", data.session.access_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    maxAge: data.session.expires_in,
                    path: "/",
                });
                redirect(isOyenteApplication ? "/registro-oyente" : "/usuario/dashboard");
            }
            return { success: "Registro exitoso. Revisa tu email para confirmar tu cuenta." };
        }
    } catch (err: any) {
        if (err.message?.includes("NEXT_REDIRECT")) throw err;
        console.error("Error en registro:", err);
        return { error: "Error del sistema en el registro" };
    }
}

export async function logout() {
    try {
        const cookieStore = await cookies();
        cookieStore.set("session_id", "", { path: "/", maxAge: 0 });
        const supabase = await createClient();
        await supabase.auth.signOut();
    } catch (error) {
        console.error("Logout error:", error);
    }
    redirect("/");
}

export async function getCurrentUser() {
    try {
        const supabase = await createClient();
        let { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            const cookieStore = await cookies();
            const sessionId = cookieStore.get("session_id")?.value;
            if (sessionId) {
                const { data: { user: fallbackUser } } = await supabase.auth.getUser(sessionId);
                user = fallbackUser;
            }
        }

        if (!user) return null;
        return await fetchUserData(user.id);
    } catch (e: any) {
        if (e.digest === 'DYNAMIC_SERVER_USAGE' || e.message?.includes('Dynamic server usage')) throw e;
        return null;
    }
}

async function fetchUserData(userId: string) {
    try {
        const result = await client`
            SELECT id, email, full_name as "fullName", phone, role, last_login as "lastLogin",
                   has_completed_affinity as "hasCompletedAffinity", created_at as "createdAt"
            FROM users WHERE id = ${userId}::uuid LIMIT 1
        `;

        if (result.length > 0) return result[0];

        // Fallback: Si no está en DB pero el token es válido, sincronizar
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.id === userId) return await syncUser(user);

        return null;
    } catch (err) {
        return null;
    }
}

export async function signInWithGoogle() {
    const supabase = await createClient();
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectTo = `${origin.replace(/\/$/, "")}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: redirectTo,
            queryParams: { access_type: 'offline', prompt: 'consent' },
        },
    });
    if (error) throw error;
    if (data.url) redirect(data.url);
}

export async function checkUserExists(email: string) {
    try {
        const result = await client`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
        return result.length > 0;
    } catch (error) {
        return false;
    }
}

export async function updateProfile(fullName: string) {
    const user = await getCurrentUser();
    if (!user) return { error: "No autorizado" };
    await client`UPDATE users SET full_name = ${fullName} WHERE id = ${user.id}::uuid`;
    return { success: "Actualizado" };
}

export async function markTestAsCompleted() {
    const user = await getCurrentUser();
    if (!user) return { error: "No autorizado" };
    await client`UPDATE users SET has_completed_affinity = true WHERE id = ${user.id}::uuid`;
    return { success: true };
}

export async function resetPassword(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });
    if (error) return { error: error.message };
    return { success: "Se ha enviado un enlace a tu correo." };
}
