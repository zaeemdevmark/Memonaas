import type { NextRequest } from "next/server";
import { listInventory, InventoryError } from "@/lib/services/inventory.service";
import { parseInventoryQuery }           from "@/lib/validations/inventory";
import { ok, err, paginated, buildPagination } from "@/lib/api/response";
import { handlePrismaError, DatabaseError }    from "@/lib/db/errors";
import { requireAdmin }                        from "@/lib/auth/helpers";

// ── GET /api/inventory ─────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<Response> {
  try { await requireAdmin(); } catch { return err("Forbidden", 403); }

  const parsed = parseInventoryQuery(request.nextUrl.searchParams);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    const { items, total } = await listInventory(parsed.value);
    return paginated(items, buildPagination(parsed.value.page, parsed.value.limit, total));
  } catch (error) {
    if (error instanceof InventoryError) {
      return err(error.message, error.status);
    }
    try { handlePrismaError(error); } catch (mapped: unknown) {
      if (mapped instanceof DatabaseError) return err(mapped.message, 503);
    }
    return err("An unexpected error occurred", 500);
  }
}
