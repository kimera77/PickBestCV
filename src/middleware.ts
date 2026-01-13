import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session");
  const publicRoutes = ["/login", "/signup"];

  const isPublicRoute = publicRoutes.includes(pathname);

  // If trying to access a public route but session exists, redirect to dashboard
  if (isPublicRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If trying to access a protected route and no session, redirect to login
  if (!isPublicRoute && !sessionCookie && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If at root, decide where to go based on session
  if (pathname === '/') {
    if (sessionCookie) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
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
