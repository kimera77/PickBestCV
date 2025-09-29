import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/actions";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always redirect from the root to the dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // You can re-enable auth checks later by uncommenting the code below.
  /*
  const user = await getCurrentUser();
  const publicRoutes = ["/", "/login", "/signup"];

  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!user && !publicRoutes.includes(pathname) && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  */

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
