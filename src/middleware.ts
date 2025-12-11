import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip middleware for static files and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    try {
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

        // Log to console in development (Edge Runtime compatible)
        if (process.env.NODE_ENV === 'development') {
            console.log(`[${new Date().toISOString()}] ${request.method} ${pathname} - User: ${token?.email || 'anonymous'}`)
        }

        // Public routes
        if (pathname === '/' || pathname === '/login') {
            return NextResponse.next()
        }

        // Protected routes
        if (!token) {
            console.log(`[AUTH] Unauthorized access to ${pathname}, redirecting to /login`)
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Dashboard routes - Admin and Team only
        if (pathname.startsWith('/dashboard')) {
            if (token.role === 'CLIENT') {
                console.log(`[AUTH] CLIENT tried to access dashboard, redirecting to /portal`)
                return NextResponse.redirect(new URL('/portal', request.url))
            }

            // Admin-only routes
            const adminOnlyRoutes = ['/dashboard/clients', '/dashboard/users', '/dashboard/invoices']
            if (adminOnlyRoutes.some(route => pathname.startsWith(route))) {
                if (token.role !== 'ADMIN') {
                    console.log(`[AUTH] ${token.role} tried to access admin-only route, redirecting to /dashboard`)
                    return NextResponse.redirect(new URL('/dashboard', request.url))
                }
            }

            return NextResponse.next()
        }

        // Portal routes - Client only
        if (pathname.startsWith('/portal')) {
            if (token.role !== 'CLIENT') {
                console.log(`[AUTH] ${token.role} tried to access portal, redirecting to /dashboard`)
                return NextResponse.redirect(new URL('/dashboard', request.url))
            }
            return NextResponse.next()
        }

        return NextResponse.next()
    } catch (error) {
        console.error(`[ERROR] Middleware error:`, error)
        return NextResponse.redirect(new URL('/login', request.url))
    }
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
