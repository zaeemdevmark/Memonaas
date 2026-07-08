import type { NextRequest } from "next/server";
import { auth }              from "@/auth";
import { ok, err }           from "@/lib/api/response";
import { getUserProfile, updateUserProfile, UserError } from "@/lib/services/user.service";
import { parseUpdateProfileBody }                       from "@/lib/validations/user";
import { handlePrismaError, DatabaseError }             from "@/lib/db/errors";

async function getAuthCustomerId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.customerId || session.user.role !== "Customer") return null;
  return session.user.customerId;
}

function handleError(error: unknown): Response {
  if (error instanceof UserError) return err(error.message, error.status);
  try { handlePrismaError(error); } catch (mapped: unknown) {
    if (mapped instanceof DatabaseError) return err(mapped.message, 503);
  }
  return err("An unexpected error occurred", 500);
}

export async function GET(): Promise<Response> {
  const customerId = await getAuthCustomerId();
  if (!customerId) return err("Unauthorized", 401);

  try {
    const profile = await getUserProfile(customerId);
    if (!profile) return err("Customer profile not found", 404);
    return ok(profile);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: NextRequest): Promise<Response> {
  const customerId = await getAuthCustomerId();
  if (!customerId) return err("Unauthorized", 401);

  let body: unknown;
  try { body = await request.json(); }
  catch { return err("Request body must be valid JSON", 400); }

  const parsed = parseUpdateProfileBody(body);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    const profile = await updateUserProfile(customerId, parsed.value);
    return ok(profile);
  } catch (error) {
    return handleError(error);
  }
}
