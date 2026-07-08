import type { NextRequest } from "next/server";
import {
  getCouponById,
  updateCoupon,
  deleteCoupon,
  CouponError,
} from "@/lib/services/coupon.service";
import { parseUpdateCouponBody } from "@/lib/validations/coupon";
import { ok, err } from "@/lib/api/response";
import { handlePrismaError, DatabaseError } from "@/lib/db/errors";
import { requireAdmin } from "@/lib/auth/helpers";

function handleError(error: unknown): Response {
  if (error instanceof CouponError) return err(error.message, error.status);
  try { handlePrismaError(error); } catch (mapped: unknown) {
    if (mapped instanceof DatabaseError) return err(mapped.message, 503);
  }
  return err("An unexpected error occurred", 500);
}

// ── GET /api/coupons/[id] ──────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try { await requireAdmin(); } catch { return err("Forbidden", 403); }

  const { id } = await params;
  try {
    const coupon = await getCouponById(id);
    if (!coupon) return err("Coupon not found", 404);
    return ok(coupon);
  } catch (error) {
    return handleError(error);
  }
}

// ── PATCH /api/coupons/[id] ────────────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try { await requireAdmin(); } catch { return err("Forbidden", 403); }

  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return err("Request body must be valid JSON", 400); }

  const parsed = parseUpdateCouponBody(body);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    const coupon = await updateCoupon(id, parsed.value);
    return ok(coupon);
  } catch (error) {
    return handleError(error);
  }
}

// ── DELETE /api/coupons/[id] ───────────────────────────────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try { await requireAdmin(); } catch { return err("Forbidden", 403); }

  const { id } = await params;
  try {
    await deleteCoupon(id);
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
