import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/actions";

export async function middleware(request: NextRequest) {
  const user = await getCurrentUser();
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/", "/login", "/signup"];

  // If user is logged in and tries to access login/signup, redirect to dashboard
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is not logged in and tries to access a protected route, redirect to login
  /*
  if (!user && !publicRoutes.includes(pathname) && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  */
  
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
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
