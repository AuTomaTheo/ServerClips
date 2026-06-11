import type { NextAuthConfig } from "next-auth";
import type { Role, UserStatus } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role;
      status: UserStatus;
      username?: string | null;
      displayName?: string | null;
    };
    impersonatedBy?: string;
    impersonatingUserId?: string;
  }

  interface User {
    role: Role;
    status: UserStatus;
    username?: string | null;
    displayName?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    status: UserStatus;
    username?: string | null;
    displayName?: string | null;
    impersonatedBy?: string;
    impersonatingUserId?: string;
  }
}

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.status = user.status ?? "ACTIVE";
        token.username = user.username;
        token.displayName = user.displayName;
      }

      if (trigger === "update" && session) {
        if (session.impersonatingUserId !== undefined) {
          token.impersonatingUserId = session.impersonatingUserId;
        }
        if (session.impersonatedBy !== undefined) {
          token.impersonatedBy = session.impersonatedBy;
        }
        if (session.stopImpersonation) {
          delete token.impersonatingUserId;
          delete token.impersonatedBy;
        }
        if (session.role) {
          token.role = session.role as Role;
        }
        if (session.username) {
          token.username = session.username as string;
        }
        if (session.displayName) {
          token.displayName = session.displayName as string;
        }
      }

      return token;
    },
    // Required for middleware (edge) — must not use Prisma here.
    async session({ session, token }) {
      if (!session.user) return session;

      session.user.id = (token.impersonatingUserId ?? token.id) as string;
      session.user.role = token.role as Role;
      session.user.status = (token.status as UserStatus) ?? "ACTIVE";
      session.user.username = token.username as string | null | undefined;
      session.user.displayName = token.displayName as string | null | undefined;

      if (token.impersonatingUserId) {
        session.impersonatedBy = token.impersonatedBy as string | undefined;
        session.impersonatingUserId = token.impersonatingUserId as string;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;
