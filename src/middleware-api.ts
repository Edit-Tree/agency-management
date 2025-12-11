import { NextResponse } from 'next/server'

export async function middleware(request: Request) {
    const timestamp = new Date().toISOString()
    const url = new URL(request.url)

    // Log all errors to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log(`[${timestamp}] ${request.method} ${url.pathname}`)
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/api/:path*',
}
