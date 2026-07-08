// ── Helpers ────────────────────────────────────────────────────────────────

type Ok<T> = { ok: true;  value: T };
type Err   = { ok: false; error: string };

function ok<T>(value: T): Ok<T> { return { ok: true,  value }; }
function fail(msg: string): Err { return { ok: false, error: msg }; }

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

function posNum(raw: unknown, field: string, optional = false): number | null | Err {
  if (raw === undefined || raw === null || raw === "") {
    if (optional) return null;
    return fail(`'${field}' is required`);
  }
  const n = Number(raw);
  if (!isFinite(n) || n <= 0) return fail(`'${field}' must be a positive number`);
  return n;
}

function nonNegNum(raw: unknown, field: string, optional = false): number | null | Err {
  if (raw === undefined || raw === null || raw === "") {
    if (optional) return null;
    return fail(`'${field}' is required`);
  }
  const n = Number(raw);
  if (!isFinite(n) || n < 0) return fail(`'${field}' must be zero or a positive number`);
  return n;
}

function posInt(raw: unknown, field: string, optional = false): number | null | Err {
  if (raw === undefined || raw === null || raw === "") {
    if (optional) return null;
    return fail(`'${field}' is required`);
  }
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) return fail(`'${field}' must be a positive integer`);
  return n;
}

function optDate(raw: unknown, field: string): Date | null | Err {
  if (raw === undefined || raw === null || raw === "") return null;
  if (typeof raw !== "string") return fail(`'${field}' must be an ISO date string`);
  const d = new Date(raw);
  if (isNaN(d.getTime())) return fail(`'${field}' is not a valid date`);
  return d;
}

const DISCOUNT_TYPES = ["Percentage", "Fixed"] as const;
type DiscountTypeValue = (typeof DISCOUNT_TYPES)[number];

const CODE_RE = /^[A-Z0-9_-]+$/;

// ── Queries ────────────────────────────────────────────────────────────────

export interface CouponsQuery {
  page:     number;
  limit:    number;
  search:   string | null;
  isActive: boolean | null;
}

export function parseCouponsQuery(params: URLSearchParams): Ok<CouponsQuery> | Err {
  const page  = Math.max(1, parseInt(params.get("page")  ?? "1",  10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(params.get("limit") ?? "20", 10) || 20));

  const searchRaw = params.get("search");
  const search    = searchRaw ? searchRaw.trim() || null : null;

  const activeRaw = params.get("isActive");
  const isActive  = activeRaw === "true" ? true : activeRaw === "false" ? false : null;

  return ok({ page, limit, search, isActive });
}

// ── Create / Update ────────────────────────────────────────────────────────

export interface CreateCouponBody {
  code:          string;
  description:   string | null;
  discountType:  DiscountTypeValue;
  discountValue: number;
  minOrderValue: number | null;
  maxDiscount:   number | null;
  usageLimit:    number | null;
  isActive:      boolean;
  startDate:     Date | null;
  endDate:       Date | null;
}

export function parseCreateCouponBody(
  body: unknown,
): Ok<CreateCouponBody> | Err {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return fail("Request body must be a JSON object");
  }
  const b = body as Record<string, unknown>;

  const codeRaw = str(b.code, "code", 1, 50);
  if (typeof codeRaw !== "string") return codeRaw as Err;
  const code = codeRaw.toUpperCase();
  if (!CODE_RE.test(code)) return fail("'code' may only contain letters, numbers, underscores, and hyphens");

  const description = str(b.description, "description", 1, 500, true);
  if (description !== null && typeof description !== "string") return description as Err;

  if (!DISCOUNT_TYPES.includes(b.discountType as DiscountTypeValue)) {
    return fail(`'discountType' must be one of: ${DISCOUNT_TYPES.join(", ")}`);
  }

  const discountValue = posNum(b.discountValue, "discountValue");
  if (typeof discountValue !== "number") return discountValue as Err;

  if (b.discountType === "Percentage" && discountValue > 100) {
    return fail("'discountValue' cannot exceed 100 for Percentage coupons");
  }

  const minOrderValue = nonNegNum(b.minOrderValue, "minOrderValue", true);
  if (minOrderValue !== null && typeof minOrderValue !== "number") return minOrderValue as Err;

  const maxDiscount = posNum(b.maxDiscount, "maxDiscount", true);
  if (maxDiscount !== null && typeof maxDiscount !== "number") return maxDiscount as Err;

  const usageLimit = posInt(b.usageLimit, "usageLimit", true);
  if (usageLimit !== null && typeof usageLimit !== "number") return usageLimit as Err;

  const isActive = b.isActive === undefined || b.isActive === null
    ? true
    : Boolean(b.isActive);

  const startDate = optDate(b.startDate, "startDate");
  if (startDate !== null && !(startDate instanceof Date)) return startDate as Err;

  const endDate = optDate(b.endDate ?? b.expiresAt, "endDate");
  if (endDate !== null && !(endDate instanceof Date)) return endDate as Err;

  if (startDate && endDate && startDate >= endDate) {
    return fail("'startDate' must be before 'endDate'");
  }

  return ok({
    code,
    description: typeof description === "string" ? description : null,
    discountType: b.discountType as DiscountTypeValue,
    discountValue,
    minOrderValue: typeof minOrderValue === "number" ? minOrderValue : null,
    maxDiscount:   typeof maxDiscount   === "number" ? maxDiscount   : null,
    usageLimit:    typeof usageLimit    === "number" ? usageLimit    : null,
    isActive,
    startDate: startDate instanceof Date ? startDate : null,
    endDate:   endDate   instanceof Date ? endDate   : null,
  });
}

