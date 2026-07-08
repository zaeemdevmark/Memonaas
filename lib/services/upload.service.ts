import cloudinary from "@/lib/cloudinary";
import prisma     from "@/lib/prisma";
import { RecordNotFoundError } from "@/lib/db/errors";
import type { ImageUrls, ProductImageDTO, CategoryImageDTO, BrandAssetDTO, SizeGuideImageDTO } from "@/lib/types/upload";
import type { BrandAssetTypeValue } from "@/lib/validations/upload";
import { BrandAssetType } from "@prisma/client";

// ── Domain error ─────────────────────────────────────────────────────────────

export class UploadError extends Error {
  constructor(
    message: string,
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = "UploadError";
  }
}

// ── Cloudinary folders ───────────────────────────────────────────────────────

const FOLDERS = {
  product:  "memonaas/products",
  category: "memonaas/categories",
  brand:    "memonaas/brand",
} as const;

// ── URL generation ────────────────────────────────────────────────────────────

function buildUrls(publicId: string): ImageUrls {
  const url = cloudinary.url(publicId, { secure: true });

  const optimizedUrl = cloudinary.url(publicId, {
    fetch_format: "auto",
    quality:      "auto",
    secure:       true,
  });

  const thumbnailUrl = cloudinary.url(publicId, {
    width:        400,
    height:       500,
    crop:         "fill",
    gravity:      "auto",
    fetch_format: "auto",
    quality:      "auto",
    secure:       true,
  });

  return { url, optimizedUrl, thumbnailUrl, publicId };
}

// ── Core upload / delete (Cloudinary only) ────────────────────────────────────

// Cloudinary v2 SDK throws plain objects, not Error instances.
// Shape: { message: string; http_code?: number } or { error: { message: string } }
function cloudinaryMessage(cause: unknown): string {
  if (cause instanceof Error) return cause.message;
  if (cause && typeof cause === "object") {
    const obj = cause as Record<string, unknown>;
    if (typeof obj.message === "string" && obj.message) return obj.message;
    if (obj.error && typeof obj.error === "object") {
      const inner = obj.error as Record<string, unknown>;
      if (typeof inner.message === "string" && inner.message) return inner.message;
    }
    // Last resort: at least give a status code if present
    if (typeof obj.http_code === "number") return `HTTP ${obj.http_code}`;
  }
  return "Unknown error";
}

function checkCredentials(): void {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY    ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new UploadError(
      "Cloudinary credentials are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.",
      503,
    );
  }
}

export async function uploadImage(
  file:   File,
  folder: string,
): Promise<ImageUrls> {
  checkCredentials();

  let result;
  try {
    const bytes   = await file.arrayBuffer();
    const buffer  = Buffer.from(bytes);
    const base64  = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: "image",
    });
  } catch (cause) {
    throw new UploadError(
      `Cloudinary upload failed: ${cloudinaryMessage(cause)}`,
      502,
    );
  }

  return buildUrls(result.public_id);
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (cause) {
    throw new UploadError(
      `Cloudinary deletion failed: ${cloudinaryMessage(cause)}`,
      502,
    );
  }
}

export async function replaceImage(
  oldPublicId: string,
  newFile:     File,
  folder:      string,
): Promise<ImageUrls> {
  const urls = await uploadImage(newFile, folder);
  // Delete old file in the background — don't block the response
  void deleteImage(oldPublicId).catch((err) =>
    console.error(`[upload] Failed to delete old asset '${oldPublicId}':`, err),
  );
  return urls;
}

// ── Product image operations ──────────────────────────────────────────────────

function serializeProductImage(img: {
  id: string; productId: string;
  url: string; optimizedUrl: string | null; thumbnailUrl: string | null; publicId: string | null;
  altText: string | null; position: number; isDefault: boolean;
  createdAt: Date; updatedAt: Date;
}): ProductImageDTO {
  return {
    id:           img.id,
    productId:    img.productId,
    url:          img.url,
    optimizedUrl: img.optimizedUrl,
    thumbnailUrl: img.thumbnailUrl,
    publicId:     img.publicId,
    altText:      img.altText,
    position:     img.position,
    isDefault:    img.isDefault,
    createdAt:    img.createdAt.toISOString(),
    updatedAt:    img.updatedAt.toISOString(),
  };
}

export async function uploadProductImage(
  file:      File,
  productId: string,
  altText?:  string,
  position?: number,
): Promise<ProductImageDTO> {
  // Verify product exists
  const product = await prisma.product.findUnique({
    where:  { id: productId },
    select: { id: true },
  });
  if (!product) throw new RecordNotFoundError("Product");

  // Determine position (append after last)
  let finalPosition = position;
  if (finalPosition === undefined) {
    const last = await prisma.productImage.findFirst({
      where:   { productId },
      orderBy: { position: "desc" },
      select:  { position: true },
    });
    finalPosition = last ? last.position + 1 : 0;
  }

  // Upload to Cloudinary
  const urls = await uploadImage(file, FOLDERS.product);

  // If this is the first image for the product, mark as default
  const imageCount = await prisma.productImage.count({ where: { productId } });
  const isDefault  = imageCount === 0;

  const img = await prisma.productImage.create({
    data: {
      productId,
      url:          urls.url,
      optimizedUrl: urls.optimizedUrl,
      thumbnailUrl: urls.thumbnailUrl,
      publicId:     urls.publicId,
      altText:      altText ?? null,
      position:     finalPosition,
      isDefault,
    },
  });

  return serializeProductImage(img);
}

