import type { NextRequest } from "next/server";
import {
  getVariantInventory,
  increaseStock,
  decreaseStock,
  setStock,
  setLowStockThreshold,
  InventoryError,
} from "@/lib/services/inventory.service";
import { parseInventoryUpdateBody } from "@/lib/validations/inventory";
import { ok, err }                  from "@/lib/api/response";
import { handlePrismaError, DatabaseError } from "@/lib/db/errors";
import { requireAdmin }             from "@/lib/auth/helpers";

function handleError(error: unknown): Response {
  if (error instanceof InventoryError) {
    return Response.json(
      { success: false, error: error.message, ...(error.meta ?? {}) },
      { status: error.status },
    );
  }
  try { handlePrismaError(error); } catch (mapped: unknown) {
    if (mapped instanceof DatabaseError) return err(mapped.message, 503);
  }
  return err("An unexpected error occurred", 500);
}

// ── GET /api/inventory/[variantId] ─────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> },
): Promise<Response> {
  try { await requireAdmin(); } catch { return err("Forbidden", 403); }

  const { variantId } = await params;

  try {
    const item = await getVariantInventory(variantId);
    if (!item) return err("Variant not found", 404);
    return ok(item);
  } catch (error) {
    return handleError(error);
  }
}

// ── PATCH /api/inventory/[variantId] ───────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ variantId: string }> },
): Promise<Response> {
  try { await requireAdmin(); } catch { return err("Forbidden", 403); }

  const { variantId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Request body must be valid JSON", 400);
  }

  const parsed = parseInventoryUpdateBody(body);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    const { action, quantity, threshold } = parsed.value;

    let result;
    if (action === "increaseStock") {
      result = await increaseStock(variantId, quantity!);
    } else if (action === "decreaseStock") {
      await decreaseStock(variantId, quantity!);
      result = await getVariantInventory(variantId);
    } else if (action === "setStock") {
      result = await setStock(variantId, quantity!);
    } else {
      result = await setLowStockThreshold(variantId, threshold!);
    }

    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
