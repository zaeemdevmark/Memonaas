import type { NextRequest } from "next/server";
import { requireAdmin }   from "@/lib/auth/helpers";
import { searchCustomers } from "@/lib/services/customer.service";
import { paginated, buildPagination, err } from "@/lib/api/response";
import { handlePrismaError, DatabaseError } from "@/lib/db/errors";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    await requireAdmin();
  } catch {
    return err("Unauthorized", 401);
  }

  const sp     = request.nextUrl.searchParams;
  const search = sp.get("search") ?? "";
  const page   = Math.max(1, Number(sp.get("page")  ?? "1"));
  const limit  = Math.min(100, Math.max(1, Number(sp.get("limit") ?? "20")));

  try {
    const { customers, total } = await searchCustomers(search, page, limit);
    return paginated(customers, buildPagination(page, limit, total));
  } catch (error) {
    try { handlePrismaError(error); } catch (mapped: unknown) {
      if (mapped instanceof DatabaseError) return err(mapped.message, 503);
    }
    return err("An unexpected error occurred", 500);
  }
}
