import type { InventoryStatus } from "@/lib/types/inventory";

// ── Helpers ────────────────────────────────────────────────────────────────

type Ok<T>  = { ok: true;  value: T };
type Err    = { ok: false; error: string };

function ok<T>(v: T): Ok<T>   { return { ok: true,  value: v }; }
function fail(msg: string): Err { return { ok: false, error: msg }; }

const VALID_STATUSES: InventoryStatus[] = ["InStock", "LowStock", "OutOfStock"];

// ── Query params for GET /api/inventory ───────────────────────────────────

export interface InventoryQuery {
  page:      number;
  limit:     number;
  search?:   string;
  status?:   InventoryStatus;
  productId?: string;
}

export function parseInventoryQuery(sp: URLSearchParams): Ok<InventoryQuery> | Err {
  const rawPage  = sp.get("page")  ?? "1";
  const rawLimit = sp.get("limit") ?? "20";
  const page  = parseInt(rawPage,  10);
  const limit = parseInt(rawLimit, 10);

  if (!Number.isInteger(page)  || page  < 1)              return fail("'page' must be a positive integer");
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) return fail("'limit' must be between 1 and 100");

  const rawStatus = sp.get("status");
  if (rawStatus !== null && !VALID_STATUSES.includes(rawStatus as InventoryStatus)) {
    return fail(`'status' must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  const search    = sp.get("search")?.trim()    || undefined;
  const productId = sp.get("productId")?.trim() || undefined;

  return ok({
    page,
    limit,
    ...(search    && { search }),
    ...(productId && { productId }),
    ...(rawStatus && { status: rawStatus as InventoryStatus }),
  });
}

// ── PATCH /api/inventory/[variantId] body ──────────────────────────────────

export type InventoryAction = "setStock" | "increaseStock" | "decreaseStock" | "setThreshold";

export interface InventoryUpdateBody {
  action:    InventoryAction;
  quantity?: number;   // for stock actions
  threshold?: number;  // for setThreshold
}

const VALID_ACTIONS: InventoryAction[] = ["setStock", "increaseStock", "decreaseStock", "setThreshold"];

export function parseInventoryUpdateBody(body: unknown): Ok<InventoryUpdateBody> | Err {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return fail("Request body must be a JSON object");
  }
  const b = body as Record<string, unknown>;

  if (!VALID_ACTIONS.includes(b.action as InventoryAction)) {
    return fail(`'action' must be one of: ${VALID_ACTIONS.join(", ")}`);
  }
  const action = b.action as InventoryAction;

  if (action === "setThreshold") {
    if (typeof b.threshold !== "number" || !Number.isInteger(b.threshold) || b.threshold < 0) {
      return fail("'threshold' must be a non-negative integer");
    }
    return ok({ action, threshold: b.threshold });
  }

  // All stock actions require quantity
  if (typeof b.quantity !== "number" || !Number.isInteger(b.quantity) || b.quantity <= 0) {
    return fail("'quantity' must be a positive integer");
  }

  return ok({ action, quantity: b.quantity });
}
