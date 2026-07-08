import type { NextRequest } from "next/server";
import { auth }                           from "@/auth";
import { parseReviewsQuery,
         parseCreateReviewBody }          from "@/lib/validations/review";
import { listProductReviews,
         createReview, ReviewError }      from "@/lib/services/review.service";
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  if (!slug) return err("Invalid product slug", 400);

  const parsed = parseReviewsQuery(request.nextUrl.searchParams);
  if (!parsed.ok) return err(parsed.error, 400);

  const session    = await auth();
  const customerId = session?.user?.customerId ?? undefined;

  try {
    const result = await listProductReviews(slug, parsed.value, customerId, !!session?.user);
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const session = await auth();
  if (!session?.user?.customerId) return err("Unauthorized", 401);

  const { slug } = await params;
  if (!slug) return err("Invalid product slug", 400);

  let body: unknown;
  try { body = await request.json(); } catch { return err("Request body must be valid JSON", 400); }

  const parsed = parseCreateReviewBody(body);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    const review = await createReview(slug, session.user.customerId, parsed.value);
    return ok(review, 201);
  } catch (error) {
    return handleError(error);
  }
}
