// In-memory sliding-window rate limiter.
// State survives Next.js hot-reloads via globalThis.
// For multi-instance deployments, replace with a Redis-backed implementation.

interface Bucket {
  count:   number;
  resetAt: number; // epoch ms when this window expires
}

declare global {
  // eslint-disable-next-line no-var
  var __rl_store: Map<string, Bucket> | undefined;
}

const store: Map<string, Bucket> =
  globalThis.__rl_store ?? (globalThis.__rl_store = new Map());

// Periodic cleanup — prevents unbounded memory growth in long-running processes
let cleanupStarted = false;
function startCleanup(): void {
  if (cleanupStarted) return;
  cleanupStarted = true;
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of store) {
      if (bucket.resetAt <= now) store.delete(key);
    }
  }, 60_000);
  // Don't prevent Node.js from exiting cleanly
  if (typeof timer === "object") (timer as NodeJS.Timeout).unref?.();
}

export interface RateLimitConfig {
  limit:  number; // max requests
  window: number; // window size in seconds
}

export const RATE_LIMITS = {
  // Auth endpoints — strict to block brute-force login/signup
  AUTH:   { limit: 10, window: 15 * 60 } satisfies RateLimitConfig,
  // Account creation — extra-strict to prevent mass account creation
  SIGNUP: { limit: 5,  window: 60 * 60 } satisfies RateLimitConfig,
  // General API — generous but blocks obvious scripted abuse
  API:    { limit: 200, window: 60     } satisfies RateLimitConfig,
  // File uploads — expensive Cloudinary operations
  UPLOAD: { limit: 20,  window: 60     } satisfies RateLimitConfig,
} as const;

export interface RateLimitResult {
  ok:        boolean;
  remaining: number;
  resetAt:   number; // epoch ms
}

export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  startCleanup();

  const now    = Date.now();
  let   bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 1, resetAt: now + config.window * 1000 };
    store.set(key, bucket);
    return { ok: true, remaining: config.limit - 1, resetAt: bucket.resetAt };
  }

  if (bucket.count >= config.limit) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count++;
  return { ok: true, remaining: config.limit - bucket.count, resetAt: bucket.resetAt };
}

// Extract the real client IP, respecting common reverse-proxy headers
export function getClientIp(request: { headers: { get(k: string): string | null } }): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

// Standard 429 response with Retry-After header
export function tooManyRequests(resetAt: number): Response {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return Response.json(
    { success: false, error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After":       String(retryAfter),
        "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
      },
    },
  );
}
