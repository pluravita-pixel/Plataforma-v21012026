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

            // Obtener el rol real del usuario desde la base de datos
            const userResult = await client`
                SELECT role, has_pending_application as "hasPendingApplication"
                FROM users 
                WHERE id = ${data.user.id}::uuid 
                LIMIT 1
            `;

            const user = userResult[0];

            if (user) {
                if (user.role === 'admin') {
                    return NextResponse.redirect(`${requestUrl.origin}/admin/dashboard`);
                } else if (user.role === 'oyente' || user.role === 'psychologist' || user.role === 'coach') {
                    return NextResponse.redirect(`${requestUrl.origin}/oyente/dashboard`);
                } else if (user.hasPendingApplication) {
                    return NextResponse.redirect(`${requestUrl.origin}/registro-oyente`);
                }
            }
        }
    }

    // Default redirect for usuarios or fallback
    return NextResponse.redirect(`${requestUrl.origin}/usuario/dashboard`);
}
