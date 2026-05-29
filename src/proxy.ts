import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Skip proxy for public paths
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }
  
  // Get the session token
  const token = await getToken({ req })
  
  // Redirect to login if no token found
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  // Redirect logged-in users away from login page
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};