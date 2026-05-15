import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes that require authentication
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/levels',
  '/lesson',
  '/quiz',
  '/review',
  '/vocabulary/',
  '/verbs',
  '/profile',
  '/stats',
  '/achievements',
  '/placement-test',
]

// Auth-only routes (redirect to dashboard if already signed in)
const AUTH_ONLY_ROUTES = ['/login', '/signup', '/reset-password']

export async function proxy(request: NextRequest) {
  const result = await updateSession(request)

  // If env vars are not configured yet, skip auth checks and let all pages render
  // (useful during local dev before Supabase is wired up)
  if (!('user' in result)) {
    return result
  }

  const { response, user } = result
  const pathname = request.nextUrl.pathname

  // Redirect unauthenticated users away from protected routes
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth-only routes
  const isAuthOnly = AUTH_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route),
  )
  if (isAuthOnly && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|public/|audio/).*)',
  ],
}
