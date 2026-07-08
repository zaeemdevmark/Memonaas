import type { NextRequest } from "next/server";
import { cookies }          from "next/headers";
import {
  updateCartItem,
  removeCartItem,
  EMPTY_CART,
  CartError,
}                           from "@/lib/services/cart.service";
import { parseUpdateCartItemBody }        from "@/lib/validations/cart";
import { err }                            from "@/lib/api/response";
import { handlePrismaError, DatabaseError } from "@/lib/db/errors";

// ── Shared ─────────────────────────────────────────────────────────────────

const CART_COOKIE = "memonaas_cart";

async function resolveCartId(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

function handleError(error: unknown): Response {
  if (error instanceof CartError) {
    return Response.json(
      { success: false, error: error.message, ...error.meta },
      { status: error.status },
    );
  }
  try {
    handlePrismaError(error);
  } catch (mapped: unknown) {
    if (mapped instanceof DatabaseError) return err(mapped.message, 503);
  }
  return err("An unexpected error occurred", 500);
}

// ── PATCH /api/cart/[id] ───────────────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const cartId = await resolveCartId();
  if (!cartId) return Response.json({ success: true, data: EMPTY_CART });

  const { id: itemId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Request body must be valid JSON", 400);
  }

  const parsed = parseUpdateCartItemBody(body);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    const cart = await updateCartItem(cartId, itemId, parsed.value.quantity);
    return Response.json({ success: true, data: cart });
  } catch (error) {
    return handleError(error);
  }
}

// ── DELETE /api/cart/[id] ──────────────────────────────────────────────────

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const cartId = await resolveCartId();
  if (!cartId) return Response.json({ success: true, data: EMPTY_CART });

  const { id: itemId } = await params;

  try {
    const cart = await removeCartItem(cartId, itemId);
    return Response.json({ success: true, data: cart });
  } catch (error) {
    return handleError(error);
  }
}
