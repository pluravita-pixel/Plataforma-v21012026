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
                let usersResult = await client`
                    UPDATE users 
                    SET last_login = NOW() 
                    WHERE id = ${data.user.id}::uuid 
                    RETURNING role, has_pending_application as "hasPendingApplication"
                `;

                let user = usersResult[0];

                if (!user) {
                    console.warn("Usuario autenticado pero no encontrado en tabla users. Creando registro básico...");
                    try {
                        const fullName = data.user.user_metadata?.full_name || 'Usuario';
                        const userEmail = data.user.email || '';
                        await client`
                            INSERT INTO users (id, email, full_name, role)
                            VALUES (${data.user.id}::uuid, ${userEmail}::text, ${fullName}::text, 'usuario')
                            ON CONFLICT (id) DO UPDATE SET last_login = NOW()
                        `;
                        user = { role: 'usuario', hasPendingApplication: false };
                    } catch (insErr) {
                        console.error("Error al crear registro de usuario faltante:", insErr);
                    }
                }

                if (user) {
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
                } else {
                    redirectPath = "/usuario/dashboard";
                }
            } catch (dbError) {
                console.error("Error crítico de base de datos al login:", dbError);
                redirectPath = "/usuario/dashboard";
            }
        }
    } catch (err) {
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) throw err;
        console.error("Error inesperado en login:", err);
        authError = "Error del sistema al iniciar sesión";
    }

    if (authError) return { error: authError };
    if (redirectPath) redirect(redirectPath);
    return { error: "No se pudo iniciar sesión." };
}

export async function register(prevState: any, formData: FormData) {
    const email = (formData.get("email") as string).toLowerCase().trim();
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const isOyenteApplication = formData.get("role") === "oyente" || formData.get("role") === "coach";

    try {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
                data: {
                    full_name: fullName,
                    is_oyente_application: isOyenteApplication
                }
            }
        });

        if (error) return { error: error.message };

        if (data.user) {
            const existing = await client`SELECT * FROM users WHERE email = ${email} LIMIT 1`;

            let role = 'usuario';

            if (existing.length > 0) {
                const oldUser = existing[0];
                role = oldUser.role;

                if (oldUser.id !== data.user.id) {
                    await client`
                        UPDATE users 
                        SET id = ${data.user.id}::uuid,
                            full_name = ${fullName || oldUser.full_name}
                        WHERE id = ${oldUser.id}::uuid
                    `;

                    if (role === 'oyente' || role === 'psychologist' || role === 'coach') {
                        await client`
                            UPDATE oyentes 
                            SET user_id = ${data.user.id}::uuid,
                                full_name = ${fullName || oldUser.full_name}
                            WHERE user_id = ${oldUser.id}::uuid
                        `;
                    }
                }
            } else {
                await client`
                    INSERT INTO users (id, email, full_name, role)
                    VALUES (${data.user.id}::uuid, ${email}::text, ${fullName}::text, 'usuario')
                `;

                if (isOyenteApplication) {
                    const ticketMessage = `El usuario ${fullName} (${email}) se ha registrado y desea ser Oyente. Verifique su perfil.`;
                    await client`
                        INSERT INTO support_tickets (user_id, subject, message, status)
                        VALUES (${data.user.id}::uuid, 'Nueva solicitud de Oyente', ${ticketMessage}::text, 'open')
                    `;
                }
            }

            if (isOyenteApplication) {
                const cookieStore = await cookies();
                cookieStore.set("session_id", data.session?.access_token || "", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    maxAge: data.session?.expires_in || 3600,
                    path: "/",
                });
                redirect("/registro-oyente");
            }

            if (data.session) {
                const cookieStore = await cookies();
                cookieStore.set("session_id", data.session.access_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    maxAge: data.session.expires_in,
                    path: "/",
                });

                if (role === 'oyente' || role === 'psychologist' || role === 'coach') redirect("/oyente/dashboard");
                if (role === 'admin') redirect("/admin/dashboard");
                redirect("/usuario/dashboard");
            } else {
                return { success: "Registro exitoso. Revisa tu email para confirmar tu cuenta." };
            }
        }
    } catch (err: any) {
        if (err.message?.includes("NEXT_REDIRECT")) throw err;
        console.error("Error crítico en proceso de registro:", err);
        return { error: `Error del sistema: ${err instanceof Error ? err.message : "Error desconocido"}` };
    }
    return { error: "Error desconocido en registro" };
}

export async function logout() {
    try {
        const cookieStore = await cookies();
        cookieStore.set("session_id", "", {
            path: "/",
            maxAge: 0,
            expires: new Date(0),
        });

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
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            const cookieStore = await cookies();
            const sessionId = cookieStore.get("session_id")?.value;
            if (!sessionId) return null;

            const { data: { user: fallbackUser }, error: fallbackError } = await supabase.auth.getUser(sessionId);
            if (fallbackError || !fallbackUser) return null;
            return await fetchUserData(fallbackUser.id);
        }

        return await fetchUserData(user.id);
    } catch (e: any) {
        if (e.digest === 'DYNAMIC_SERVER_USAGE' || (e.message && e.message.includes('Dynamic server usage'))) {
            throw e;
        }
        console.error("Error getting current user:", e);
        return null;
    }
}

async function fetchUserData(userId: string) {
    try {
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
            WHERE id = ${userId}::uuid
            LIMIT 1
        `;

        if (result.length > 0) {
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
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user && user.id === userId) {
            const fullName = user.user_metadata?.full_name || user.user_metadata?.name || 'Usuario';
            const userEmail = user.email || '';
            await client`
                INSERT INTO users (id, email, full_name, role)
                VALUES (${user.id}::uuid, ${userEmail}::text, ${fullName}::text, 'usuario')
                ON CONFLICT (id) DO NOTHING
            `;

            return {
                id: user.id,
                email: user.email,
                fullName: fullName,
                role: 'usuario',
                hasCompletedAffinity: false,
                createdAt: new Date()
            };
        }

        return null;
    } catch (err) {
        console.error("Error fetching user data from DB:", err);
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
    try {
        const result = await client`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
        return result.length > 0;
    } catch (error) {
        console.error("Error checking user existence:", error);
        return false;
    }
}

export async function loginAnonymously() {
    return { error: "Deshabilitado temporalmente" };
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

    try {
        await client`
            UPDATE users 
            SET has_completed_affinity = true 
            WHERE id = ${user.id}::uuid
        `;
        return { success: true };
    } catch (error: any) {
        console.error("Error marking test as completed:", error);
        return { error: error.message };
    }
}

export async function resetPassword(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    try {
        const supabase = await createClient();
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
