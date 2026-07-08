import type { NextRequest } from "next/server";
import { parseUpdateImageBody }                                from "@/lib/validations/upload";
import { updateProductImage, deleteProductImage, UploadError } from "@/lib/services/upload.service";
import { ok, err }                                            from "@/lib/api/response";
import { requireAdmin }                                       from "@/lib/auth/helpers";
import { RecordNotFoundError }                                from "@/lib/db/errors";

function handleError(error: unknown): Response {
  if (error instanceof RecordNotFoundError) return err(error.message, 404);
  if (error instanceof UploadError)         return err(error.message, error.status);
  console.error("[/api/products/[slug]/images/[imageId]]", error);
  return err("An unexpected error occurred", 500);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; imageId: string }> },
): Promise<Response> {
  try { await requireAdmin(); } catch { return err("Forbidden", 403); }

  const { imageId } = await params;
  if (!imageId) return err("Invalid image ID", 400);

  let body: unknown;
  try { body = await request.json(); } catch { return err("Request body must be valid JSON", 400); }

  const parsed = parseUpdateImageBody(body);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    const image = await updateProductImage(imageId, parsed.value);
    return ok(image);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; imageId: string }> },
): Promise<Response> {
  try { await requireAdmin(); } catch { return err("Forbidden", 403); }

  const { imageId } = await params;
  if (!imageId) return err("Invalid image ID", 400);

  try {
    await deleteProductImage(imageId);
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
