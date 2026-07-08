import type { NextRequest } from "next/server";
import { parseProductsQuery, parseCreateProductBody } from "@/lib/validations/product";
import { getProducts, createProduct }                 from "@/lib/services/product.service";
import { ok, paginated, err, buildPagination }        from "@/lib/api/response";
import { handlePrismaError, DatabaseError,
         UniqueConstraintError }                      from "@/lib/db/errors";
import { requireAdmin }                               from "@/lib/auth/helpers";

function handleError(error: unknown): Response {
  if (error instanceof UniqueConstraintError) return err(error.message, 409);
  try { handlePrismaError(error); } catch (mapped: unknown) {
    if (mapped instanceof DatabaseError) return err(mapped.message, 503);
  }
  return err("An unexpected error occurred", 500);
}

export async function GET(request: NextRequest): Promise<Response> {
  const sp = request.nextUrl.searchParams;

  const parsed = parseProductsQuery(sp);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    const { items, total } = await getProducts(parsed.value);
    const { page, limit }  = parsed.value;
    return paginated(items, buildPagination(page, limit, total));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try { await requireAdmin(); } catch { return err("Forbidden", 403); }

  let body: unknown;
  try { body = await request.json(); } catch { return err("Request body must be valid JSON", 400); }

  const parsed = parseCreateProductBody(body);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    const product = await createProduct(parsed.value);
    return ok(product, 201);
  } catch (error) {
    return handleError(error);
  }
}
