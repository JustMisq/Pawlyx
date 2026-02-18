import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { initSentry, setUserContext, clearUserContext } from '@/lib/sentry'

// Initialize Sentry on first middleware call
let sentryInitialized = false

/**
 * Middleware pour:
 * - Protection des routes (auth + admin)
 * - Headers de sécurité
 * - Sentry user context
 */

// Routes qui nécessitent une authentification
const protectedRoutes = ['/dashboard', '/api/salon', '/api/clients', '/api/animals', '/api/appointments', '/api/services', '/api/inventory', '/api/invoices', '/api/stats', '/api/support', '/api/reminders', '/api/export', '/api/delete', '/api/stock-sales']
// Routes admin
const adminRoutes = ['/admin', '/api/admin']

export async function middleware(request: NextRequest) {
  // Initialize Sentry once
  if (!sentryInitialized) {
    initSentry()
    sentryInitialized = true
  }

  const { pathname } = request.nextUrl

  // Skip pour les assets et fichiers statiques
  if (pathname.startsWith('/_next') || pathname.startsWith('/static')) {
    return NextResponse.next()
  }

  // Get session token
  let token: any = null
  try {
    token = await getToken({ req: request })
    if (token?.sub) {
      setUserContext(token.sub, token.email || undefined, token.name || undefined)
    } else {
      clearUserContext()
    }
  } catch (error) {
    clearUserContext()
  }

  // ✅ SÉCURITÉ: Protection des routes authentifiées
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  if (isProtectedRoute && !token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ✅ SÉCURITÉ: Protection des routes admin côté serveur
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  if (isAdminRoute && (!token || !token.isAdmin)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ✅ SÉCURITÉ: Vérifier que l'utilisateur n'est pas suspendu (invalidated token)
  if (token?.invalidated) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ message: 'Session expired' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // ✅ SÉCURITÉ: Ajouter les headers de sécurité
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
}

export const config = {
  matcher: [
    // Exclure les chemins statiques
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
