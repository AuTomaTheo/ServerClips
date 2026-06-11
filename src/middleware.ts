import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  if (pathname.startsWith("/creator") || pathname.startsWith("/dashboard")) {
    const newPath = pathname
      .replace(/^\/dashboard/, "/studio")
      .replace(/^\/creator/, "/studio");
    return NextResponse.redirect(new URL(newPath, req.url));
  }

  if (pathname.startsWith("/servers/")) {
    return NextResponse.redirect(
      new URL(pathname.replace(/^\/servers\//, "/server/"), req.url)
    );
  }

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn || (role !== "ADMIN" && role !== "MODERATOR")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (pathname.startsWith("/studio")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    const isUploadPage =
      pathname === "/studio/videos/new" || pathname.startsWith("/studio/videos/new/");
    if (
      !isUploadPage &&
      !["CREATOR", "MODERATOR", "ADMIN"].includes(role ?? "")
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (pathname.startsWith("/server-dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (pathname.startsWith("/submit-server")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/studio",
    "/studio/:path*",
    "/server-dashboard",
    "/server-dashboard/:path*",
    "/creator",
    "/creator/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/servers/:path*",
    "/submit-server",
  ],
};
