import { OrderStatus } from "@prisma/client";

// ── Helpers ────────────────────────────────────────────────────────────────

type Ok<T>  = { ok: true;  value: T };
type Err    = { ok: false; error: string };

function ok<T>(value: T): Ok<T>   { return { ok: true,  value }; }
function fail(msg: string): Err   { return { ok: false, error: msg }; }

function str(
  raw:   unknown,
  field: string,
  min:   number,
  max:   number,
  optional = false,
): string | null | Err {
  if (raw === undefined || raw === null || raw === "") {
    if (optional) return null;
    return fail(`'${field}' is required`);
  }
  if (typeof raw !== "string") return fail(`'${field}' must be a string`);
  const v = raw.trim();
  if (v.length < min) return fail(`'${field}' must be at least ${min} character${min > 1 ? "s" : ""}`);
  if (v.length > max) return fail(`'${field}' must not exceed ${max} characters`);
  return v;
}

// ── Create order ───────────────────────────────────────────────────────────

const PAYMENT_METHODS = ["COD", "Card"] as const;
export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number];

export interface CreateOrderBody {
  paymentMethod: PaymentMethodValue;
  name:          string;
  email:         string;
  phone:         string;
  street:        string;
  city:          string;
  province:      string;
  postalCode:    string;
  country:       string;
  notes:         string | null;
  couponCode:    string | null;
}

export function parseCreateOrderBody(
  body: unknown,
): Ok<CreateOrderBody> | Err {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return fail("Request body must be a JSON object");
  }

  const b = body as Record<string, unknown>;

  if (!PAYMENT_METHODS.includes(b.paymentMethod as PaymentMethodValue)) {
    return fail(`'paymentMethod' must be one of: ${PAYMENT_METHODS.join(", ")}`);
  }

  const name       = str(b.name,       "name",       2,  100);
  if (typeof name       !== "string") return name       as Err;

  // Email is optional — allows guest checkout without email; omitted from notification if absent
  const rawEmail = b.email;
  let email = "";
  if (typeof rawEmail === "string" && rawEmail.trim()) {
    const trimmed = rawEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return fail("'email' must be a valid email address");
    email = trimmed;
  }

  const phone      = str(b.phone,      "phone",      7,  20);
  if (typeof phone      !== "string") return phone      as Err;

  const street     = str(b.street,     "street",     5,  200);
  if (typeof street     !== "string") return street     as Err;

  const city       = str(b.city,       "city",       2,  100);
  if (typeof city       !== "string") return city       as Err;

  const province   = str(b.province,   "province",   2,  100);
  if (typeof province   !== "string") return province   as Err;

  const postalCode = str(b.postalCode, "postalCode", 3,  10);
  if (typeof postalCode !== "string") return postalCode as Err;

  const country    = str(b.country,    "country",    2,  100, true);
  if (country !== null && typeof country !== "string") return country as Err;

  const notes      = str(b.notes,      "notes",      1,  500, true);
  if (notes  !== null && typeof notes  !== "string") return notes     as Err;

  const couponCode = str(b.couponCode, "couponCode", 1, 50, true);
  if (couponCode !== null && typeof couponCode !== "string") return couponCode as Err;

  return ok({
    paymentMethod: b.paymentMethod as PaymentMethodValue,
    name,
    email,
    phone,
    street,
    city,
    province,
    postalCode,
    country:    typeof country    === "string" ? country    : "Pakistan",
    notes:      typeof notes      === "string" ? notes      : null,
    couponCode: typeof couponCode === "string" ? couponCode.toUpperCase() : null,
  });
}

// ── Update order status ────────────────────────────────────────────────────

const VALID_STATUSES = Object.values(OrderStatus);

export interface UpdateOrderBody {
  status: OrderStatus;
}

export function parseUpdateOrderBody(
  body: unknown,
): Ok<UpdateOrderBody> | Err {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return fail("Request body must be a JSON object");
  }

  const b = body as Record<string, unknown>;

  if (!VALID_STATUSES.includes(b.status as OrderStatus)) {
    return fail(`'status' must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  return ok({ status: b.status as OrderStatus });
}

// ── Update payment status ──────────────────────────────────────────────────

export interface UpdatePaymentStatusBody {
  status: "Paid" | "Failed";
  reason: string | null;
}

export function parseUpdatePaymentStatusBody(
  body: unknown,
): Ok<UpdatePaymentStatusBody> | Err {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return fail("Request body must be a JSON object");
  }

  const b = body as Record<string, unknown>;

  if (b.status !== "Paid" && b.status !== "Failed") {
    return fail("'status' must be one of: Paid, Failed");
  }

  const reason = str(b.reason, "reason", 1, 500, true);
  if (reason !== null && typeof reason !== "string") return reason as Err;

  return ok({
    status: b.status,
    reason: typeof reason === "string" ? reason : null,
  });
}

// ── GET /api/orders query params ───────────────────────────────────────────

export interface OrdersQuery {
  status?: OrderStatus;
  search?: string;
  page:    number;
  limit:   number;
}

export function parseOrdersQuery(
  sp: URLSearchParams,
): Ok<OrdersQuery> | Err {
  const rawPage  = sp.get("page")  ?? "1";
  const rawLimit = sp.get("limit") ?? "10";

  const page  = parseInt(rawPage,  10);
  const limit = parseInt(rawLimit, 10);

  if (!Number.isInteger(page)  || page  < 1)         return fail("'page' must be a positive integer");
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) return fail("'limit' must be between 1 and 50");

  const rawStatus = sp.get("status");
  if (rawStatus !== null && !VALID_STATUSES.includes(rawStatus as OrderStatus)) {
    return fail(`'status' must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  const rawSearch = sp.get("search")?.trim();

  return ok({
    page,
    limit,
    ...(rawStatus  && { status: rawStatus as OrderStatus }),
    ...(rawSearch  && { search: rawSearch }),
  });
}
