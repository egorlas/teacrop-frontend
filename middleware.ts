import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware to protect /staff/* routes
 * Only allow staff/admin roles
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /staff routes
  if (!pathname.startsWith("/staff")) {
    return NextResponse.next();
  }

  // Get role from cookie (temporary solution)
  const role = request.cookies.get("role")?.value;

  // Check for auth-related cookies to detect if user is logged in
  const authStorage = request.cookies.get("auth-storage")?.value;
  const staffAuthStorage = request.cookies.get("staff-auth-storage")?.value;

  // User is authenticated if they have role cookie OR auth storage cookie
  const isAuthenticated = !!role || !!authStorage || !!staffAuthStorage;

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated but doesn't have staff/admin role, block access
  if (role !== "staff" && role !== "admin") {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/staff/:path*",
    // Exclude API routes, static files, and Next.js internals
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
