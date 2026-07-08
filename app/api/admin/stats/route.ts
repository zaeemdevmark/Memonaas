import { requireAdmin } from "@/lib/auth/helpers";
import { getAdminStats } from "@/lib/services/admin.service";
import { ok, err } from "@/lib/api/response";
import { handlePrismaError, DatabaseError } from "@/lib/db/errors";

export async function GET(): Promise<Response> {
  try {
    await requireAdmin();
  } catch {
    return err("Unauthorized", 401);
  }

  try {
    const stats = await getAdminStats();
    return ok(stats);
  } catch (error) {
    try { handlePrismaError(error); } catch (mapped: unknown) {
      if (mapped instanceof DatabaseError) return err(mapped.message, 503);
    }
    return err("An unexpected error occurred", 500);
  }
}
