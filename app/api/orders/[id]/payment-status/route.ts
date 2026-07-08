import type { NextRequest } from "next/server";
import {
  markPaymentPaid,
  markPaymentFailed,
  OrderError,
}                           from "@/lib/services/order.service";
import { parseUpdatePaymentStatusBody }     from "@/lib/validations/order";
import { ok, err }                          from "@/lib/api/response";
import { handlePrismaError, DatabaseError } from "@/lib/db/errors";
import { requireAdmin }                     from "@/lib/auth/helpers";

function handleError(error: unknown): Response {
  if (error instanceof OrderError) {
    return Response.json(
      { success: false, error: error.message, ...error.meta },
      { status: error.status },
    );
  }
  try { handlePrismaError(error); } catch (mapped: unknown) {
    if (mapped instanceof DatabaseError) return err(mapped.message, 503);
  }
  return err("An unexpected error occurred", 500);
}

// ── PATCH /api/orders/[id]/payment-status — admin only ────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try { await requireAdmin(); } catch { return err("Forbidden", 403); }

  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch { return err("Request body must be valid JSON", 400); }

  const parsed = parseUpdatePaymentStatusBody(body);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    const order = parsed.value.status === "Paid"
      ? await markPaymentPaid(id)
      : await markPaymentFailed(id, parsed.value.reason ?? undefined);
    return ok(order);
  } catch (error) {
    return handleError(error);
  }
}
