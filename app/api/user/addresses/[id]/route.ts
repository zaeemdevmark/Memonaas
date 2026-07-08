import type { NextRequest } from "next/server";
import { auth }              from "@/auth";
import { ok, err }           from "@/lib/api/response";
import {
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  AddressError,
}                            from "@/lib/services/address.service";
import { parseUpdateAddressBody } from "@/lib/validations/address";
import { handlePrismaError, DatabaseError } from "@/lib/db/errors";

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const customerId = await getAuthCustomerId();
  if (!customerId) return err("Unauthorized", 401);

  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); }
  catch { return err("Request body must be valid JSON", 400); }

  if (typeof body === "object" && body !== null && (body as Record<string, unknown>).setDefault === true) {
    try {
      const address = await setDefaultAddress(customerId, id);
      return ok(address);
    } catch (error) {
      return handleError(error);
    }
  }

  const parsed = parseUpdateAddressBody(body);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    const address = await updateAddress(customerId, id, parsed.value);
    return ok(address);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const customerId = await getAuthCustomerId();
  if (!customerId) return err("Unauthorized", 401);

  const { id } = await params;

  try {
    await deleteAddress(customerId, id);
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
