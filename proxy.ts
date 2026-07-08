import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import {
  rateLimit, getClientIp, tooManyRequests,
  RATE_LIMITS,
} from "@/lib/security/rate-limiter";
import type { NextFetchEvent, NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

// Methods that mutate state — subject to CSRF and rate-limit checks
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// ── CSRF: origin validation ─────────────────────────────────────────────────
// Browsers always send the Origin header for cross-origin requests.
// If present and it doesn't match the Host, reject the request.
// This is belt-and-suspenders on top of SameSite=Lax cookies.
function assertOrigin(request: NextRequest): Response | null {
  const origin = request.headers.get("origin");
  if (!origin) return null; // same-origin or non-browser client — allow

  const host = request.headers.get("host") ?? "";
  try {
    if (new URL(origin).host !== host) {
      return Response.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
  } catch {
    return Response.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const { method, nextUrl } = request;
  const path  = nextUrl.pathname;
  const ip    = getClientIp(request);
  const isApi = path.startsWith("/api/");

  // ── Request logging ────────────────────────────────────────────────
  if (process.env.NODE_ENV !== "test") {
    if (process.env.NODE_ENV === "development") {
      console.log(`\x1b[90m→ ${method} ${path}\x1b[0m`);
    } else {
      console.log(
        JSON.stringify({
          ts:  new Date().toISOString(),
          method,
          path,
          ua:  (request.headers.get("user-agent") ?? "").slice(0, 120),
        }),
      );
    }
  }

  // ── Rate limiting ──────────────────────────────────────────────────
  // Skip in development: localhost has no proxy headers so all requests
  // share the same "unknown" IP, exhausting limits immediately.
  if (process.env.NODE_ENV !== "development") {
    if (path === "/api/auth/signup") {
      const rl = rateLimit(`signup:${ip}`, RATE_LIMITS.SIGNUP);
      if (!rl.ok) return tooManyRequests(rl.resetAt);
    } else if (path.startsWith("/api/auth/")) {
      const rl = rateLimit(`auth:${ip}`, RATE_LIMITS.AUTH);
      if (!rl.ok) return tooManyRequests(rl.resetAt);
    } else if (path === "/api/upload") {
      const rl = rateLimit(`upload:${ip}`, RATE_LIMITS.UPLOAD);
      if (!rl.ok) return tooManyRequests(rl.resetAt);
    } else if (isApi) {
      const rl = rateLimit(`api:${ip}`, RATE_LIMITS.API);
      if (!rl.ok) return tooManyRequests(rl.resetAt);
    }
  }

  // ── CSRF protection ────────────────────────────────────────────────
  // State-changing API requests must originate from the same host.
  if (isApi && MUTATING.has(method)) {
    const csrfError = assertOrigin(request);
    if (csrfError) return csrfError;
  }

  // ── API routes ─────────────────────────────────────────────────────
  // Auth is handled per-route via requireAdmin()/requireAuth().
  // Skip the auth proxy to avoid double JWT decoding.
  if (isApi) {
    return NextResponse.next();
  }

  // ── Page routes — NextAuth auth proxy ─────────────────────────────
  // Decodes the JWT and runs the authorized() callback in auth.config.ts,
  // redirecting unauthenticated / wrong-role users where appropriate.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (auth as any)(request, event) as ReturnType<typeof auth>;
}

export const config = {
  matcher: [
    // Run on all paths except Next.js build artefacts and static media
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp|avif)).*)",
  ],
};
