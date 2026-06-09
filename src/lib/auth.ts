import NextAuth from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "@auth/core/jwt";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/lib/validators/auth";
import { verifyPassword } from "@/lib/auth/password";

const baseConfig = {
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });

        if (!user?.passwordHash) return null;
        if (user.status === "BANNED" || user.status === "SUSPENDED") return null;

        const valid = await verifyPassword(
          parsed.data.password,
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.displayName ?? user.name,
          image: user.avatarUrl ?? user.image,
          role: user.role,
          status: user.status,
          username: user.username,
          displayName: user.displayName,
        };
      },
    }),
  ],
  callbacks: {
    jwt: authConfig.callbacks.jwt,
    async session({ session, token }: { session: Session; token: JWT }) {
      if (!session.user) return session;

      if (token.impersonatingUserId) {
        const imp = await prisma.user.findUnique({
          where: { id: token.impersonatingUserId as string },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            avatarUrl: true,
            role: true,
            status: true,
            username: true,
            displayName: true,
          },
        });
        if (imp) {
          session.user.id = imp.id;
          session.user.email = imp.email;
          session.user.name = imp.displayName ?? imp.name;
          session.user.image = imp.avatarUrl ?? imp.image;
          session.user.role = imp.role;
          session.user.status = imp.status;
          session.user.username = imp.username;
          session.user.displayName = imp.displayName;
          session.impersonatedBy = token.id as string;
          session.impersonatingUserId = imp.id;
        }
      } else {
        session.user.id = token.id as string;
        session.user.role = token.role as typeof session.user.role;
        session.user.status = (token.status as typeof session.user.status) ?? "ACTIVE";
        session.user.username = token.username as string | null | undefined;
        session.user.displayName = token.displayName as string | null | undefined;
      }

      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(baseConfig);
