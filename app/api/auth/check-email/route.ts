import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ok, err } from "@/lib/api/response";

// POST /api/auth/check-email
// Used by the two-step login flow to check whether an account exists for
// the entered email before showing the password field.

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Request body must be valid JSON", 400);
  }

  const b     = body as Record<string, unknown>;
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  if (!email) return err("Email is required", 400);

  const user = await prisma.user.findUnique({
    where:  { email },
    select: { id: true },
  });

  return ok({ exists: !!user });
}
