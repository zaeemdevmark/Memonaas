import type { NextRequest } from "next/server";
import { listCoupons, createCoupon, CouponError } from "@/lib/services/coupon.service";
import { parseCouponsQuery, parseCreateCouponBody } from "@/lib/validations/coupon";
import { ok, err, paginated, buildPagination } from "@/lib/api/response";
import { handlePrismaError, DatabaseError } from "@/lib/db/errors";
import { requireAdmin } from "@/lib/auth/helpers";

function handleError(error: unknown): Response {
  if (error instanceof CouponError) return err(error.message, error.status);
  try { handlePrismaError(error); } catch (mapped: unknown) {
    if (mapped instanceof DatabaseError) return err(mapped.message, 503);
  }
  return err("An unexpected error occurred", 500);
}

// ── GET /api/coupons ───────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<Response> {
  try { await requireAdmin(); } catch { return err("Forbidden", 403); }

  const parsed = parseCouponsQuery(request.nextUrl.searchParams);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    const { items, total } = await listCoupons(parsed.value);
    return paginated(items, buildPagination(parsed.value.page, parsed.value.limit, total));
  } catch (error) {
    return handleError(error);
  }
}

// ── POST /api/coupons ──────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<Response> {
  try { await requireAdmin(); } catch { return err("Forbidden", 403); }

  let body: unknown;
  try { body = await request.json(); } catch { return err("Request body must be valid JSON", 400); }

  const parsed = parseCreateCouponBody(body);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    const coupon = await createCoupon(parsed.value);
    return ok(coupon, 201);
  } catch (error) {
    return handleError(error);
  }
}
