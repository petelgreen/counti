import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { getUserByEmail, createUser } from "@/lib/db";

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existing = await getUserByEmail(user.email);
        if (!existing) {
          await createUser({
            id: user.id ?? crypto.randomUUID(),
            email: user.email,
            name: user.name ?? user.email,
            password_hash: null,
          });
        } else {
          user.id = existing.id;
        }
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
  providers: [
    Credentials({
      credentials: {
        email:    { label: "אימייל", type: "email" },
        password: { label: "סיסמה",  type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const user = await getUserByEmail(credentials.email as string);
          if (!user || !user.password_hash) return null;
          const ok = await bcrypt.compare(credentials.password as string, user.password_hash);
          if (!ok) return null;
          return { id: user.id, name: user.name, email: user.email };
        } catch (err) {
          console.error("[auth] authorize error:", err);
          return null;
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID
      ? [Google({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! })]
      : []),
  ],
});
