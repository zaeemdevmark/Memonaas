// ── Helpers ────────────────────────────────────────────────────────────────

type Ok<T> = { ok: true; value: T };
type Err   = { ok: false; error: string };
function ok<T>(v: T): Ok<T> { return { ok: true,  value: v }; }
function fail(m: string): Err  { return { ok: false, error: m }; }

// ── Create / Update bodies ─────────────────────────────────────────────────

const VALID_SIZES    = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const VALID_STATUSES = ["Active", "Draft", "Archived"] as const;
export type SizeValue          = (typeof VALID_SIZES)[number];
export type ProductStatusValue = (typeof VALID_STATUSES)[number];

export interface CreateVariantBody {
  size:      SizeValue;
  color:     string;
  colorHex?: string | null;
  stock:     number;
  price:     number;
  salePrice?: number | null;
}

export interface CreateProductBody {
  name:         string;
  sku:          string;
  description?: string | null;
  basePrice:    number;
  salePrice?:   number | null;
  categoryId:   string;
  status:       ProductStatusValue;
  isFeatured:   boolean;
  variants:     CreateVariantBody[];
  images:       Array<{ url: string; altText?: string | null }>;
  tab1Title?:   string | null;
  tab1Content?: string | null;
}

export type UpdateProductBody = Partial<CreateProductBody>;

function parseVariant(v: Record<string, unknown>, idx: number): Ok<CreateVariantBody> | Err {
  if (!VALID_SIZES.includes(v.size as SizeValue))
    return fail(`variants[${idx}].size must be one of: ${VALID_SIZES.join(", ")}`);
  if (!v.color || typeof v.color !== "string" || !v.color.trim())
    return fail(`variants[${idx}].color is required`);
  const price = Number(v.price);
  if (!isFinite(price) || price <= 0)
    return fail(`variants[${idx}].price must be a positive number`);
  const stock = parseInt(String(v.stock ?? 0), 10);
  if (!Number.isInteger(stock) || stock < 0)
    return fail(`variants[${idx}].stock must be a non-negative integer`);
  const salePrice = (v.salePrice != null && v.salePrice !== "") ? Number(v.salePrice) : null;
  if (salePrice !== null && (!isFinite(salePrice) || salePrice <= 0))
    return fail(`variants[${idx}].salePrice must be positive if provided`);
  return ok({
    size:     v.size as SizeValue,
    color:    String(v.color).trim(),
    colorHex: v.colorHex ? String(v.colorHex).trim() : null,
    stock,
    price,
    salePrice,
  });
}

export function parseCreateProductBody(body: unknown): Ok<CreateProductBody> | Err {
  if (typeof body !== "object" || body === null || Array.isArray(body))
    return fail("Request body must be a JSON object");
  const b = body as Record<string, unknown>;

  if (!b.name || typeof b.name !== "string" || b.name.trim().length < 2)
    return fail("'name' must be at least 2 characters");
  if (!b.sku || typeof b.sku !== "string" || !b.sku.trim())
    return fail("'sku' is required");
  if (!b.categoryId || typeof b.categoryId !== "string")
    return fail("'categoryId' is required");

  const basePrice = Number(b.basePrice);
  if (!isFinite(basePrice) || basePrice <= 0) return fail("'basePrice' must be a positive number");

  const salePrice = (b.salePrice != null && b.salePrice !== "") ? Number(b.salePrice) : null;
  if (salePrice !== null && (!isFinite(salePrice) || salePrice <= 0))
    return fail("'salePrice' must be positive if provided");

  const status = (b.status as ProductStatusValue) ?? "Draft";
  if (!VALID_STATUSES.includes(status)) return fail(`'status' must be one of: ${VALID_STATUSES.join(", ")}`);

  if (!Array.isArray(b.variants) || b.variants.length === 0)
    return fail("At least one variant is required");
  const variants: CreateVariantBody[] = [];
  for (let i = 0; i < b.variants.length; i++) {
    const parsed = parseVariant(b.variants[i] as Record<string, unknown>, i);
    if (!parsed.ok) return parsed;
    variants.push(parsed.value);
  }

  const images: Array<{ url: string; altText?: string | null }> = [];
  if (Array.isArray(b.images)) {
    for (const img of b.images) {
      const i = img as Record<string, unknown>;
      if (i.url && typeof i.url === "string" && i.url.trim())
        images.push({ url: i.url.trim(), altText: i.altText ? String(i.altText).trim() : null });
    }
  }

  return ok({
    name:        b.name.trim(),
    sku:         String(b.sku).trim().toUpperCase(),
    description: b.description ? String(b.description).trim() || null : null,
    basePrice,
    salePrice,
    categoryId:  String(b.categoryId),
    status,
    isFeatured:  Boolean(b.isFeatured),
    variants,
    images,
    tab1Title:   b.tab1Title   ? String(b.tab1Title).trim()   || null : null,
    tab1Content: b.tab1Content ? String(b.tab1Content).trim() || null : null,
  });
}

