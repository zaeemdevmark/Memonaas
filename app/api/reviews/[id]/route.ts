import type { NextRequest } from "next/server";
import { auth }                           from "@/auth";
import { parseUpdateReviewBody,
         parseModerateReviewBody }        from "@/lib/validations/review";
import { updateReview, deleteReview,
         moderateReview, ReviewError }    from "@/lib/services/review.service";
import { ok, err }                        from "@/lib/api/response";
import { handlePrismaError, DatabaseError,
         RecordNotFoundError }            from "@/lib/db/errors";

function handleError(error: unknown): Response {
  if (error instanceof ReviewError)         return err(error.message, error.status);
  if (error instanceof RecordNotFoundError) return err(error.message, 404);
  try { handlePrismaError(error); } catch (mapped: unknown) {
    if (mapped instanceof DatabaseError) return err(mapped.message, 503);
  }
  return err("An unexpected error occurred", 500);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) return err("Unauthorized", 401);

  const { id } = await params;
  if (!id) return err("Invalid review id", 400);

  let body: unknown;
  try { body = await request.json(); } catch { return err("Request body must be valid JSON", 400); }

  const isAdmin = session.user.role === "Admin";
  const rawBody = body as Record<string, unknown>;

  if (isAdmin && "isApproved" in rawBody) {
    const parsed = parseModerateReviewBody(body);
    if (!parsed.ok) return err(parsed.error, 400);
    try {
      const review = await moderateReview(id, parsed.value);
      return ok(review);
    } catch (error) {
      return handleError(error);
    }
  }

  // Customer editing their own review — requires a Customer profile
  const customerId = session.user.customerId;
  if (!customerId) return err("Unauthorized", 401);

  const parsed = parseUpdateReviewBody(body);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    const review = await updateReview(id, customerId, parsed.value);
    return ok(review);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) return err("Unauthorized", 401);

  const { id } = await params;
  if (!id) return err("Invalid review id", 400);

  // For admins, pass empty customerId — the role check bypasses ownership
  const customerId = session.user.customerId ?? "";

  try {
    await deleteReview(id, customerId, session.user.role ?? "Customer");
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
