"use server";

import { client } from "@/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    let authError = null;
    let redirectPath = null;

    try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            authError = "Credenciales inválidas";
        } else if (data.session) {
            const cookieStore = await cookies();
            cookieStore.set("session_id", data.session.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: data.session.expires_in,
                path: "/",
                sameSite: "lax",
            });

            try {
                const usersResult = await client`
                    UPDATE users 
                    SET last_login = NOW() 
                    WHERE id = ${data.user.id}::uuid 
                    RETURNING role, has_pending_application as "hasPendingApplication"
                `;

                const user = usersResult[0];

                if (!user) {
                    console.error("Usuario autenticado pero no encontrado en tabla users DB");
                    redirectPath = "/usuario/dashboard";
                } else {
                    if (user.role === 'oyente' || user.role === 'psychologist' || user.role === 'coach') {
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

                        if (acceptedApp.length > 0) {
                            redirectPath = "/oyente/dashboard";
                        } else {
                            redirectPath = "/usuario/dashboard";
                        }
                    }
                }
            } catch (dbError) {
                console.error("Error crítico de base de datos al login:", dbError);
                redirectPath = "/usuario/dashboard";
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

export async function register(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const role = formData.get("role") as string || "usuario";

    try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) return { error: error.message };

        if (data.user) {
            await client`
                INSERT INTO users (id, email, full_name, role)
                VALUES (${data.user.id}::uuid, ${email}, ${fullName}, ${role})
            `;
        }

        return { success: "Cuenta creada. Por favor, verifica tu correo." };
    } catch (err) {
        console.error("Error en registro:", err);
        return { error: "Error al crear la cuenta" };
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("session_id");
    redirect("/login");
}

export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get("session_id")?.value;
        if (!sessionId) return null;

        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser(sessionId);

        if (error || !user) return null;

        const result = await client`
            SELECT 
                id, 
                email, 
                full_name as "fullName", 
                phone, 
                role, 
                last_login as "lastLogin",
                has_completed_affinity as "hasCompletedAffinity",
                created_at as "createdAt"
            FROM users 
            WHERE id = ${user.id}::uuid
            LIMIT 1
        `;

        if (result.length === 0) return null;

        return {
            id: result[0].id,
            email: result[0].email,
            fullName: result[0].fullName,
            phone: result[0].phone,
            role: result[0].role,
            lastLogin: result[0].lastLogin,
            hasCompletedAffinity: result[0].hasCompletedAffinity,
            createdAt: result[0].createdAt
        };
    } catch (e: any) {
        if (e.digest === 'DYNAMIC_SERVER_USAGE' || (e.message && e.message.includes('Dynamic server usage'))) {
            throw e;
        }
        console.error("Error getting current user:", e);
        return null;
    }
}

export async function signInWithGoogle() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
    });

    if (error) throw error;
    if (data.url) redirect(data.url);
}

export async function checkUserExists(email: string) {
    const result = await client`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    return result.length > 0;
}
