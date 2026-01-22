"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { client } from "@/db"; // Importamos el cliente directo, NO Drizzle

// Helper para cliente Supabase
const getSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key || url.includes("placeholder")) {
        console.error("CRITICAL: Supabase environment variables are missing!");
        throw new Error("Configuración del servidor incompleta (Supabase URL/Key missing)");
    }

    return createClient(url, key);
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
            // 2. Establecer Cookie de Sesión
            const cookieStore = await cookies();
            cookieStore.set("session_id", data.session.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: data.session.expires_in,
                path: "/",
            });

            // 3. Obtener Rol del Usuario (SQL DIRECTO)
            try {
                // Actualizamos last_login
                await client`
                    UPDATE users SET last_login = NOW() WHERE id = ${data.user.id}
                `;

                // Obtenemos el rol
                const usersResult = await client`
                    SELECT role FROM users WHERE id = ${data.user.id} LIMIT 1
                `;
                const user = usersResult[0];

                if (!user) {
                    console.error("Usuario autenticado pero no encontrado en tabla users DB");
                    // Fallback: intentar crearlo o enviarlo a patient
                    redirectPath = "/patient/dashboard";
                } else {
                    // Lógica de Redirección Simple
                    if (user.role === 'admin') {
                        redirectPath = "/admin/dashboard";
                    } else if (user.role === 'psychologist') {
                        // Actualizar tabla psicólogos también
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
                // Si falla la DB pero el login es correcto, mandamos al dashboard de paciente por defecto
                // para no bloquear al usuario, aunque verá datos vacíos.
                redirectPath = "/patient/dashboard";
            }
        }
    } catch (err) {
        console.error("Error inesperado en login:", err);
        authError = "Error del sistema al iniciar sesión";
    }

    if (authError) return { error: authError };
    if (redirectPath) redirect(redirectPath);
    return { error: "No se pudo iniciar sesión." };
}

export async function getCurrentUser() {
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
}

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
                role = oldUser.role; // Preserve the pre-assigned role (psychologist/admin)

                // Sync the pre-seeded user ID with the new Supabase Auth ID
                // This preserves relationships handling ON UPDATE CASCADE automatically
                if (oldUser.id !== data.user.id) {
                    try {
                        await client`
                            UPDATE users 
                            SET id = ${data.user.id},
                                full_name = ${fullName || oldUser.full_name}
                            WHERE id = ${oldUser.id}
                        `;

                        // If this is a psychologist, also update the psychologist profile
                        if (role === 'psychologist') {
                            await client`
                                UPDATE psychologists 
                                SET user_id = ${data.user.id},
                                    full_name = ${fullName || oldUser.full_name}
                                WHERE user_id = ${oldUser.id}
                            `;
                        }
                    } catch (migrationError) {
                        console.error("Error migrating user ID:", migrationError);
                        // Fallback mostly for safety, though update is preferred
                    }
                }
            } else {
                // New User Registration (not pre-registered)
                await client`
                    INSERT INTO users (id, email, full_name, role)
                    VALUES (${data.user.id}, ${email}, ${fullName}, 'patient')
                `;
            }

            // Auto-login
            if (data.session) {
                const cookieStore = await cookies();
                cookieStore.set("session_id", data.session.access_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    maxAge: data.session.expires_in,
                    path: "/",
                });

                // Determine redirect based on role
                if (role === 'psychologist') {
                    redirect("/psychologist/dashboard");
                } else if (role === 'admin') {
                    redirect("/admin/dashboard");
                } else {
                    redirect("/patient/dashboard");
                }
            } else {
                return { success: "Registro exitoso. Revisa tu email." };
            }
        }
    } catch (err: any) {
        if (err.message?.includes("NEXT_REDIRECT")) throw err;
        console.error("Error crítico en proceso de registro:", err);

        // Return a more descriptive error if possible
        const errorMessage = err instanceof Error ? err.message : "Error desconocido";
        return { error: `Error del sistema: ${errorMessage}` };
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

