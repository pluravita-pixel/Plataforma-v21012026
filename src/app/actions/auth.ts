"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { client } from "@/db"; // Importamos el cliente directo, NO Drizzle
import { cache } from "react";

// Helper para cliente Supabase
// Singleton pattern for Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null;

const getSupabase = () => {
    if (supabaseInstance) return supabaseInstance;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        if (process.env.NODE_ENV === "production" && !process.env.NEXT_PHASE?.includes("build")) {
            console.error("Supabase keys missing at runtime!");
        }
        return createClient(url || "https://placeholder.supabase.co", key || "placeholder");
    }

    supabaseInstance = createClient(url, key);
    return supabaseInstance;
};

export async function login(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = getSupabase();

    let redirectPath: string | null = null;
    let authError: string | null = null;

    try {
        // 1. Autenticación con Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("Supabase Auth Error:", error.message);
            if (error.message.includes("Email not confirmed")) {
                return { error: "Debes confirmar tu correo electrónico." };
            }
            return { error: "Credenciales incorrectas." };
        }

        if (data.session && data.user) {
            // 2. Establecer Cookie de Sesión - Non-blocking if possible (but we need it for next steps potentially)
            const cookieStore = await cookies();
            cookieStore.set("session_id", data.session.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: data.session.expires_in,
                path: "/",
            });

            // 3. Obtener Rol y Actualizar last_login en UNA SOLA consulta
            try {
                const usersResult = await client`
                    UPDATE users 
                    SET last_login = NOW() 
                    WHERE id = ${data.user.id} 
                    RETURNING role
                `;

                const user = usersResult[0];

                if (!user) {
                    console.error("Usuario autenticado pero no encontrado en tabla users DB");
                    redirectPath = "/patient/dashboard";
                } else {
                    // Lógica de Redirección
                    if (user.role === 'admin') {
                        redirectPath = "/admin/dashboard";
                    } else if (user.role === 'psychologist') {
                        // Actualizamos psicólogos de forma asíncrona (opcionalmente) o rápida
                        // Aquí lo mantenemos para asegurar consistencia, pero es una sola query ahora.
                        await client`
                            UPDATE psychologists SET last_login = NOW() WHERE user_id = ${data.user.id}
                        `;
                        redirectPath = "/psychologist/dashboard";
                    } else {
                        redirectPath = "/patient/dashboard";
                    }
                }

            } catch (dbError) {
                console.error("Error crítico de base de datos al login:", dbError);
                redirectPath = "/patient/dashboard";
            }
        }
    } catch (err) {
        console.error("Error inesperado en login:", err);
        authError = "Error del systema al iniciar sesión";
    }

    if (authError) return { error: authError };
    if (redirectPath) redirect(redirectPath);
    return { error: "No se pudo iniciar sesión." };
}

export const getCurrentUser = cache(async () => {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;
    if (!sessionId) return null;

    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(sessionId);

    if (error || !user) return null;

    try {
        // Fetch raw user data
        const result = await client`
            SELECT 
                id, 
                email, 
                full_name as "fullName", 
                phone, 
                role, 
                last_login as "lastLogin",
                has_completed_affinity as "hasCompletedAffinity"
            FROM users 
            WHERE id = ${user.id} 
            LIMIT 1
        `;

        return result[0] || null;
    } catch (e) {
        console.error("Error getting current user:", e);
        return null;
    }
});

export async function logout() {
    try {
        const cookieStore = await cookies();
        // Clear cookie explicitly with path and maxAge 0
        cookieStore.set("session_id", "", {
            path: "/",
            maxAge: 0,
            expires: new Date(0),
        });

        const supabase = getSupabase();
        await supabase.auth.signOut();
    } catch (error) {
        console.error("Logout error:", error);
    }

    // Redirect must be outside try/catch or re-thrown if it's a "NEXT_REDIRECT" error
    redirect("/");
}

