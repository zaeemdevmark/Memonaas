import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { comparePassword } from "@/lib/password";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface User {
    role?:       string;
    customerId?: string | null;
  }
  interface Session {
    user: {
      id:         string;
      email:      string;
      name:       string;
      role:       string;
      customerId: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?:         string;
    role?:       string;
    customerId?: string | null;
    name?:       string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path:     "/",
        secure:   process.env.NODE_ENV === "production",
      },
    },
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const email    = credentials?.email    as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where:  { email: email.toLowerCase() },
          select: {
            id:           true,
            email:        true,
            passwordHash: true,
            role:         true,
            isActive:     true,
            customer: {
              select: { id: true, name: true },
            },
          },
        });

        if (!user || !user.isActive) return null;
        if (!user.passwordHash)      return null;

        const valid = await comparePassword(password, user.passwordHash);
        if (!valid) return null;

        return {
          id:         user.id,
          email:      user.email,
          name:       user.customer?.name ?? (user.role === "Admin" ? "Admin" : user.email),
          role:       user.role,
          customerId: user.customer?.id ?? null,
        };
      },
    }),
  ],

  callbacks: {
    ...authConfig.callbacks,

    jwt({ token, user }) {
      if (user) {
        token.id         = user.id;
        token.role       = (user as { role?: string }).role ?? "Customer";
        token.customerId = (user as { customerId?: string | null }).customerId ?? null;
        token.name       = user.name ?? "";
      }
      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id         = token.id as string;
        session.user.role       = token.role as string;
        session.user.customerId = (token.customerId as string | null) ?? null;
        session.user.name       = (token.name as string) ?? "";
      }
      return session;
    },
  },
});
