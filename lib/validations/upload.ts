// ── Result types ────────────────────────────────────────────────────────────

type Ok<T>  = { ok: true;  value: T };
type Err    = { ok: false; error: string };
function ok<T>(v: T): Ok<T>   { return { ok: true,  value: v }; }
function fail(m: string): Err { return { ok: false, error: m }; }

// ── Constants ────────────────────────────────────────────────────────────────

export const MAX_FILE_BYTES = 5 * 1024 * 1024;   // 5 MB
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

// ── Domain types ─────────────────────────────────────────────────────────────

export type UploadType       = "product" | "category" | "brand";
export type BrandAssetTypeValue = "Logo" | "Favicon" | "Banner";

const UPLOAD_TYPES:      UploadType[]         = ["product", "category", "brand"];
const BRAND_ASSET_TYPES: BrandAssetTypeValue[] = ["Logo", "Favicon", "Banner"];

// ── File validation ──────────────────────────────────────────────────────────

export function validateFile(file: File): Ok<true> | Err {
  if (file.size === 0) return fail("File is empty");
  if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
    return fail(
      `Unsupported file type '${file.type}'. Accepted formats: JPEG, PNG, WEBP`,
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    return fail(
      `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 5 MB`,
    );
  }
  return ok(true);
}

// ── Upload request ───────────────────────────────────────────────────────────

export interface ProductUploadRequest {
  uploadType:  "product";
  file:        File;
  productId:   string;
  altText?:    string;
  position?:   number;
}

export interface CategoryUploadRequest {
  uploadType:   "category";
  file:         File;
  categorySlug: string;
}

export interface BrandUploadRequest {
  uploadType:     "brand";
  file:           File;
  brandAssetType: BrandAssetTypeValue;
}

export type UploadRequest =
  | ProductUploadRequest
  | CategoryUploadRequest
  | BrandUploadRequest;

export function parseUploadFormData(
  fd: FormData,
): Ok<UploadRequest> | Err {
  const fileRaw = fd.get("file");
  if (!(fileRaw instanceof File)) return fail("'file' is required and must be a file");

  const fileResult = validateFile(fileRaw);
  if (!fileResult.ok) return fileResult as Err;

  const rawType = fd.get("uploadType");
  if (typeof rawType !== "string" || !UPLOAD_TYPES.includes(rawType as UploadType)) {
    return fail(`'uploadType' must be one of: ${UPLOAD_TYPES.join(", ")}`);
  }
  const uploadType = rawType as UploadType;

  if (uploadType === "product") {
    const productId = fd.get("productId");
    if (typeof productId !== "string" || !productId.trim()) {
      return fail("'productId' is required for product image uploads");
    }
    const altText  = fd.get("altText");
    const posRaw   = fd.get("position");
    const position = typeof posRaw === "string" ? parseInt(posRaw, 10) : undefined;
    return ok({
      uploadType: "product",
      file:       fileRaw,
      productId:  productId.trim(),
      altText:    typeof altText === "string" && altText.trim() ? altText.trim() : undefined,
      position:   Number.isInteger(position) && position! >= 0 ? position : undefined,
    });
  }

  if (uploadType === "category") {
    const categorySlug = fd.get("categorySlug");
    if (typeof categorySlug !== "string" || !categorySlug.trim()) {
      return fail("'categorySlug' is required for category image uploads");
    }
    return ok({ uploadType: "category", file: fileRaw, categorySlug: categorySlug.trim() });
  }

  // brand
  const rawBrandType = fd.get("brandAssetType");
  if (
    typeof rawBrandType !== "string" ||
    !BRAND_ASSET_TYPES.includes(rawBrandType as BrandAssetTypeValue)
  ) {
    return fail(`'brandAssetType' must be one of: ${BRAND_ASSET_TYPES.join(", ")}`);
  }
  return ok({
    uploadType:     "brand",
    file:           fileRaw,
    brandAssetType: rawBrandType as BrandAssetTypeValue,
  });
}

// ── Delete request ───────────────────────────────────────────────────────────

export interface DeleteRequest {
  publicId:       string;
  uploadType:     UploadType;
  imageId?:       string;            // DB ID of the ProductImage record to remove
  categorySlug?:  string;            // Category slug — clear image fields
  brandAssetType?: BrandAssetTypeValue; // Remove this BrandAsset row
}

