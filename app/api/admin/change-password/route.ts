import type { NextRequest } from "next/server";
import { auth }              from "@/auth";
import { ok, err }           from "@/lib/api/response";
import { changePassword, UserError } from "@/lib/services/user.service";
import { handlePrismaError, DatabaseError } from "@/lib/db/errors";

export async function POST(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "Admin") return err("Unauthorized", 401);

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return err("Invalid JSON", 400); }

  const { currentPassword, newPassword } = body;
  if (typeof currentPassword !== "string" || !currentPassword.trim())
    return err("Current password is required", 400);
  if (typeof newPassword !== "string" || newPassword.length < 8)
    return err("New password must be at least 8 characters", 400);

  try {
    await changePassword(session.user.id, currentPassword, newPassword);
    return ok({ changed: true });
  } catch (error) {
    if (error instanceof UserError) return err(error.message, error.status);
    try { handlePrismaError(error); } catch (mapped: unknown) {
      if (mapped instanceof DatabaseError) return err(mapped.message, 503);
    }
    return err("An unexpected error occurred", 500);
  }
}
