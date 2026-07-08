import type { NextRequest } from "next/server";
import { parseCategoriesQuery, parseCreateCategoryBody } from "@/lib/validations/category";
import { getCategories, createCategory }                 from "@/lib/services/category.service";
import { ok, err }                                       from "@/lib/api/response";
import { handlePrismaError, DatabaseError,
         UniqueConstraintError }                         from "@/lib/db/errors";
import { requireAdmin }                                  from "@/lib/auth/helpers";

function handleError(error: unknown): Response {
  if (error instanceof UniqueConstraintError) return err(error.message, 409);
  try { handlePrismaError(error); } catch (mapped: unknown) {
    if (mapped instanceof DatabaseError) return err(mapped.message, 503);
  }
  return err("An unexpected error occurred", 500);
}

export async function GET(request: NextRequest): Promise<Response> {
  const sp = request.nextUrl.searchParams;

  const parsed = parseCategoriesQuery(sp);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    const data = await getCategories(parsed.value.tree, parsed.value.showAll);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try { await requireAdmin(); } catch { return err("Forbidden", 403); }

  let body: unknown;
  try { body = await request.json(); } catch { return err("Request body must be valid JSON", 400); }

  const parsed = parseCreateCategoryBody(body);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    const category = await createCategory(parsed.value);
    return ok(category, 201);
  } catch (error) {
    return handleError(error);
  }
}
