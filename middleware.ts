import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'spark_session'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect /admin routes — require session cookie to exist
  // Full role verification happens server-side in each API route and client-side in admin layout
  if (pathname.startsWith('/admin')) {
    const sessionId = req.cookies.get(SESSION_COOKIE)?.value
    if (!sessionId) {
      return NextResponse.redirect(new URL('/login?next=/admin', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
