import type { NextAuthConfig } from "next-auth";

const ADMIN_ROUTES    = ["/admin"];
const ADMIN_PUBLIC    = ["/admin/login"];  // accessible without admin auth
const CUSTOMER_ROUTES = ["/dashboard"];
const AUTH_ROUTES     = ["/account"];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge:   24 * 60 * 60,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role       = auth?.user?.role ?? null;
      const pathname   = nextUrl.pathname;

      const isAdminPublic  = matchesPrefix(pathname, ADMIN_PUBLIC);
      const isAdminRoute   = matchesPrefix(pathname, ADMIN_ROUTES) && !isAdminPublic;
      const isCustomerRoute = matchesPrefix(pathname, CUSTOMER_ROUTES);
      const isAuthRoute     = matchesPrefix(pathname, AUTH_ROUTES);
      const isProtected     = isAdminRoute || isCustomerRoute || isAuthRoute;

      if (isProtected && !isLoggedIn) {
        const loginUrl = new URL(
          isAdminRoute ? "/admin/login" : "/login",
          nextUrl,
        );
        if (!isAdminRoute) loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return Response.redirect(loginUrl);
      }

      if (isAdminRoute && role !== "Admin") {
        return Response.redirect(new URL("/forbidden", nextUrl));
      }

      if (isCustomerRoute && role !== "Customer") {
        return Response.redirect(new URL("/forbidden", nextUrl));
      }

      return true;
    },

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
  providers: [],
} satisfies NextAuthConfig;
