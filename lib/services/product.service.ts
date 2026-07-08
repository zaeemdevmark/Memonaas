import { Prisma, ProductStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import type { ProductsQuery, ProductSort, CreateProductBody, UpdateProductBody } from "@/lib/validations/product";
import { RecordNotFoundError } from "@/lib/db/errors";

// ── Helpers ────────────────────────────────────────────────────────────────

function d(val: Prisma.Decimal | null | undefined): number | null {
  return val == null ? null : val.toNumber();
}

const ORDER_MAP: Record<ProductSort, Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[]> = {
  custom:     [{ sortOrder: "asc" }, { createdAt: "desc" }],
  newest:     { createdAt: "desc" },
  oldest:     { createdAt: "asc" },
  price_asc:  { basePrice: "asc"  },
  price_desc: { basePrice: "desc" },
  name_asc:   { name:      "asc"  },
  name_desc:  { name:      "desc" },
};

// ── Types ──────────────────────────────────────────────────────────────────

const productListSelect = {
  id:          true,
  name:        true,
  slug:        true,
  sku:         true,
  description: true,
  basePrice:   true,
  salePrice:   true,
  status:      true,
  isFeatured:  true,
  sortOrder:   true,
  createdAt:   true,
  updatedAt:   true,
  sizeGuideImage1Url:          true,
  sizeGuideImage1OptimizedUrl: true,
  sizeGuideImage2Url:          true,
  sizeGuideImage2OptimizedUrl: true,
  tab1Title:   true,
  tab1Content: true,
  category: { select: { id: true, name: true, slug: true, description: true, sortOrder: true } },
  images: {
    orderBy: [{ isDefault: "desc" }, { position: "asc" }] as Prisma.ProductImageOrderByWithRelationInput[],
    take:    2,
    select:  { url: true, optimizedUrl: true, thumbnailUrl: true, publicId: true, altText: true },
  },
  variants: {
    select: {
      id:            true,
      size:          true,
      color:         true,
      colorHex:      true,
      stock:         true,
      reservedStock: true,
      price:         true,
      salePrice:     true,
    },
  },
  _count: {
    select: {
      reviews:       { where: { isApproved: true } as Prisma.ReviewWhereInput },
      wishlistItems: true,
    },
  },
} satisfies Prisma.ProductSelect;

type ProductListRow = Prisma.ProductGetPayload<{ select: typeof productListSelect }>;

function serializeListItem(p: ProductListRow) {
  return {
    id:          p.id,
    name:        p.name,
    slug:        p.slug,
    sku:         p.sku,
    description: p.description,
    basePrice:   p.basePrice.toNumber(),
    salePrice:   d(p.salePrice),
    status:      p.status,
    isFeatured:  p.isFeatured,
    sortOrder:   p.sortOrder,
    // totalStock = available (stock − reserved) so admin sees what's actually sellable
    totalStock:  p.variants.reduce((sum, v) => sum + Math.max(0, v.stock - v.reservedStock), 0),
    category:    p.category,
    image:       p.images[0] ?? null,
    hoverImage:  p.images[1] ?? null,
    variants:    p.variants.map((v) => ({
      id:        v.id,
      size:      v.size,
      color:     v.color,
      colorHex:  v.colorHex,
      stock:     Math.max(0, v.stock - v.reservedStock),
      price:     v.price.toNumber(),
      salePrice: d(v.salePrice),
    })),
    sizeGuideImage1: p.sizeGuideImage1Url
      ? { url: p.sizeGuideImage1Url, optimizedUrl: p.sizeGuideImage1OptimizedUrl ?? p.sizeGuideImage1Url }
      : null,
    sizeGuideImage2: p.sizeGuideImage2Url
      ? { url: p.sizeGuideImage2Url, optimizedUrl: p.sizeGuideImage2OptimizedUrl ?? p.sizeGuideImage2Url }
      : null,
    tab1Title:   p.tab1Title   ?? null,
    tab1Content: p.tab1Content ?? null,
    reviewCount:   p._count.reviews,
    wishlistCount: p._count.wishlistItems,
    createdAt:   p.createdAt.toISOString(),
    updatedAt:   p.updatedAt.toISOString(),
  };
}

// ── getProducts ────────────────────────────────────────────────────────────

export type ProductListResult = {
  items: ReturnType<typeof serializeListItem>[];
  total: number;
};

export async function getProducts(
  query: ProductsQuery,
): Promise<ProductListResult> {
  const { page, limit, search, category, sort, featured, status, showAll } = query;

  const where: Prisma.ProductWhereInput = {
    ...(showAll ? {} : { status: status ?? "Active" }),
    ...(search && {
      OR: [
        { name:        { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku:         { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(category  && { category: { slug: category } }),
    ...(featured !== undefined && { isFeatured: featured }),
  };

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: ORDER_MAP[sort],
      skip:    (page - 1) * limit,
      take:    limit,
      select:  productListSelect,
    }),
    prisma.product.count({ where }),
  ]);

  return { items: rows.map(serializeListItem), total };
}

// ── getProductBySlug ───────────────────────────────────────────────────────

const productDetailInclude = {
  category: {
    select: {
      id:          true,
      name:        true,
      slug:        true,
      description: true,
      imageUrl:    true,
    },
  },
  images: {
    orderBy: { position: "asc" } as Prisma.ProductImageOrderByWithRelationInput,
  },
  variants: {
    orderBy: [
      { size:  "asc" },
      { color: "asc" },
    ] as Prisma.ProductVariantOrderByWithRelationInput[],
  },
  reviews: {
    where:   { isApproved: true } as Prisma.ReviewWhereInput,
    include: { customer: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" } as Prisma.ReviewOrderByWithRelationInput,
    take:    20,
  },
  _count: {
    select: { reviews: { where: { isApproved: true } as Prisma.ReviewWhereInput } },
  },
} satisfies Prisma.ProductInclude;

type ProductDetailRow = Prisma.ProductGetPayload<{ include: typeof productDetailInclude }>;

function serializeDetail(
  p: ProductDetailRow,
  avgRating: number | null,
) {
  return {
    id:          p.id,
    name:        p.name,
    slug:        p.slug,
    sku:         p.sku,
    description: p.description,
    basePrice:   p.basePrice.toNumber(),
    salePrice:   d(p.salePrice),
    status:      p.status,
    isFeatured:  p.isFeatured,
    // totalStock = available (stock − reserved) — drives soldOut flag on frontend
    totalStock:  p.variants.reduce((sum, v) => sum + Math.max(0, v.stock - v.reservedStock), 0),
    category:    p.category,
    images:      p.images.map((img) => ({
      id:           img.id,
      url:          img.url,
      optimizedUrl: img.optimizedUrl,
      thumbnailUrl: img.thumbnailUrl,
      publicId:     img.publicId,
      altText:      img.altText,
      position:     img.position,
      isDefault:    img.isDefault,
    })),
    variants: p.variants.map((v) => ({
      id:        v.id,
      sku:       v.sku,
      size:      v.size,
      color:     v.color,
      colorHex:  v.colorHex,
      // expose available stock so the product page hides sizes with 0 availability
      stock:     Math.max(0, v.stock - v.reservedStock),
      price:     v.price.toNumber(),
      salePrice: d(v.salePrice),
    })),
    reviews: p.reviews.map((r) => ({
      id:         r.id,
      user:       r.customer,
      rating:     r.rating,
      title:      r.title,
      body:       r.body,
      isVerified: r.isVerified,
      createdAt:  r.createdAt.toISOString(),
    })),
    sizeGuideImage1: p.sizeGuideImage1Url
      ? { url: p.sizeGuideImage1Url, optimizedUrl: p.sizeGuideImage1OptimizedUrl ?? p.sizeGuideImage1Url }
      : null,
    sizeGuideImage2: p.sizeGuideImage2Url
      ? { url: p.sizeGuideImage2Url, optimizedUrl: p.sizeGuideImage2OptimizedUrl ?? p.sizeGuideImage2Url }
      : null,
    tab1Title:   p.tab1Title   ?? null,
    tab1Content: p.tab1Content ?? null,
    averageRating: avgRating != null
      ? Math.round(avgRating * 10) / 10
      : null,
    reviewCount: p._count.reviews,
    createdAt:   p.createdAt.toISOString(),
    updatedAt:   p.updatedAt.toISOString(),
  };
}

export type ProductDetail = ReturnType<typeof serializeDetail>;

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  const product = await prisma.product.findUnique({
    where:   { slug },
    include: productDetailInclude,
  });

  if (!product || product.status !== "Active") return null;

  const ratingAgg = await prisma.review.aggregate({
    where: { productId: product.id, isApproved: true },
    _avg:  { rating: true },
  });

  return serializeDetail(product, ratingAgg._avg.rating);
}

// ── Admin product by slug (bypasses status filter) ─────────────────────────

export async function getAdminProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  const product = await prisma.product.findUnique({
    where:   { slug },
    include: productDetailInclude,
  });
  if (!product) return null;
  const ratingAgg = await prisma.review.aggregate({
    where: { productId: product.id, isApproved: true },
    _avg:  { rating: true },
  });
  return serializeDetail(product, ratingAgg._avg.rating);
}

// ── Slug helpers ───────────────────────────────────────────────────────────

function baseSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function uniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = baseSlug(name);
  let slug = base;
  let n = 1;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${n++}`;
  }
}

// ── createProduct ──────────────────────────────────────────────────────────

export async function createProduct(
  body: CreateProductBody,
): Promise<ReturnType<typeof serializeListItem>> {
  const slug = await uniqueSlug(body.name);

  const product = await prisma.product.create({
    data: {
      name:        body.name,
      slug,
      sku:         body.sku,
      description: body.description,
      tab1Title:   body.tab1Title   ?? null,
      tab1Content: body.tab1Content ?? null,
      basePrice:   body.basePrice,
      salePrice:   body.salePrice,
      categoryId:  body.categoryId,
      status:      body.status as ProductStatus,
      isFeatured:  body.isFeatured,
      variants: {
        create: body.variants.map((v) => ({
          sku:       `${body.sku}-${v.size}-${v.color.replace(/\s+/g, "").toUpperCase().substring(0, 4)}`,
          size:      v.size,
          color:     v.color,
          colorHex:  v.colorHex,
          stock:     v.stock,
          price:     v.price,
          salePrice: v.salePrice,
        })),
      },
      images: {
        create: body.images.map((img, i) => ({
          url:       img.url,
          altText:   img.altText,
          position:  i,
          isDefault: i === 0,
        })),
      },
    },
    select: productListSelect,
  });

  return serializeListItem(product);
}

// ── updateProduct ──────────────────────────────────────────────────────────

export async function updateProduct(
  slug: string,
  body: UpdateProductBody,
): Promise<ReturnType<typeof serializeListItem>> {
  const existing = await prisma.product.findUnique({
    where:  { slug },
    select: { id: true, name: true, sku: true },
  });
  if (!existing) throw new RecordNotFoundError("Product");

  const effectiveSku = body.sku ?? existing.sku;

  const newSlug = body.name && body.name !== existing.name
    ? await uniqueSlug(body.name, existing.id)
    : undefined;

  // Variants: upsert in-place instead of delete+recreate.
  // deleteMany would violate FK constraint when OrderItems reference these variants.
  if (body.variants !== undefined) {
    const existingVariants = await prisma.productVariant.findMany({
      where:  { productId: existing.id },
      select: { id: true, size: true, color: true },
    });

    const incomingKeys = new Set(body.variants.map(v => `${v.size}||${v.color}`));

    await prisma.$transaction([
      // Zero-out variants that were removed from the form (preserve rows for order history)
      ...existingVariants
        .filter(ev => !incomingKeys.has(`${ev.size}||${ev.color}`))
        .map(ev => prisma.productVariant.update({
          where: { id: ev.id },
          data:  { stock: 0 },
        })),

      // Update existing variants or create new ones
      ...body.variants.map(v => {
        const match = existingVariants.find(ev => ev.size === v.size && ev.color === v.color);
        if (match) {
          return prisma.productVariant.update({
            where: { id: match.id },
            data:  { stock: v.stock, price: v.price, salePrice: v.salePrice },
          });
        }
        return prisma.productVariant.create({
          data: {
            productId: existing.id,
            sku:       `${effectiveSku}-${v.size}-${v.color.replace(/\s+/g, "").toUpperCase().substring(0, 4)}`,
            size:      v.size,
            color:     v.color,
            colorHex:  v.colorHex ?? null,
            stock:     v.stock,
            price:     v.price,
            salePrice: v.salePrice ?? null,
          },
        });
      }),
    ]);
  }

  const product = await prisma.product.update({
    where: { id: existing.id },
    data: {
      ...(body.name        !== undefined && { name:        body.name, slug: newSlug ?? slug }),
      ...(body.sku         !== undefined && { sku:         body.sku }),
      ...(body.description  !== undefined && { description:  body.description }),
      ...(body.tab1Title    !== undefined && { tab1Title:    body.tab1Title }),
      ...(body.tab1Content  !== undefined && { tab1Content:  body.tab1Content }),
      ...(body.basePrice    !== undefined && { basePrice:    body.basePrice }),
      ...(body.salePrice   !== undefined && { salePrice:   body.salePrice }),
      ...(body.categoryId  !== undefined && { categoryId:  body.categoryId }),
      ...(body.status      !== undefined && { status:      body.status as ProductStatus }),
      ...(body.isFeatured  !== undefined && { isFeatured:  body.isFeatured }),
      ...(body.images !== undefined && {
        images: {
          deleteMany: {},
          create: body.images.map((img, i) => ({
            url:       img.url,
            altText:   img.altText,
            position:  i,
            isDefault: i === 0,
          })),
        },
      }),
    },
    select: productListSelect,
  });

  return serializeListItem(product);
}

// ── deleteProduct ──────────────────────────────────────────────────────────

export async function deleteProduct(slug: string): Promise<void> {
  const existing = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (!existing) throw new RecordNotFoundError("Product");
  await prisma.product.delete({ where: { id: existing.id } });
}

// ── reorderProducts ──────────────────────────────────────────────────────────
//
// orderedIds is the NEW sequence for whatever subset the admin was viewing
// (the full catalog, or just one category's products when a category filter
// was active). Rather than renumbering that subset to 0..n-1 — which would
// collide with sortOrder values used by products in other categories — we
// reassign the subset's own EXISTING sortOrder values (sorted) to the new
// sequence. This keeps each category's relative position in the global
// order untouched while only reordering within the subset itself.

export async function reorderProducts(orderedIds: string[]): Promise<void> {
  if (orderedIds.length === 0) return;

  const existing = await prisma.product.findMany({
    where:  { id: { in: orderedIds } },
    select: { sortOrder: true },
  });
  const slots = existing.map((p) => p.sortOrder).sort((a, b) => a - b);

  await prisma.$transaction(
    orderedIds.map((id, i) =>
      prisma.product.update({ where: { id }, data: { sortOrder: slots[i] } }),
    ),
    { timeout: 20_000 },
  );
}
