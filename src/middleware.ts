import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = request.cookies.get("session_id")?.value;

    const protectedPaths = ['/admin', '/psychologist', '/patient'];
    const isProtected = protectedPaths.some(path => pathname.startsWith(path));

    if (isProtected && !session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
