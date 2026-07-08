import { requireAdmin } from "@/lib/auth/helpers";
import { getAnalytics } from "@/lib/services/analytics.service";
import type { AnalyticsPeriod } from "@/lib/services/analytics.service";
import { ok, err } from "@/lib/api/response";
import { handlePrismaError, DatabaseError } from "@/lib/db/errors";

const VALID_PERIODS: AnalyticsPeriod[] = ["today", "7days", "30days", "12months"];

export async function GET(req: Request): Promise<Response> {
  try {
    await requireAdmin();
  } catch {
    return err("Unauthorized", 401);
  }

  const { searchParams } = new URL(req.url);
  const raw    = searchParams.get("period") ?? "12months";
  const period = VALID_PERIODS.includes(raw as AnalyticsPeriod)
    ? (raw as AnalyticsPeriod)
    : "12months";

  try {
    const data = await getAnalytics(period);
    return ok(data);
  } catch (error) {
    try { handlePrismaError(error); } catch (mapped: unknown) {
      if (mapped instanceof DatabaseError) return err(mapped.message, 503);
    }
    return err("Failed to load analytics", 500);
  }
}
