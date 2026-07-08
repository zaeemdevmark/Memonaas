import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/helpers";
import { ok, err } from "@/lib/api/response";
import { reorderCategories } from "@/lib/services/category.service";
import { handlePrismaError, DatabaseError } from "@/lib/db/errors";

export async function PATCH(request: NextRequest): Promise<Response> {
  try { await requireAdmin(); } catch { return err("Forbidden", 403); }

  let body: unknown;
  try { body = await request.json(); }
  catch { return err("Request body must be valid JSON", 400); }

  if (typeof body !== "object" || body === null || Array.isArray(body))
    return err("Request body must be a JSON object", 400);

  const order = (body as Record<string, unknown>).order;
  if (!Array.isArray(order) || order.some((id) => typeof id !== "string"))
    return err("'order' must be an array of category ids", 400);

  try {
    await reorderCategories(order as string[]);
    return ok({ updated: order.length });
  } catch (error) {
    try { handlePrismaError(error); } catch (mapped: unknown) {
      if (mapped instanceof DatabaseError) return err(mapped.message, 503);
    }
    return err("An unexpected error occurred", 500);
  }
}
