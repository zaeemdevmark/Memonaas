import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { parseSignupBody } from "@/lib/validations/auth";
import { ok, err } from "@/lib/api/response";
import { handlePrismaError, DatabaseError, isUniqueError } from "@/lib/db/errors";

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Request body must be valid JSON", 400);
  }

  const parsed = parseSignupBody(body);
  if (!parsed.ok) return err(parsed.error, 400);

  const { name, email, password, phone } = parsed.value;

  try {
    // Check if User already exists (unique email constraint)
    const existingUser = await prisma.user.findUnique({
      where:  { email },
      select: { id: true },
    });
    if (existingUser) {
      return err("An account with this email already exists", 409);
    }

    const passwordHash = await hashPassword(password);

    // Create the User auth record
    const user = await prisma.user.create({
      data: { email, passwordHash, role: "Customer" },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    // Find existing Customer record (created during a previous guest checkout)
    const existingCustomer = await prisma.customer.findUnique({
      where:  { email },
      select: { id: true },
    });

    if (existingCustomer) {
      // Link guest customer to the new User account — all past orders are now attached
      await prisma.customer.update({
        where: { id: existingCustomer.id },
        data: {
          userId: user.id,
          name,
          ...(phone ? { phone } : {}),
        },
      });
    } else {
      // First-time account — create a fresh Customer profile
      await prisma.customer.create({
        data: {
          email,
          name,
          ...(phone ? { phone } : {}),
          userId: user.id,
        },
      });
    }

    return ok({ id: user.id, email: user.email, role: user.role, createdAt: user.createdAt }, 201);
  } catch (error) {
    if (isUniqueError(error)) {
      return err("An account with this email already exists", 409);
    }
    try { handlePrismaError(error); } catch (mapped: unknown) {
      if (mapped instanceof DatabaseError) return err(mapped.message, 503);
    }
    return err("An unexpected error occurred", 500);
  }
}
