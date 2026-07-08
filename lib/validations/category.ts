// ── Helpers ────────────────────────────────────────────────────────────────

type Ok<T> = { ok: true; value: T };
type Err   = { ok: false; error: string };
function ok<T>(v: T): Ok<T> { return { ok: true,  value: v }; }
function fail(m: string): Err  { return { ok: false, error: m }; }

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// ── Create / Update bodies ─────────────────────────────────────────────────

export interface CreateCategoryBody {
  name:        string;
  slug?:       string | null;
  description?: string | null;
  imageUrl?:   string | null;
  parentId?:   string | null;
  sortOrder?:  number;
  isActive?:   boolean;
}

export type UpdateCategoryBody = Partial<CreateCategoryBody>;

export function parseCreateCategoryBody(body: unknown): Ok<CreateCategoryBody> | Err {
  if (typeof body !== "object" || body === null || Array.isArray(body))
    return fail("Request body must be a JSON object");
  const b = body as Record<string, unknown>;

  if (!b.name || typeof b.name !== "string" || b.name.trim().length < 2)
    return fail("'name' must be at least 2 characters");

  const slug = b.slug ? String(b.slug).trim().toLowerCase().replace(/[^a-z0-9-]/g, "") : null;

  const sortOrder = b.sortOrder !== undefined ? parseInt(String(b.sortOrder), 10) : 0;
  if (!Number.isInteger(sortOrder)) return fail("'sortOrder' must be an integer");

  return ok({
    name:        b.name.trim(),
    slug:        slug || null,
    description: b.description ? String(b.description).trim() || null : null,
    imageUrl:    b.imageUrl    ? String(b.imageUrl).trim()    || null : null,
    parentId:    b.parentId    ? String(b.parentId)           : null,
    sortOrder,
    isActive:    b.isActive !== undefined ? Boolean(b.isActive) : true,
  });
}

export function parseUpdateCategoryBody(body: unknown): Ok<UpdateCategoryBody> | Err {
  if (typeof body !== "object" || body === null || Array.isArray(body))
    return fail("Request body must be a JSON object");
  const b = body as Record<string, unknown>;
  const result: UpdateCategoryBody = {};

  if (b.name !== undefined) {
    if (typeof b.name !== "string" || b.name.trim().length < 2) return fail("'name' must be at least 2 characters");
    result.name = b.name.trim();
  }
  if (b.slug        !== undefined) result.slug        = b.slug ? String(b.slug).trim().toLowerCase().replace(/[^a-z0-9-]/g, "") || null : null;
  if (b.description !== undefined) result.description = b.description ? String(b.description).trim() || null : null;
  if (b.imageUrl    !== undefined) result.imageUrl    = b.imageUrl    ? String(b.imageUrl).trim()    || null : null;
  if (b.parentId    !== undefined) result.parentId    = b.parentId    ? String(b.parentId)           : null;
  if (b.isActive    !== undefined) result.isActive    = Boolean(b.isActive);
  if (b.sortOrder   !== undefined) {
    const so = parseInt(String(b.sortOrder), 10);
    if (!Number.isInteger(so)) return fail("'sortOrder' must be an integer");
    result.sortOrder = so;
  }

  if (Object.keys(result).length === 0) return fail("Body must contain at least one field to update");
  return ok(result);
}

// ── Query ──────────────────────────────────────────────────────────────────

export interface CategoriesQuery {
  tree:    boolean;
  showAll: boolean;
}

type ParseOk  = { ok: true;  value: CategoriesQuery };
type ParseErr = { ok: false; error: string };

export function parseCategoriesQuery(
  sp: URLSearchParams,
): ParseOk | ParseErr {
  const rawTree = sp.get("tree");

  if (rawTree !== null && rawTree !== "true" && rawTree !== "false") {
    return { ok: false, error: "'tree' must be 'true' or 'false'" };
  }

  return { ok: true, value: { tree: rawTree === "true", showAll: sp.get("showAll") === "true" } };
}
