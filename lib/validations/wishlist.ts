type Ok<T> = { ok: true; value: T };
type Err   = { ok: false; error: string };
function ok<T>(v: T): Ok<T> { return { ok: true, value: v }; }
function fail(m: string): Err { return { ok: false, error: m }; }

export interface AddToWishlistBody {
  productId: string;
}

export function parseAddToWishlistBody(input: unknown): Ok<AddToWishlistBody> | Err {
  if (typeof input !== "object" || input === null || Array.isArray(input))
    return fail("Body must be a JSON object");
  const b = input as Record<string, unknown>;

  const productId = b.productId;
  if (typeof productId !== "string" || !productId.trim())
    return fail("'productId' is required");

  return ok({ productId });
}
