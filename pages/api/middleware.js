import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { ADMIN_DISCORD_ID, ADMIN_EMAIL } from "../../lib/constants";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const pathname = req.nextUrl.pathname.replace(/\/$/, "");

  // PUBLIC ROUTES
  if (
    pathname === "/" ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // If no token at all, redirect to home
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ADMIN CHECK
  // Allow if either Discord ID or email matches
  const isAdmin =
    token.sub === ADMIN_DISCORD_ID || (token.email && token.email === ADMIN_EMAIL);

  // Admin-only pages
  const adminPages = ["/select"];
  if (adminPages.includes(pathname) && !isAdmin) {
    // Non-admins go to advanced status
    return NextResponse.redirect(new URL("/advanced-status", req.url));
  }

  // Everyone else allowed
  return NextResponse.next();
}

export const config = {
  matcher: ["/select", "/advanced-status", "/"],
};
