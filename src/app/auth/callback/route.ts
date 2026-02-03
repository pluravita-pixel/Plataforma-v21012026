import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { client } from "@/db";

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
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
                } else if (user.role === 'psychologist') {
                    return NextResponse.redirect(`${requestUrl.origin}/psychologist/dashboard`);
                } else if (user.hasPendingApplication) {
                    return NextResponse.redirect(`${requestUrl.origin}/coach-onboarding`);
                }
            }
        }
    }

    // Default redirect for patients or fallback
    return NextResponse.redirect(`${requestUrl.origin}/patient/dashboard`);
}

