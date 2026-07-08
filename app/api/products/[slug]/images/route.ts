import type { NextRequest } from "next/server";
import { parseReorderBody }       from "@/lib/validations/upload";
import { getProductImages, reorderProductImages, UploadError } from "@/lib/services/upload.service";
import { ok, err }                from "@/lib/api/response";
import { requireAdmin }           from "@/lib/auth/helpers";
import { RecordNotFoundError }    from "@/lib/db/errors";
import prisma                     from "@/lib/prisma";

function handleError(error: unknown): Response {
  if (error instanceof RecordNotFoundError) return err(error.message, 404);
  if (error instanceof UploadError)         return err(error.message, error.status);
  console.error("[/api/products/[slug]/images]", error);
  return err("An unexpected error occurred", 500);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;

  try {
    const product = await prisma.product.findUnique({
      where:  { slug },
      select: { id: true },
    });
    if (!product) return err("Product not found", 404);

    const images = await getProductImages(product.id);
    return ok(images);
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

  let body: unknown;
  try { body = await request.json(); } catch { return err("Request body must be valid JSON", 400); }

  const parsed = parseReorderBody(body);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    const product = await prisma.product.findUnique({
      where:  { slug },
      select: { id: true },
    });
    if (!product) return err("Product not found", 404);

    await reorderProductImages(parsed.value);
    const images = await getProductImages(product.id);
    return ok(images);
  } catch (error) {
    return handleError(error);
  }
}
