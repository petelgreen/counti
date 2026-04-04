import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextRequest, NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow static files and public assets
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") // any file with extension (png, json, ico, etc.)
  ) {
    return NextResponse.next();
  }

  // Delegate auth check to NextAuth
  return (auth as any)(req);
}

export const config = {
  matcher: ["/(.*)" ],
};
