import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/actions";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = await getCurrentUser();
  const publicRoutes = ["/login", "/signup"];

  // Always redirect from the root to the login page if not authenticated, or dashboard if authenticated
  if (pathname === '/') {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (user && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!user && !publicRoutes.includes(pathname) && !pathname.startsWith('/api')) {
     if (pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL("/login", request.url));
     }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
