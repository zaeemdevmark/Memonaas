import { sanitizeText } from "@/lib/security/sanitize";

type Ok<T> = { ok: true; value: T };
type Err   = { ok: false; error: string };
function ok<T>(v: T): Ok<T> { return { ok: true, value: v }; }
function fail(m: string): Err { return { ok: false, error: m }; }

// ── Body types ─────────────────────────────────────────────────────

export interface CreateReviewBody {
  rating: number;
  title:  string | null;
  body:   string | null;
}

export interface UpdateReviewBody {
  rating?: number;
  title?:  string | null;
  body?:   string | null;
}

export interface ModerateReviewBody {
  isApproved?: boolean;
}

export interface ReviewsQuery {
  page:  number;
  limit: number;
}

export interface AdminReviewsQuery {
  page:   number;
  limit:  number;
  status: "pending" | "approved" | "all";
  search: string;
}

// ── Parsers ────────────────────────────────────────────────────────

export function parseCreateReviewBody(input: unknown): Ok<CreateReviewBody> | Err {
  if (typeof input !== "object" || input === null || Array.isArray(input))
    return fail("Body must be a JSON object");
  const b = input as Record<string, unknown>;

  const rating = Number(b.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return fail("'rating' must be an integer between 1 and 5");

  const title = sanitizeText(b.title as string | null | undefined, 120);
  const body  = sanitizeText(b.body  as string | null | undefined, 2000);

  return ok({ rating, title, body });
}

export function parseUpdateReviewBody(input: unknown): Ok<UpdateReviewBody> | Err {
  if (typeof input !== "object" || input === null || Array.isArray(input))
    return fail("Body must be a JSON object");
  const b = input as Record<string, unknown>;
  const result: UpdateReviewBody = {};

  if (b.rating !== undefined) {
    const rating = Number(b.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      return fail("'rating' must be an integer between 1 and 5");
    result.rating = rating;
  }
  if (b.title !== undefined)
    result.title = sanitizeText(b.title as string | null | undefined, 120);
  if (b.body !== undefined)
    result.body = sanitizeText(b.body as string | null | undefined, 2000);

  if (Object.keys(result).length === 0)
    return fail("Body must contain at least one field to update");
  return ok(result);
}

export function parseModerateReviewBody(input: unknown): Ok<ModerateReviewBody> | Err {
  if (typeof input !== "object" || input === null || Array.isArray(input))
    return fail("Body must be a JSON object");
  const b = input as Record<string, unknown>;
  const result: ModerateReviewBody = {};

  if (b.isApproved !== undefined) result.isApproved = Boolean(b.isApproved);

  if (Object.keys(result).length === 0)
    return fail("Body must contain at least one moderation field");
  return ok(result);
}

export function parseReviewsQuery(sp: URLSearchParams): Ok<ReviewsQuery> | Err {
  const page  = parseInt(sp.get("page")  ?? "1",  10);
  const limit = parseInt(sp.get("limit") ?? "10", 10);
  if (!Number.isFinite(page)  || page  < 1)           return fail("'page' must be a positive integer");
  if (!Number.isFinite(limit) || limit < 1 || limit > 50) return fail("'limit' must be between 1 and 50");
  return ok({ page, limit });
}

export function parseAdminReviewsQuery(sp: URLSearchParams): Ok<AdminReviewsQuery> | Err {
  const page  = parseInt(sp.get("page")  ?? "1",  10);
  const limit = parseInt(sp.get("limit") ?? "20", 10);
  if (!Number.isFinite(page)  || page  < 1)           return fail("'page' must be a positive integer");
  if (!Number.isFinite(limit) || limit < 1 || limit > 100) return fail("'limit' must be between 1 and 100");

  const rawStatus = sp.get("status") ?? "all";
  if (rawStatus !== "pending" && rawStatus !== "approved" && rawStatus !== "all")
    return fail("'status' must be pending, approved, or all");

  const search = (sp.get("search") ?? "").trim().substring(0, 100);
  return ok({ page, limit, status: rawStatus, search });
}
