// middleware.ts
import { NextResponse, NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check authentication
  const hasSession = request.cookies.has('appwrite-session')
  const hasUserId = request.cookies.has('user-id')
  const isAuthenticated = hasSession && hasUserId
  
  // Check profile completion
  const roleCookie = request.cookies.get('user-role')
  const hasProfile = !!roleCookie?.value
  const userRole = roleCookie?.value || 'reader'
  
  // ===== ABSOLUTE TRAP LOGIC =====
  
  // 1. If user is logged in but has NO profile
  if (isAuthenticated && !hasProfile) {
    // ONLY allow /profile/create - redirect EVERYTHING else to it
    if (pathname !== '/profile/create') {
      return NextResponse.redirect(new URL('/profile/create', request.url))
    }
    // If already on /profile/create, allow it
    return NextResponse.next()
  }
  
  // 2. If user tries to access /profile/create but already has profile
  if (pathname === '/profile/create' && isAuthenticated && hasProfile) {
    // Redirect based on their role
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    if (userRole === 'writer') {
      return NextResponse.redirect(new URL('/authDashboard/posts', request.url))
    }
    return NextResponse.redirect(new URL('/userDashboard/save', request.url))
  }
  
  // 3. Block unauthenticated access to protected routes
  if (!isAuthenticated) {
    const protectedRoutes = [
      '/dashboard',
      '/authDashboard', 
      '/userDashboard',
      '/profile',
      
    ]
    
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname.startsWith(route)
    )
    
    if (isProtectedRoute) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', encodeURI(pathname))
      return NextResponse.redirect(loginUrl)
    }
  }
  
  // 4. Role-based routing (only for users with profiles)
  if (hasProfile) {
    // Admin can't access writer/reader dashboards
    if (userRole === 'admin' && pathname.startsWith('/authDashboard')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Writer can't access reader dashboard
    if (userRole === 'writer' && pathname.startsWith('/userDashboard')) {
      return NextResponse.redirect(new URL('/authDashboard/posts', request.url))
    }
    
    // Reader can't access writer dashboard
    if (userRole === 'reader' && pathname.startsWith('/authDashboard')) {
      return NextResponse.redirect(new URL('/userDashboard/save', request.url))
    }
  }
  
  // If all checks pass, allow access
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Static routes
    '/dashboard/:path*',
    '/authDashboard/:path*',
    '/userDashboard/:path*',
    '/profile/:path*',
    '/profile/create',
    '/admin',
    '/login',
    
    // YOUR DYNAMIC ROUTE - INCLUDED
    '/category/:path*',           // ← THIS IS YOUR /category/slug-name ROUTE
    
    // Other common routes (add as needed)
    '/',
    '/about',
    '/contact',
    '/settings',
    '/privacy',
    '/terms',
    '/help',
    '/faq',
    '/category'
    
    // Add ALL other routes you have
    // If you have more dynamic routes, add them here:
    // '/blog/:path*',
    // '/post/:path*',
    // '/user/:path*',
  ],
}