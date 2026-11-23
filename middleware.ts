import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  
  if (!session) {
    
    if (request.nextUrl.pathname.startsWith("/login")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // A page found the cookie expired or revoked (requireAuth): drop it and show the login page, instead of
  // bouncing between /login and /dashboard.
  if (
    request.nextUrl.pathname.startsWith("/login") &&
    request.nextUrl.searchParams.get("session") === "expired"
  ) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session");
    return response;
  }

  // 2. If session exists and user tries to access login, redirect to dashboard
  if (session && request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// 3. Define which routes this middleware should run on
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/login",
    "/exercises/:path*",
    "/programs/:path*"
  ],
};
