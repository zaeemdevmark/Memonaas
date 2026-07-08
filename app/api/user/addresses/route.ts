import type { NextRequest } from "next/server";
import { auth }              from "@/auth";
import { ok, err }           from "@/lib/api/response";
import { getAddresses, createAddress, AddressError } from "@/lib/services/address.service";
import { parseCreateAddressBody }                    from "@/lib/validations/address";
import { handlePrismaError, DatabaseError }          from "@/lib/db/errors";

async function getAuthCustomerId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.customerId || session.user.role !== "Customer") return null;
  return session.user.customerId;
}

function handleError(error: unknown): Response {
  if (error instanceof AddressError) return err(error.message, error.status);
  try { handlePrismaError(error); } catch (mapped: unknown) {
    if (mapped instanceof DatabaseError) return err(mapped.message, 503);
  }
  return err("An unexpected error occurred", 500);
}

export async function GET(): Promise<Response> {
  const customerId = await getAuthCustomerId();
  if (!customerId) return err("Unauthorized", 401);

  try {
    const addresses = await getAddresses(customerId);
    return ok(addresses);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const customerId = await getAuthCustomerId();
  if (!customerId) return err("Unauthorized", 401);

  let body: unknown;
  try { body = await request.json(); }
  catch { return err("Request body must be valid JSON", 400); }

  const parsed = parseCreateAddressBody(body);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    const address = await createAddress(customerId, parsed.value);
    return ok(address, 201);
  } catch (error) {
    return handleError(error);
  }
}
