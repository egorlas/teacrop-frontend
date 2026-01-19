import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware to protect /staff/* routes
 * TODO: Replace cookie-based role check with JWT validation from httpOnly cookie
 * TODO: Integrate with real Strapi role schema
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /staff routes
  if (!pathname.startsWith("/staff")) {
    return NextResponse.next();
  }

  // Get role from cookie (temporary solution)
  // TODO: Replace with JWT validation from httpOnly cookie via route handler
  const role = request.cookies.get("role")?.value;
  
  // Check for auth-related cookies to detect if user is logged in
  // Check for Zustand persist storage cookie (auth-storage or staff-auth-storage)
  const authStorage = request.cookies.get("auth-storage")?.value;
  const staffAuthStorage = request.cookies.get("staff-auth-storage")?.value;
  
  // User is authenticated if they have role cookie OR auth storage cookie
  const isAuthenticated = !!role || !!authStorage || !!staffAuthStorage;

  // Explicitly flush console.log for Vercel/Node.js edge runtime
  // eslint-disable-next-line no-console
  console.log(`[middleware] Path: ${pathname} | Role: ${role || "none"} | Authenticated: ${isAuthenticated}`);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("[middleware] Not authenticated, redirecting to login");
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated but doesn't have staff/admin role, allow access for debugging
  // Don't redirect - keep the page accessible to debug
  if (role !== "staff" && role !== "admin") {
    console.log(`[middleware] DEBUG MODE: User authenticated (role: ${role || "none"}) but not staff/admin. Allowing access for debugging.`);
    // Continue to next() - no redirect, allow access for debugging
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
