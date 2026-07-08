import type { NextRequest } from "next/server";
import { requireAdmin }              from "@/lib/auth/helpers";
import { parseAdminReviewsQuery }    from "@/lib/validations/review";
import { listAllReviews }            from "@/lib/services/review.service";
import { ok, err, buildPagination,
         paginated }                 from "@/lib/api/response";
import { handlePrismaError,
         DatabaseError }             from "@/lib/db/errors";

function handleError(error: unknown): Response {
  try { handlePrismaError(error); } catch (mapped: unknown) {
    if (mapped instanceof DatabaseError) return err(mapped.message, 503);
  }
  return err("An unexpected error occurred", 500);
}

export async function GET(request: NextRequest): Promise<Response> {
  try { await requireAdmin(); } catch { return err("Forbidden", 403); }

  const parsed = parseAdminReviewsQuery(request.nextUrl.searchParams);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    const { reviews, total, page, totalPages } = await listAllReviews(parsed.value);
    const { limit } = parsed.value;
    return ok({ reviews, pagination: buildPagination(page, limit, total), totalPages });
  } catch (error) {
    return handleError(error);
  }
}
