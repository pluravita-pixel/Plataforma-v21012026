import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { client } from "@/db";

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.session && data.user) {
            // Establecer Cookie de Sesión manual para compatibilidad con el resto de la app
            const cookieStore = await cookies();
            cookieStore.set("session_id", data.session.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: data.session.expires_in,
                path: "/",
                sameSite: "lax",
            });

            try {
                // Verificar si el usuario ya existe en nuestra base de datos
                const existingUser = await client`
                    SELECT id, role, has_pending_application as "hasPendingApplication"
                    FROM users 
                    WHERE id = ${data.user.id}::uuid 
                    LIMIT 1
                `;

                let userRole = 'usuario';
                let hasPendingApp = false;

                if (existingUser.length === 0) {
                    // Usuario nuevo - crear en la base de datos
                    const metadata = data.user.user_metadata;
                    const fullName = metadata?.full_name ||
                        metadata?.name ||
                        (metadata?.given_name && metadata?.family_name ? `${metadata.given_name} ${metadata.family_name}` : null) ||
                        metadata?.given_name ||
                        data.user.email?.split('@')[0] ||
                        'Usuario';

                    const userEmail = data.user.email || '';

                    await client`
                        INSERT INTO users (id, email, full_name, role, last_login)
                        VALUES (
                            ${data.user.id}::uuid, 
                            ${userEmail}::text, 
                            ${fullName}::text, 
                            'usuario', 
                            NOW()
                        )
                        ON CONFLICT (id) DO UPDATE 
                        SET last_login = NOW()
                    `;

                    userRole = 'usuario';
                } else {
                    // Usuario existente - actualizar last_login
                    await client`
                        UPDATE users 
                        SET last_login = NOW() 
                        WHERE id = ${data.user.id}::uuid
                    `;

                    userRole = existingUser[0].role;
                    hasPendingApp = existingUser[0].hasPendingApplication;
                }

                // Redirigir según el rol
                if (userRole === 'admin') {
                    return NextResponse.redirect(`${requestUrl.origin}/admin/dashboard`);
                } else if (userRole === 'oyente' || userRole === 'psychologist' || userRole === 'coach') {
                    // Actualizar last_login en tabla oyentes también
                    await client`
                        UPDATE oyentes 
                        SET last_login = NOW() 
                        WHERE user_id = ${data.user.id}::uuid
                    `;
                    return NextResponse.redirect(`${requestUrl.origin}/oyente/dashboard`);
                } else if (hasPendingApp) {
                    return NextResponse.redirect(`${requestUrl.origin}/registro-oyente`);
                }

                // Usuario normal
                return NextResponse.redirect(`${requestUrl.origin}/usuario/dashboard`);

            } catch (dbError) {
                console.error("Error en callback de Google OAuth:", dbError);
                // En caso de error, redirigir a dashboard de usuario por defecto
                return NextResponse.redirect(`${requestUrl.origin}/usuario/dashboard`);
            }
        }
    }

    // Si no hay código o hubo error, redirigir al login
    return NextResponse.redirect(`${requestUrl.origin}/login`);
}
