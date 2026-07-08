import type { NextRequest } from "next/server";
import { NextResponse }     from "next/server";
import { cookies }          from "next/headers";
import {
  getCart,
  addToCart,
  EMPTY_CART,
  CartError,
}                           from "@/lib/services/cart.service";
import { parseAddToCartBody }             from "@/lib/validations/cart";
import { err }                            from "@/lib/api/response";
import { handlePrismaError, DatabaseError } from "@/lib/db/errors";

// ── Cookie config ──────────────────────────────────────────────────────────

const CART_COOKIE = "nayab_cart";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax"  as const,
  maxAge:   60 * 60 * 24 * 30,   // 30 days
  path:     "/",
};

// ── GET /api/cart ──────────────────────────────────────────────────────────

export async function GET(): Promise<Response> {
  const cookieStore = await cookies();
  const cartId      = cookieStore.get(CART_COOKIE)?.value;

  if (!cartId) {
    return Response.json({ success: true, data: EMPTY_CART });
  }

  try {
    const cart = await getCart(cartId);

    if (!cart) {
      // Stale cookie — clear it and return empty cart
      const res = NextResponse.json({ success: true, data: EMPTY_CART });
      res.cookies.delete(CART_COOKIE);
      return res;
    }

    return Response.json({ success: true, data: cart });
  } catch (error) {
    try {
      handlePrismaError(error);
    } catch (mapped: unknown) {
      if (mapped instanceof DatabaseError) return err(mapped.message, 503);
    }
    return err("An unexpected error occurred", 500);
  }
}

// ── POST /api/cart ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Request body must be valid JSON", 400);
  }

  const parsed = parseAddToCartBody(body);
  if (!parsed.ok) return err(parsed.error, 400);

  const cookieStore = await cookies();
  const cartId      = cookieStore.get(CART_COOKIE)?.value;

  try {
    const result = await addToCart(
      cartId,
      parsed.value.variantId,
      parsed.value.quantity,
    );

    const res = NextResponse.json(
      { success: true, data: result.cart },
      { status: 201 },
    );

    if (result.cartCreated || !cartId) {
      res.cookies.set(CART_COOKIE, result.cartId, COOKIE_OPTIONS);
    }

    return res;
  } catch (error) {
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
}