export async function getProductImages(productId: string): Promise<ProductImageDTO[]> {
  const images = await prisma.productImage.findMany({
    where:   { productId },
    orderBy: { position: "asc" },
  });
  return images.map(serializeProductImage);
}

export async function updateProductImage(
  imageId:   string,
  data: { altText?: string | null; position?: number; isDefault?: boolean },
): Promise<ProductImageDTO> {
  const existing = await prisma.productImage.findUnique({
    where:  { id: imageId },
    select: { id: true, productId: true, isDefault: true },
  });
  if (!existing) throw new RecordNotFoundError("ProductImage");

  // If setting as default, clear current default first
  if (data.isDefault === true && !existing.isDefault) {
    await prisma.productImage.updateMany({
      where: { productId: existing.productId, isDefault: true },
      data:  { isDefault: false },
    });
  }

  const img = await prisma.productImage.update({
    where: { id: imageId },
    data: {
      ...(data.altText   !== undefined && { altText:   data.altText }),
      ...(data.position  !== undefined && { position:  data.position }),
      ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
    },
  });

  return serializeProductImage(img);
}

export async function reorderProductImages(
  items: { id: string; position: number }[],
): Promise<void> {
  await Promise.all(
    items.map(({ id, position }) =>
      prisma.productImage.update({ where: { id }, data: { position } }),
    ),
  );
}

