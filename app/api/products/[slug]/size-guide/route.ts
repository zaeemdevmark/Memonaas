import type { NextRequest } from "next/server";
import { parseSizeGuideFormData, parseSizeGuideSlot } from "@/lib/validations/upload";
import { uploadSizeGuideImage, deleteSizeGuideImage } from "@/lib/services/upload.service";
import { ok, err }                                    from "@/lib/api/response";
import { RecordNotFoundError }                        from "@/lib/db/errors";
import { UploadError }                                from "@/lib/services/upload.service";
import { requireAdmin }                               from "@/lib/auth/helpers";

function handleError(error: unknown): Response {
  if (error instanceof RecordNotFoundError) return err(error.message, 404);
  if (error instanceof UploadError)         return err(error.message, error.status);
  return err("An unexpected error occurred", 500);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  try { await requireAdmin(); } catch { return err("Forbidden", 403); }

  const { slug } = await params;
  if (!slug) return err("Invalid product slug", 400);

  let fd: FormData;
  try { fd = await request.formData(); } catch { return err("Request must be multipart/form-data", 400); }

  const parsed = parseSizeGuideFormData(fd);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    const result = await uploadSizeGuideImage(parsed.value.file, slug, parsed.value.slot);
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  try { await requireAdmin(); } catch { return err("Forbidden", 403); }

  const { slug } = await params;
  if (!slug) return err("Invalid product slug", 400);

  const slotRaw = new URL(request.url).searchParams.get("slot");
  const parsed  = parseSizeGuideSlot(slotRaw);
  if (!parsed.ok) return err(parsed.error, 400);

  try {
    await deleteSizeGuideImage(slug, parsed.value);
    return ok({ deleted: true, slot: parsed.value });
  } catch (error) {
    return handleError(error);
  }
}
