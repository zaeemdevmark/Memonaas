import type { NextRequest } from "next/server";
import { parseUpdateCategoryBody }                           from "@/lib/validations/category";
import { getCategoryBySlug, updateCategory,
         deleteCategory }                                    from "@/lib/services/category.service";
import { ok, err }                                          from "@/lib/api/response";
import { handlePrismaError, DatabaseError,
         UniqueConstraintError, RecordNotFoundError }        from "@/lib/db/errors";
import { requireAdmin }                                     from "@/lib/auth/helpers";

function handleError(error: unknown): Response {
  if (error instanceof RecordNotFoundError) return err(error.message, 404);
  if (error instanceof UniqueConstraintError) return err(error.message, 409);
  try { handlePrismaError(error); } catch (mapped: unknown) {
    if (mapped instanceof DatabaseError) return err(mapped.message, 503);
  }
  return err("An unexpected error occurred", 500);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  if (!slug) return err("Invalid category slug", 400);

  try {
    const category = await getCategoryBySlug(slug);
    if (!category) return err("Category not found", 404);
    return ok(category);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  try { await requireAdmin(); } catch { return err("Forbidden", 403); }

  const { slug } = await params;
  if (!slug) return err("Invalid category slug", 400);

  let body: unknown;
  try { body = await request.json(); } catch { return err("Request body must be valid JSON", 400); }

  const parsed = parseUpdateCategoryBody(body);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    const category = await updateCategory(slug, parsed.value);
    return ok(category);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  try { await requireAdmin(); } catch { return err("Forbidden", 403); }

  const { slug } = await params;
  if (!slug) return err("Invalid category slug", 400);

  try {
    await deleteCategory(slug);
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
