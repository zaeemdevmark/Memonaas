import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { ok, err } from "@/lib/api/response";
import { removeFromWishlist } from "@/lib/services/wishlist.service";
import { handlePrismaError, DatabaseError } from "@/lib/db/errors";

async function getAuthCustomerId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.customerId || session.user.role !== "Customer") return null;
  return session.user.customerId;
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
): Promise<Response> {
  const customerId = await getAuthCustomerId();
  if (!customerId) return err("Unauthorized", 401);

  const { productId } = await params;

  try {
    const wishlist = await removeFromWishlist(customerId, productId);
    return ok(wishlist);
  } catch (error) {
    try { handlePrismaError(error); } catch (mapped: unknown) {
      if (mapped instanceof DatabaseError) return err(mapped.message, 503);
    }
    return err("An unexpected error occurred", 500);
  }
}