export type UpdateCouponBody = Partial<CreateCouponBody>;

export function parseUpdateCouponBody(
  body: unknown,
): Ok<UpdateCouponBody> | Err {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return fail("Request body must be a JSON object");
  }
  const b = body as Record<string, unknown>;
  const result: UpdateCouponBody = {};

  if (b.code !== undefined) {
    const codeRaw = str(b.code, "code", 1, 50);
    if (typeof codeRaw !== "string") return codeRaw as Err;
    const code = codeRaw.toUpperCase();
    if (!CODE_RE.test(code)) return fail("'code' may only contain letters, numbers, underscores, and hyphens");
    result.code = code;
  }

  if (b.description !== undefined) {
    const d = str(b.description, "description", 1, 500, true);
    if (d !== null && typeof d !== "string") return d as Err;
    result.description = typeof d === "string" ? d : null;
  }

  if (b.discountType !== undefined) {
    if (!DISCOUNT_TYPES.includes(b.discountType as DiscountTypeValue)) {
      return fail(`'discountType' must be one of: ${DISCOUNT_TYPES.join(", ")}`);
    }
    result.discountType = b.discountType as DiscountTypeValue;
  }

  if (b.discountValue !== undefined) {
    const dv = posNum(b.discountValue, "discountValue");
    if (typeof dv !== "number") return dv as Err;
    if ((result.discountType ?? b.discountType) === "Percentage" && dv > 100) {
      return fail("'discountValue' cannot exceed 100 for Percentage coupons");
    }
    result.discountValue = dv;
  }

  if (b.minOrderValue !== undefined) {
    const v = nonNegNum(b.minOrderValue, "minOrderValue", true);
    if (v !== null && typeof v !== "number") return v as Err;
    result.minOrderValue = typeof v === "number" ? v : null;
  }

  if (b.maxDiscount !== undefined) {
    const v = posNum(b.maxDiscount, "maxDiscount", true);
    if (v !== null && typeof v !== "number") return v as Err;
    result.maxDiscount = typeof v === "number" ? v : null;
  }

  if (b.usageLimit !== undefined) {
    const v = posInt(b.usageLimit, "usageLimit", true);
    if (v !== null && typeof v !== "number") return v as Err;
    result.usageLimit = typeof v === "number" ? v : null;
  }

  if (b.isActive !== undefined) {
    result.isActive = Boolean(b.isActive);
  }

  if (b.startDate !== undefined) {
    const d = optDate(b.startDate, "startDate");
    if (d !== null && !(d instanceof Date)) return d as Err;
    result.startDate = d instanceof Date ? d : null;
  }

  if (b.endDate !== undefined || b.expiresAt !== undefined) {
    const d = optDate(b.endDate ?? b.expiresAt, "endDate");
    if (d !== null && !(d instanceof Date)) return d as Err;
    result.endDate = d instanceof Date ? d : null;
  }

  if (result.startDate && result.endDate && result.startDate >= result.endDate) {
    return fail("'startDate' must be before 'endDate'");
  }

  if (Object.keys(result).length === 0) {
    return fail("Request body must contain at least one field to update");
  }

  return ok(result);
}

// ── Apply coupon ───────────────────────────────────────────────────────────

export interface ApplyCouponBody {
  code:     string;
  subtotal: number;
}

export function parseApplyCouponBody(
  body: unknown,
): Ok<ApplyCouponBody> | Err {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return fail("Request body must be a JSON object");
  }
  const b = body as Record<string, unknown>;

  const codeRaw = str(b.code, "code", 1, 50);
  if (typeof codeRaw !== "string") return codeRaw as Err;

  const subtotal = posNum(b.subtotal, "subtotal");
  if (typeof subtotal !== "number") return subtotal as Err;

  return ok({ code: codeRaw.trim().toUpperCase(), subtotal });
}
