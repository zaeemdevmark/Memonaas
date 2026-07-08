import type { NextRequest } from "next/server";
import { validateCoupon, applyCoupon, CouponError } from "@/lib/services/coupon.service";
import { parseApplyCouponBody } from "@/lib/validations/coupon";
import { ok, err } from "@/lib/api/response";
import { handlePrismaError, DatabaseError } from "@/lib/db/errors";

// ── POST /api/coupons/apply ────────────────────────────────────────────────
// Public — used during checkout to validate and preview the discount.
// Does NOT increment usedCount; that happens when the order is confirmed.

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try { body = await request.json(); } catch { return err("Request body must be valid JSON", 400); }

  const parsed = parseApplyCouponBody(body);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    const coupon = await validateCoupon(parsed.value.code, parsed.value.subtotal);
    const result = applyCoupon(coupon, parsed.value.subtotal);
    return ok(result);
  } catch (error) {
    if (error instanceof CouponError) {
      return err(error.message, error.status);
    }
    try { handlePrismaError(error); } catch (mapped: unknown) {
      if (mapped instanceof DatabaseError) return err(mapped.message, 503);
    }
    return err("An unexpected error occurred", 500);
  }
}
