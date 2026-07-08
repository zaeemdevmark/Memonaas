type Ok<T>  = { ok: true;  value: T };
type Err    = { ok: false; error: string };

function ok<T>(value: T): Ok<T>       { return { ok: true,  value }; }
function fail(error: string): Err     { return { ok: false, error }; }

function parsePositiveInt(
  raw: unknown,
  field: string,
  hint?: string,
): number | Err {
  if (typeof raw !== "number" || !Number.isInteger(raw) || raw < 1) {
    return fail(`'${field}' must be a positive integer${hint ? ` (${hint})` : ""}`);
  }
  return raw;
}

// ── Add to cart ────────────────────────────────────────────────────────────

export interface AddToCartBody {
  variantId: string;
  quantity:  number;
}

export function parseAddToCartBody(body: unknown): Ok<AddToCartBody> | Err {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return fail("Request body must be a JSON object");
  }

  const b = body as Record<string, unknown>;

  if (typeof b.variantId !== "string" || !b.variantId.trim()) {
    return fail("'variantId' is required and must be a non-empty string");
  }

  const qty = parsePositiveInt(b.quantity, "quantity");
  if (typeof qty !== "number") return qty;

  return ok({ variantId: b.variantId.trim(), quantity: qty });
}

// ── Update cart item ───────────────────────────────────────────────────────

export interface UpdateCartItemBody {
  quantity: number;
}

export function parseUpdateCartItemBody(body: unknown): Ok<UpdateCartItemBody> | Err {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return fail("Request body must be a JSON object");
  }

  const b = body as Record<string, unknown>;

  const qty = parsePositiveInt(
    b.quantity,
    "quantity",
    "use DELETE to remove an item",
  );
  if (typeof qty !== "number") return qty;

  return ok({ quantity: qty });
}
