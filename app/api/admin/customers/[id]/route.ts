import type { NextRequest } from "next/server";
import { requireAdmin }      from "@/lib/auth/helpers";
import { getCustomerDetail } from "@/lib/services/customer.service";
import { ok, err }           from "@/lib/api/response";
import { handlePrismaError, DatabaseError } from "@/lib/db/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    await requireAdmin();
  } catch {
    return err("Unauthorized", 401);
  }

  const { id } = await params;
  if (!id) return err("Customer id is required", 400);

  try {
    const customer = await getCustomerDetail(id);
    if (!customer) return err("Customer not found", 404);
    return ok(customer);
  } catch (error) {
    try { handlePrismaError(error); } catch (mapped: unknown) {
      if (mapped instanceof DatabaseError) return err(mapped.message, 503);
    }
    return err("An unexpected error occurred", 500);
  }
}