export function parseDeleteBody(body: unknown): Ok<DeleteRequest> | Err {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return fail("Request body must be a JSON object");
  }
  const b = body as Record<string, unknown>;

  // publicId is optional — the handler looks up image info from the DB by imageId / categorySlug / brandAssetType
  const publicId = typeof b.publicId === "string" ? b.publicId.trim() : "";

  if (typeof b.uploadType !== "string" || !UPLOAD_TYPES.includes(b.uploadType as UploadType)) {
    return fail(`'uploadType' must be one of: ${UPLOAD_TYPES.join(", ")}`);
  }

  const uploadType = b.uploadType as UploadType;

  if (uploadType === "product" && typeof b.imageId !== "string") {
    return fail("'imageId' is required for product image deletion");
  }
  if (uploadType === "category" && typeof b.categorySlug !== "string") {
    return fail("'categorySlug' is required for category image deletion");
  }
  if (uploadType === "brand") {
    if (
      typeof b.brandAssetType !== "string" ||
      !BRAND_ASSET_TYPES.includes(b.brandAssetType as BrandAssetTypeValue)
    ) {
      return fail(`'brandAssetType' must be one of: ${BRAND_ASSET_TYPES.join(", ")}`);
    }
  }

  return ok({
    publicId,
    uploadType,
    imageId:        typeof b.imageId       === "string" ? b.imageId       : undefined,
    categorySlug:   typeof b.categorySlug  === "string" ? b.categorySlug  : undefined,
    brandAssetType: typeof b.brandAssetType === "string" ? b.brandAssetType as BrandAssetTypeValue : undefined,
  });
}

// ── Image PATCH request ───────────────────────────────────────────────────────

export interface UpdateImageBody {
  altText?:   string | null;
  position?:  number;
  isDefault?: boolean;
}

export function parseUpdateImageBody(body: unknown): Ok<UpdateImageBody> | Err {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return fail("Request body must be a JSON object");
  }
  const b = body as Record<string, unknown>;
  const result: UpdateImageBody = {};

  if ("altText" in b) {
    if (b.altText !== null && typeof b.altText !== "string") {
      return fail("'altText' must be a string or null");
    }
    result.altText = b.altText as string | null;
  }
  if ("position" in b) {
    if (typeof b.position !== "number" || !Number.isInteger(b.position) || b.position < 0) {
      return fail("'position' must be a non-negative integer");
    }
    result.position = b.position;
  }
  if ("isDefault" in b) {
    if (typeof b.isDefault !== "boolean") return fail("'isDefault' must be a boolean");
    result.isDefault = b.isDefault;
  }

  if (Object.keys(result).length === 0) return fail("Nothing to update");
  return ok(result);
}

// ── Size guide upload request ─────────────────────────────────────────────────

export function parseSizeGuideFormData(
  fd: FormData,
): Ok<{ file: File; slot: 1 | 2 }> | Err {
  const fileRaw = fd.get("file");
  if (!(fileRaw instanceof File)) return fail("'file' is required and must be a file");

  const fileResult = validateFile(fileRaw);
  if (!fileResult.ok) return fileResult as Err;

  const slotRaw = fd.get("slot");
  if (slotRaw !== "1" && slotRaw !== "2") {
    return fail("'slot' must be '1' or '2'");
  }

  return ok({ file: fileRaw, slot: parseInt(slotRaw, 10) as 1 | 2 });
}

export function parseSizeGuideSlot(raw: string | null): Ok<1 | 2> | Err {
  if (raw !== "1" && raw !== "2") return fail("'slot' query param must be '1' or '2'");
  return ok(parseInt(raw, 10) as 1 | 2);
}

// ── Reorder request ───────────────────────────────────────────────────────────

export interface ReorderItem {
  id:       string;
  position: number;
}

export function parseReorderBody(body: unknown): Ok<ReorderItem[]> | Err {
  if (!Array.isArray(body)) return fail("Request body must be an array");
  if (body.length === 0)    return fail("Array must not be empty");

  const items: ReorderItem[] = [];
  for (let i = 0; i < body.length; i++) {
    const item = body[i];
    if (typeof item !== "object" || item === null) {
      return fail(`Item at index ${i} must be an object`);
    }
    const { id, position } = item as Record<string, unknown>;
    if (typeof id !== "string" || !id)            return fail(`Item[${i}].id must be a non-empty string`);
    if (typeof position !== "number" || !Number.isInteger(position) || position < 0) {
      return fail(`Item[${i}].position must be a non-negative integer`);
    }
    items.push({ id, position });
  }
  return ok(items);
}
