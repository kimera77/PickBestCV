import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = 
    pathname === '/' || 
    pathname.startsWith('/login') || 
    pathname.startsWith('/signup') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico';
  
  // Allow access to public paths without authentication
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // TEMPORAL: Allow dashboard access without session cookie
  // Firebase Auth is client-side only for now
  // TODO: Implement proper session cookies with Firebase Auth
  return NextResponse.next();
  
  /* DISABLED - Cookie validation
  // Protected routes (dashboard and any other authenticated routes)
  const sessionCookie = request.cookies.get("session")?.value;
  
  // If no session cookie, redirect to login
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    // Add return URL to redirect back after login
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Session cookie exists, allow access
  // Note: Full validation happens in server components/actions for security
  return NextResponse.next();
  */
}

export const config = {
  // Only run middleware on dashboard routes and other protected paths
  matcher: [
    "/dashboard/:path*",
    // Add other protected routes here as needed
  ],
};
