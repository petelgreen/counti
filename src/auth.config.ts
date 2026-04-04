import type { NextAuthConfig } from "next-auth";

// Edge-safe config — no Node.js-only imports (no bcrypt, no db).
// This is used directly by middleware (via auth as middleware in src/middleware.ts).
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      // Always allow: NextAuth internal routes, static files, and API routes
      if (
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/") ||
        pathname.startsWith("/_next") ||
        /\.\w{1,10}$/.test(pathname)
      ) {
        return true;
      }

      // Already logged in and trying to visit /login → redirect to home
      if (isLoggedIn && pathname === "/login") {
        return Response.redirect(new URL("/", nextUrl));
      }

      // Allow /login for unauthenticated users
      if (pathname === "/login") {
        return true;
      }

      // All other pages require authentication
      if (!isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return Response.redirect(loginUrl);
      }

      return true;
    },
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
