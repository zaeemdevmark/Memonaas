import type { NextRequest } from "next/server";
import { NextResponse }     from "next/server";
import { cookies }          from "next/headers";
import { auth }             from "@/auth";
import {
  createOrder,
  getOrdersByIds,
  getAllOrders,
  OrderError,
}                           from "@/lib/services/order.service";
import { getOrCreateCustomer } from "@/lib/services/customer.service";
import {
  parseCreateOrderBody,
  parseOrdersQuery,
}                           from "@/lib/validations/order";
import { err, paginated, buildPagination } from "@/lib/api/response";
import { handlePrismaError, DatabaseError } from "@/lib/db/errors";

// ── Cookie helpers ─────────────────────────────────────────────────────────

const CART_COOKIE   = "memonaas_cart";
const ORDERS_COOKIE = "memonaas_orders";
const MAX_STORED    = 20;

const ORDERS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge:   60 * 60 * 24 * 365,
  path:     "/",
};

function readOrderIds(raw: string | undefined): string[] {
  if (!raw) return [];
  try   { return JSON.parse(raw) as string[]; }
  catch { return []; }
}

// ── GET /api/orders ────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<Response> {
  const sp     = request.nextUrl.searchParams;
  const parsed = parseOrdersQuery(sp);
  if (!parsed.ok) return err(parsed.error, 400);

  const session = await auth();
  const isAdmin = session?.user?.role === "Admin";

  if (isAdmin) {
    try {
      const { orders, total } = await getAllOrders(parsed.value);
      return paginated(orders, buildPagination(parsed.value.page, parsed.value.limit, total));
    } catch (error) {
      try { handlePrismaError(error); } catch (mapped: unknown) {
        if (mapped instanceof DatabaseError) return err(mapped.message, 503);
      }
      return err("An unexpected error occurred", 500);
    }
  }

  const cookieStore = await cookies();
  const orderIds    = readOrderIds(cookieStore.get(ORDERS_COOKIE)?.value);

  if (orderIds.length === 0) {
    return paginated([], buildPagination(parsed.value.page, parsed.value.limit, 0));
  }

  try {
    const { orders, total } = await getOrdersByIds(orderIds, parsed.value);
    return paginated(orders, buildPagination(parsed.value.page, parsed.value.limit, total));
  } catch (error) {
    try { handlePrismaError(error); } catch (mapped: unknown) {
      if (mapped instanceof DatabaseError) return err(mapped.message, 503);
    }
    return err("An unexpected error occurred", 500);
  }
}

// ── POST /api/orders ───────────────────────────────────────────────────────
// Guest checkout: always allowed.
// Logged-in customer: order is linked to their Customer profile.
// On every checkout a Customer record is found or created for the email
// provided in the order body.

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Request body must be valid JSON", 400);
  }

  const parsed = parseCreateOrderBody(body);
  if (!parsed.ok) return err(parsed.error, 400);

  const cookieStore = await cookies();
  const cartId      = cookieStore.get(CART_COOKIE)?.value;

  if (!cartId) {
    return err("No active cart found. Add items to your cart before placing an order.", 400);
  }

  try {
    // Auto-create (or find) the customer profile for this email
    const customer = await getOrCreateCustomer(
      parsed.value.email,
      parsed.value.name,
      parsed.value.phone,
    );

    const order = await createOrder(
      cartId,
      parsed.value,
      parsed.value.couponCode ?? undefined,
      customer.id,
    );

    const prev    = readOrderIds(cookieStore.get(ORDERS_COOKIE)?.value);
    const updated = [order.id, ...prev.filter((id) => id !== order.id)].slice(0, MAX_STORED);

    const res = NextResponse.json({ success: true, data: order }, { status: 201 });
    res.cookies.set(ORDERS_COOKIE, JSON.stringify(updated), ORDERS_COOKIE_OPTIONS);
    res.cookies.delete(CART_COOKIE);
    return res;
  } catch (error) {
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
}