export async function deleteProductImage(imageId: string): Promise<void> {
  const img = await prisma.productImage.findUnique({
    where:  { id: imageId },
    select: { publicId: true, productId: true, isDefault: true },
  });
  if (!img) throw new RecordNotFoundError("ProductImage");

  await prisma.productImage.delete({ where: { id: imageId } });

  // If it was the default, promote the next image
  if (img.isDefault) {
    const next = await prisma.productImage.findFirst({
      where:   { productId: img.productId },
      orderBy: { position: "asc" },
      select:  { id: true },
    });
    if (next) {
      await prisma.productImage.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  }

  // Delete from Cloudinary (fire and forget — don't fail the request if Cloudinary is down)
  if (img.publicId) {
    void deleteImage(img.publicId).catch((err) =>
      console.error(`[upload] Failed to delete product image '${img.publicId}' from Cloudinary:`, err),
    );
  }
}

// ── Category image operations ─────────────────────────────────────────────────

export async function uploadCategoryImage(
  file:         File,
  categorySlug: string,
): Promise<CategoryImageDTO> {
  const category = await prisma.category.findUnique({
    where:  { slug: categorySlug },
    select: { id: true, imagePublicId: true },
  });
  if (!category) throw new RecordNotFoundError("Category");

  // If category already has an image, replace it
  const urls = category.imagePublicId
    ? await replaceImage(category.imagePublicId, file, FOLDERS.category)
    : await uploadImage(file, FOLDERS.category);

  await prisma.category.update({
    where: { id: category.id },
    data: {
      imageUrl:          urls.url,
      imagePublicId:     urls.publicId,
      imageOptimizedUrl: urls.optimizedUrl,
      imageThumbnailUrl: urls.thumbnailUrl,
    },
  });

  return { categoryId: category.id, ...urls };
}

export async function deleteCategoryImage(categorySlug: string): Promise<void> {
  const category = await prisma.category.findUnique({
    where:  { slug: categorySlug },
    select: { id: true, imagePublicId: true },
  });
  if (!category) throw new RecordNotFoundError("Category");
  if (!category.imagePublicId) return; // nothing to delete

  await prisma.category.update({
    where: { id: category.id },
    data: {
      imageUrl:          null,
      imagePublicId:     null,
      imageOptimizedUrl: null,
      imageThumbnailUrl: null,
    },
  });

  void deleteImage(category.imagePublicId).catch((err) =>
    console.error(`[upload] Failed to delete category image '${category.imagePublicId}':`, err),
  );
}

// ── Brand asset operations ────────────────────────────────────────────────────

function prismaAssetType(type: BrandAssetTypeValue): BrandAssetType {
  return BrandAssetType[type];
}

function serializeBrandAsset(asset: {
  id: string; type: BrandAssetType;
  url: string; optimizedUrl: string; thumbnailUrl: string; publicId: string;
  createdAt: Date; updatedAt: Date;
}): BrandAssetDTO {
  return {
    id:           asset.id,
    type:         asset.type,
    url:          asset.url,
    optimizedUrl: asset.optimizedUrl,
    thumbnailUrl: asset.thumbnailUrl,
    publicId:     asset.publicId,
    createdAt:    asset.createdAt.toISOString(),
    updatedAt:    asset.updatedAt.toISOString(),
  };
}

export async function uploadBrandAsset(
  file:           File,
  brandAssetType: BrandAssetTypeValue,
): Promise<BrandAssetDTO> {
  const type = prismaAssetType(brandAssetType);

  // If a record already exists for this type, get its publicId to replace
  const existing = await prisma.brandAsset.findUnique({
    where:  { type },
    select: { publicId: true },
  });

  const urls = existing
    ? await replaceImage(existing.publicId, file, FOLDERS.brand)
    : await uploadImage(file, FOLDERS.brand);

  const asset = await prisma.brandAsset.upsert({
    where:  { type },
    update: {
      url:          urls.url,
      optimizedUrl: urls.optimizedUrl,
      thumbnailUrl: urls.thumbnailUrl,
      publicId:     urls.publicId,
    },
    create: {
      type,
      url:          urls.url,
      optimizedUrl: urls.optimizedUrl,
      thumbnailUrl: urls.thumbnailUrl,
      publicId:     urls.publicId,
    },
  });

  return serializeBrandAsset(asset);
}

export async function getBrandAssets(): Promise<BrandAssetDTO[]> {
  const assets = await prisma.brandAsset.findMany({ orderBy: { type: "asc" } });
  return assets.map(serializeBrandAsset);
}

export async function getBrandAsset(type: BrandAssetTypeValue): Promise<BrandAssetDTO | null> {
  const asset = await prisma.brandAsset.findUnique({
    where: { type: prismaAssetType(type) },
  });
  return asset ? serializeBrandAsset(asset) : null;
}

export async function deleteBrandAsset(brandAssetType: BrandAssetTypeValue): Promise<void> {
  const type  = prismaAssetType(brandAssetType);
  const asset = await prisma.brandAsset.findUnique({
    where:  { type },
    select: { publicId: true },
  });
  if (!asset) throw new RecordNotFoundError("BrandAsset");

  await prisma.brandAsset.delete({ where: { type } });

  void deleteImage(asset.publicId).catch((err) =>
    console.error(`[upload] Failed to delete brand asset '${asset.publicId}':`, err),
  );
}

// ── Size guide image operations ───────────────────────────────────────────────

const SIZE_GUIDE_FOLDER = "memonaas/size-guides";

export async function uploadSizeGuideImage(
  file:        File,
  productSlug: string,
  slot:        1 | 2,
): Promise<SizeGuideImageDTO> {
  const product = await prisma.product.findUnique({
    where:  { slug: productSlug },
    select: {
      id:                         true,
      sizeGuideImage1PublicId:    true,
      sizeGuideImage2PublicId:    true,
    },
  });
  if (!product) throw new RecordNotFoundError("Product");

  const existingPublicId =
    slot === 1 ? product.sizeGuideImage1PublicId : product.sizeGuideImage2PublicId;

  const urls = existingPublicId
    ? await replaceImage(existingPublicId, file, SIZE_GUIDE_FOLDER)
    : await uploadImage(file, SIZE_GUIDE_FOLDER);

  const data =
    slot === 1
      ? {
          sizeGuideImage1Url:          urls.url,
          sizeGuideImage1OptimizedUrl: urls.optimizedUrl,
          sizeGuideImage1PublicId:     urls.publicId,
        }
      : {
          sizeGuideImage2Url:          urls.url,
          sizeGuideImage2OptimizedUrl: urls.optimizedUrl,
          sizeGuideImage2PublicId:     urls.publicId,
        };

  await prisma.product.update({ where: { id: product.id }, data });

  return { slot, url: urls.url, optimizedUrl: urls.optimizedUrl };
}

export async function deleteSizeGuideImage(
  productSlug: string,
  slot:        1 | 2,
): Promise<void> {
  const product = await prisma.product.findUnique({
    where:  { slug: productSlug },
    select: {
      id:                         true,
      sizeGuideImage1PublicId:    true,
      sizeGuideImage2PublicId:    true,
    },
  });
  if (!product) throw new RecordNotFoundError("Product");

  const publicId =
    slot === 1 ? product.sizeGuideImage1PublicId : product.sizeGuideImage2PublicId;

  const clearData =
    slot === 1
      ? { sizeGuideImage1Url: null, sizeGuideImage1OptimizedUrl: null, sizeGuideImage1PublicId: null }
      : { sizeGuideImage2Url: null, sizeGuideImage2OptimizedUrl: null, sizeGuideImage2PublicId: null };

  await prisma.product.update({ where: { id: product.id }, data: clearData });

  if (publicId) {
    void deleteImage(publicId).catch((err) =>
      console.error(`[upload] Failed to delete size guide image '${publicId}':`, err),
    );
  }
}
