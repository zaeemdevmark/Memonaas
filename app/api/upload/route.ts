import type { NextRequest } from "next/server";
import { parseUploadFormData, parseDeleteBody } from "@/lib/validations/upload";
import {
  uploadProductImage, uploadCategoryImage, uploadBrandAsset,
  deleteProductImage, deleteCategoryImage, deleteBrandAsset,
  UploadError,
} from "@/lib/services/upload.service";
import { ok, err }                              from "@/lib/api/response";
import { requireAdmin }                         from "@/lib/auth/helpers";
import { RecordNotFoundError }                  from "@/lib/db/errors";

function handleError(error: unknown): Response {
  if (error instanceof RecordNotFoundError) return err(error.message, 404);
  if (error instanceof UploadError)         return err(error.message, error.status);
  console.error("[POST /api/upload]", error);
  return err("An unexpected error occurred", 500);
}

export async function POST(request: NextRequest): Promise<Response> {
  try { await requireAdmin(); } catch { return err("Forbidden", 403); }

  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return err("Request must be multipart/form-data", 400);
  }

  const parsed = parseUploadFormData(fd);
  if (!parsed.ok) return err(parsed.error, 400);

  const body = parsed.value;

  try {
    if (body.uploadType === "product") {
      const image = await uploadProductImage(
        body.file,
        body.productId,
        body.altText,
        body.position,
      );
      return ok(image, 201);
    }

    if (body.uploadType === "category") {
      const image = await uploadCategoryImage(body.file, body.categorySlug);
      return ok(image, 201);
    }

    // brand
    const asset = await uploadBrandAsset(body.file, body.brandAssetType);
    return ok(asset, 201);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: NextRequest): Promise<Response> {
  try { await requireAdmin(); } catch { return err("Forbidden", 403); }

  let body: unknown;
  try { body = await request.json(); } catch { return err("Request body must be valid JSON", 400); }

  const parsed = parseDeleteBody(body);
  if (!parsed.ok) return err(parsed.error, 400);

  const { uploadType, imageId, categorySlug, brandAssetType } = parsed.value;

  try {
    if (uploadType === "product" && imageId) {
      await deleteProductImage(imageId);
      return ok({ deleted: true });
    }

    if (uploadType === "category" && categorySlug) {
      await deleteCategoryImage(categorySlug);
      return ok({ deleted: true });
    }

    if (uploadType === "brand" && brandAssetType) {
      await deleteBrandAsset(brandAssetType);
      return ok({ deleted: true });
    }

    return err("Missing required fields for this uploadType", 400);
  } catch (error) {
    return handleError(error);
  }
}
