import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    })

    const { pathname } = request.nextUrl

    // Protect API routes
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
      if (!token) {
        return new NextResponse("Unauthorized", { status: 401 })
      }
    }

    // Protect Dashboard routes
    if (pathname.startsWith('/dashboard')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      }
    }

    // Handle auth routes
    if (pathname.startsWith('/auth/')) {
      if (token) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/auth/error', request.url))
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
    '/api/:path*'
  ]
} 