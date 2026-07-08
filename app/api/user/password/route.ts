import type { NextRequest } from "next/server";
import { auth }              from "@/auth";
import { ok, err }           from "@/lib/api/response";
import { changePassword, UserError } from "@/lib/services/user.service";
import { parseChangePasswordBody }   from "@/lib/validations/user";
import { handlePrismaError, DatabaseError } from "@/lib/db/errors";

async function getAuthUserId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "Customer") return null;
  return session.user.id;
}

export async function POST(request: NextRequest): Promise<Response> {
  const userId = await getAuthUserId();
  if (!userId) return err("Unauthorized", 401);

  let body: unknown;
  try { body = await request.json(); }
  catch { return err("Request body must be valid JSON", 400); }

  const parsed = parseChangePasswordBody(body);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    await changePassword(userId, parsed.value.currentPassword, parsed.value.newPassword);
    return ok({ changed: true });
  } catch (error) {
    if (error instanceof UserError) return err(error.message, error.status);
    try { handlePrismaError(error); } catch (mapped: unknown) {
      if (mapped instanceof DatabaseError) return err(mapped.message, 503);
    }
    return err("An unexpected error occurred", 500);
  }
}
