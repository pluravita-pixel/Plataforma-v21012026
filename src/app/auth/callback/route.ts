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
            console.log("OAuth Callback: Sesión obtenida para", data.user.email);

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
                // Sincronizar usuario con nuestra base de datos (Lógica unificada)
                const metadata = data.user.user_metadata;
                const fullName = metadata?.full_name ||
                    metadata?.name ||
                    (metadata?.given_name && metadata?.family_name ? `${metadata.given_name} ${metadata.family_name}` : null) ||
                    metadata?.given_name ||
                    data.user.email?.split('@')[0] ||
                    'Usuario';

                const userEmail = data.user.email || '';

                const syncResult = await client`
                    INSERT INTO users (id, email, full_name, role, last_login)
                    VALUES (${data.user.id}::uuid, ${userEmail}::text, ${fullName}::text, 'usuario', NOW())
                    ON CONFLICT (id) DO UPDATE 
                    SET last_login = NOW(),
                        email = EXCLUDED.email,
                        full_name = COALESCE(users.full_name, EXCLUDED.full_name)
                    RETURNING role, has_pending_application as "hasPendingApplication";
                `;

                const userInDb = syncResult[0];
                const userRole = userInDb?.role || 'usuario';
                const hasPendingApp = userInDb?.hasPendingApplication || false;

                console.log(`Usuario sincronizado: ${userEmail}, Rol: ${userRole}`);

                // Redirigir según el rol
                if (userRole === 'admin') {
                    return NextResponse.redirect(`${requestUrl.origin}/admin/dashboard`);
                } else if (['oyente', 'psychologist', 'coach'].includes(userRole)) {
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
                console.error("Error en DB durante callback de OAuth:", dbError);
                // En caso de error de DB, intentamos al menos llevarlo al dashboard
                return NextResponse.redirect(`${requestUrl.origin}/usuario/dashboard`);
            }
        } else if (error) {
            console.error("Error intercambiando código por sesión:", error.message);
        }
    }

    // Si no hay código o hubo error, redirigir al login
    return NextResponse.redirect(`${requestUrl.origin}/login`);
}
