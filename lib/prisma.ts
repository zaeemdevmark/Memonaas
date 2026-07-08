import { PrismaClient } from "@prisma/client";
import { PrismaPg }    from "@prisma/adapter-pg";
import { Pool }        from "pg";

// ── Global declarations ────────────────────────────────────────────
// Prevent TypeScript from complaining about the properties we pin on
// globalThis to survive Next.js hot-reloads in development.

declare global {
  // eslint-disable-next-line no-var
  var __prismaPool:   Pool         | undefined;
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

// ── Factory ────────────────────────────────────────────────────────

const isDev = process.env.NODE_ENV !== "production";

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "[Memonaas] DATABASE_URL is not set.\n" +
      "Add it to your .env file:\n" +
      '  DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/memonaas?schema=public"'
    );
  }

  // Re-use the Pool across module reloads so we never exceed PostgreSQL's
  // max_connections limit (default 100).  Each new Pool creates its own
  // background keep-alive connections, so a leaked pool is expensive.
  const pool = (globalThis.__prismaPool ??= new Pool({
    connectionString:        process.env.DATABASE_URL,
    max:                     10,        // maximum concurrent connections
    idleTimeoutMillis:       30_000,    // close idle connections after 30 s
    connectionTimeoutMillis: 5_000,     // throw if no connection available in 5 s
  }));

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: isDev
      ? ["query", "warn", "error"]   // log SQL in development
      : ["warn",  "error"],           // only warnings/errors in production
  });
}

// ── Singleton ──────────────────────────────────────────────────────
//
// Production:   module-level singleton — Node.js caches the module, so
//               createPrismaClient() is called exactly once per process.
//
// Development:  Next.js hot-reloads wipe module-level variables, creating
//               a new PrismaClient (and Pool) on every save.  We pin the
//               instance on globalThis instead, which survives hot-reloads.

const prisma: PrismaClient = isDev
  ? (globalThis.__prismaClient ??= createPrismaClient())
  : createPrismaClient();

export default prisma;