export function parseUpdateProductBody(body: unknown): Ok<UpdateProductBody> | Err {
  if (typeof body !== "object" || body === null || Array.isArray(body))
    return fail("Request body must be a JSON object");
  const b = body as Record<string, unknown>;
  const result: UpdateProductBody = {};

  if (b.name !== undefined) {
    if (typeof b.name !== "string" || b.name.trim().length < 2) return fail("'name' must be at least 2 characters");
    result.name = b.name.trim();
  }
  if (b.description  !== undefined) result.description  = b.description  ? String(b.description).trim()  || null : null;
  if (b.tab1Title    !== undefined) result.tab1Title    = b.tab1Title    ? String(b.tab1Title).trim()    || null : null;
  if (b.tab1Content  !== undefined) result.tab1Content  = b.tab1Content  ? String(b.tab1Content).trim()  || null : null;
  if (b.sku          !== undefined) result.sku          = String(b.sku).trim().toUpperCase();
  if (b.categoryId  !== undefined) result.categoryId  = String(b.categoryId);
  if (b.isFeatured  !== undefined) result.isFeatured  = Boolean(b.isFeatured);
  if (b.status !== undefined) {
    if (!VALID_STATUSES.includes(b.status as ProductStatusValue)) return fail(`'status' must be one of: ${VALID_STATUSES.join(", ")}`);
    result.status = b.status as ProductStatusValue;
  }
  if (b.basePrice !== undefined) {
    const bp = Number(b.basePrice);
    if (!isFinite(bp) || bp <= 0) return fail("'basePrice' must be positive");
    result.basePrice = bp;
  }
  if (b.salePrice !== undefined) {
    const sp = (b.salePrice != null && b.salePrice !== "") ? Number(b.salePrice) : null;
    if (sp !== null && (!isFinite(sp) || sp <= 0)) return fail("'salePrice' must be positive if provided");
    result.salePrice = sp;
  }
  if (b.variants !== undefined) {
    if (!Array.isArray(b.variants) || b.variants.length === 0) return fail("variants must be a non-empty array");
    const variants: CreateVariantBody[] = [];
    for (let i = 0; i < b.variants.length; i++) {
      const parsed = parseVariant(b.variants[i] as Record<string, unknown>, i);
      if (!parsed.ok) return parsed as Err;
      variants.push((parsed as Ok<CreateVariantBody>).value);
    }
    result.variants = variants;
  }
  if (b.images !== undefined) {
    const imgs: Array<{ url: string; altText?: string | null }> = [];
    if (Array.isArray(b.images)) {
      for (const img of b.images) {
        const i = img as Record<string, unknown>;
        if (i.url && typeof i.url === "string" && i.url.trim())
          imgs.push({ url: i.url.trim(), altText: i.altText ? String(i.altText).trim() : null });
      }
    }
    result.images = imgs;
  }

  if (Object.keys(result).length === 0) return fail("Body must contain at least one field to update");
  return ok(result);
}

// ── Query ──────────────────────────────────────────────────────────────────

export const SORT_OPTIONS = [
  "custom",
  "newest",
  "oldest",
  "price_asc",
  "price_desc",
  "name_asc",
  "name_desc",
] as const;

export type ProductSort = (typeof SORT_OPTIONS)[number];

export interface ProductsQuery {
  page:       number;
  limit:      number;
  search?:    string;
  category?:  string;
  sort:       ProductSort;
  featured?:  boolean;
  status?:    "Active" | "Draft" | "Archived";
  showAll?:   boolean;
}

type ParseOk  = { ok: true;  value: ProductsQuery };
type ParseErr = { ok: false; error: string };

export function parseProductsQuery(
  sp: URLSearchParams,
): ParseOk | ParseErr {
  const rawPage  = sp.get("page")  ?? "1";
  const rawLimit = sp.get("limit") ?? "12";

  const page  = parseInt(rawPage,  10);
  const limit = parseInt(rawLimit, 10);

  if (!Number.isInteger(page)  || page  < 1)
    return { ok: false, error: "'page' must be a positive integer" };
  if (!Number.isInteger(limit) || limit < 1 || limit > 100)
    return { ok: false, error: "'limit' must be between 1 and 100" };

  const rawSort = (sp.get("sort") ?? "newest") as ProductSort;
  if (!(SORT_OPTIONS as readonly string[]).includes(rawSort))
    return { ok: false, error: `'sort' must be one of: ${SORT_OPTIONS.join(", ")}` };

  const rawFeatured = sp.get("featured");
  let featured: boolean | undefined;
  if (rawFeatured === "true")       featured = true;
  else if (rawFeatured === "false") featured = false;
  else if (rawFeatured !== null)
    return { ok: false, error: "'featured' must be 'true' or 'false'" };

  const search   = sp.get("search")   ?? undefined;
  const category = sp.get("category") ?? undefined;

  const rawStatus = sp.get("status") as "Active" | "Draft" | "Archived" | null;
  const status = rawStatus && ["Active", "Draft", "Archived"].includes(rawStatus) ? rawStatus : undefined;
  const showAll = sp.get("showAll") === "true";

  return {
    ok: true,
    value: {
      page,
      limit,
      sort: rawSort,
      ...(search   && { search:   search.trim() }),
      ...(category && { category: category.trim() }),
      ...(featured !== undefined && { featured }),
      ...(status   && { status }),
      ...(showAll  && { showAll }),
    },
  };
}