// Mantenemos register simplificado también
export async function register(prevState: any, formData: FormData) {
    const email = (formData.get("email") as string).toLowerCase().trim();
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const isCoachApplication = formData.get("role") === "coach";
    const supabase = getSupabase();

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } }
        });

        if (error) return { error: error.message };

        if (data.user) {
            // Check if user exists (Pre-seeded by Admin)
            const existing = await client`SELECT * FROM users WHERE email = ${email} LIMIT 1`;

            let role = 'patient';

            if (existing.length > 0) {
                // User was pre-registered by admin
                const oldUser = existing[0];
                role = oldUser.role;

                if (oldUser.id !== data.user.id) {
                    await client`
                        UPDATE users 
                        SET id = ${data.user.id},
                            full_name = ${fullName || oldUser.full_name}
                        WHERE id = ${oldUser.id}
                    `;

                    if (role === 'psychologist') {
                        await client`
                            UPDATE psychologists 
                            SET user_id = ${data.user.id},
                                full_name = ${fullName || oldUser.full_name}
                            WHERE user_id = ${oldUser.id}
                        `;
                    }
                }
            } else {
                // New User Registration
                await client`
                    INSERT INTO users (id, email, full_name, role)
                    VALUES (${data.user.id}, ${email}, ${fullName}, 'patient')
                `;

                // If it's a coach application, create a support ticket for admin
                if (isCoachApplication) {
                    await client`
                        INSERT INTO support_tickets (user_id, subject, message, status)
                        VALUES (${data.user.id}, 'Nueva solicitud de Coach', 'El usuario ${fullName} (${email}) se ha registrado y desea ser Coach. Aquí les aceptará este psicólogo. Una vez verificado, cambie su rol a "psychologist" en la sección de usuarios.', 'open')
                    `;
                }
            }

            // Determine Success Message / Redirect
            if (isCoachApplication) {
                return { success: "¡Registro de coach recibido! Un administrador revisará tu solicitud. En un plazo de 24 a 72 horas recibirás una respuesta." };
            }

            // Auto-login if session exists
            if (data.session) {
                const cookieStore = await cookies();
                cookieStore.set("session_id", data.session.access_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    maxAge: data.session.expires_in,
                    path: "/",
                });

                if (role === 'psychologist') redirect("/psychologist/dashboard");
                if (role === 'admin') redirect("/admin/dashboard");
                redirect("/patient/dashboard");
            } else {
                return { success: "Registro exitoso. Revisa tu email para confirmar tu cuenta." };
            }
        }
    } catch (err: any) {
        if (err.message?.includes("NEXT_REDIRECT")) throw err;
        console.error("Error crítico en proceso de registro:", err);
        return { error: `Error del sistema: ${err instanceof Error ? err.message : "Error desconocido"}` };
    }
}

// Funciones dummy para mantener compatibilidad si se importan en otros lados, 
// pero idealmente no se deberían usar si no son críticas.
export async function loginAnonymously() {
    // Implementación simplificada si hiciera falta
    return { error: "Deshabilitado temporalmente" };
}

export async function updateProfile(fullName: string) {
    const user = await getCurrentUser();
    if (!user) return { error: "No autorizado" };
    await client`UPDATE users SET full_name = ${fullName} WHERE id = ${user.id}`;
    return { success: "Actualizado" };
}

export async function checkUserExists(email: string) {
    try {
        const result = await client`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
        return result.length > 0;
    } catch (error) {
        console.error("Error checking user existence:", error);
        return false;
    }
}

export async function markTestAsCompleted() {
    const user = await getCurrentUser();
    if (!user) return { error: "No autorizado" };

    try {
        await client`
            UPDATE users 
            SET has_completed_affinity = true 
            WHERE id = ${user.id}
        `;
        return { success: true };
    } catch (error: any) {
        console.error("Error marking test as completed:", error);
        return { error: error.message };
    }
}

export async function resetPassword(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const supabase = getSupabase();

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
        });

        if (error) {
            return { error: error.message };
        }

        return { success: "Se ha enviado un enlace a tu correo para restablecer tu contraseña." };
    } catch (err) {
        console.error("Error en resetPassword:", err);
        return { error: "Error al intentar restablecer la contraseña." };
    }
}

