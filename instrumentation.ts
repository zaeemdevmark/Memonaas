import { type Instrumentation } from "next";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
    await seedAdmin();
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

async function seedAdmin() {
  const email    = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  try {
    const { default: prisma }  = await import("@/lib/prisma");
    const { hashPassword }     = await import("@/lib/password");

    const existing = await prisma.user.findUnique({
      where:  { email },
      select: { id: true },
    });
    if (existing) return;

    const passwordHash = await hashPassword(password);
    await prisma.user.create({
      data: { email, passwordHash, role: "Admin" },
    });
    console.log(`[seed] Admin user created: ${email}`);
  } catch (err) {
    console.error("[seed] Failed to seed admin user:", err);
  }
}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  if (!process.env.SENTRY_DSN) return;

  const { captureRequestError } = await import("@sentry/nextjs");
  captureRequestError(error, request, context);
};
