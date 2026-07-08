import type { NextRequest } from "next/server";
import { getBrandAsset, deleteBrandAsset, UploadError } from "@/lib/services/upload.service";
import { ok, err }                                      from "@/lib/api/response";
import { requireAdmin }                                 from "@/lib/auth/helpers";
import { RecordNotFoundError }                          from "@/lib/db/errors";
import type { BrandAssetTypeValue }                     from "@/lib/validations/upload";

const VALID_TYPES: BrandAssetTypeValue[] = ["Logo", "Favicon", "Banner"];

function handleError(error: unknown): Response {
  if (error instanceof RecordNotFoundError) return err(error.message, 404);
  if (error instanceof UploadError)         return err(error.message, error.status);
  console.error("[/api/brand-assets/[type]]", error);
  return err("An unexpected error occurred", 500);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string }> },
): Promise<Response> {
  const { type } = await params;

  if (!VALID_TYPES.includes(type as BrandAssetTypeValue)) {
    return err(`Invalid asset type. Must be one of: ${VALID_TYPES.join(", ")}`, 400);
  }

  try {
    const asset = await getBrandAsset(type as BrandAssetTypeValue);
    if (!asset) return err("Brand asset not found", 404);
    return ok(asset);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string }> },
): Promise<Response> {
  try { await requireAdmin(); } catch { return err("Forbidden", 403); }

  const { type } = await params;

  if (!VALID_TYPES.includes(type as BrandAssetTypeValue)) {
    return err(`Invalid asset type. Must be one of: ${VALID_TYPES.join(", ")}`, 400);
  }

  try {
    await deleteBrandAsset(type as BrandAssetTypeValue);
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
