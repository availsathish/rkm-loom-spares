import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/auth'

export async function middleware(request: NextRequest) {
    // Check for session
    const session = request.cookies.get('session')?.value

    // If no session and trying to access dashboard, redirect to login
    if (!session && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/api/auth')) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // If session exists and trying to access login, redirect to dashboard
    if (session && request.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (logo.jpg, uploads)
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico|logo.jpg|uploads).*)',
    ],
}
