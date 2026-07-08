import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import type { WishlistDTO, WishlistItemDTO } from "@/lib/types/wishlist";
import { RecordNotFoundError } from "@/lib/db/errors";

// ── Domain error ───────────────────────────────────────────────────────────

export class WishlistError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = "WishlistError";
  }
}

// ── Serialization ──────────────────────────────────────────────────────────

const WISHLIST_ITEM_INCLUDE = {
  product: {
    select: {
      id:        true,
      slug:      true,
      name:      true,
      basePrice: true,
      salePrice: true,
      images: {
        where:  { isDefault: true } as Prisma.ProductImageWhereInput,
        take:   1,
        select: { url: true, optimizedUrl: true, altText: true },
      },
      variants: { select: { stock: true, reservedStock: true } },
    },
  },
} satisfies Prisma.WishlistItemInclude;

type WishlistItemRow = Prisma.WishlistItemGetPayload<{ include: typeof WISHLIST_ITEM_INCLUDE }>;

function d(val: Prisma.Decimal | null | undefined): number | null {
  return val == null ? null : val.toNumber();
}

function serializeItem(row: WishlistItemRow): WishlistItemDTO {
  const p = row.product;
  const totalStock = p.variants.reduce((sum, v) => sum + Math.max(0, v.stock - v.reservedStock), 0);

  return {
    id:        row.id,
    productId: p.id,
    product: {
      id:        p.id,
      slug:      p.slug,
      name:      p.name,
      basePrice: p.basePrice.toNumber(),
      salePrice: d(p.salePrice),
      image:     p.images[0] ?? null,
      soldOut:   totalStock === 0,
    },
    createdAt: row.createdAt.toISOString(),
  };
}

// ── getOrCreateWishlist ──────────────────────────────────────────────────────

async function getOrCreateWishlist(customerId: string): Promise<{ id: string }> {
  const existing = await prisma.wishlist.findUnique({
    where:  { customerId },
    select: { id: true },
  });
  if (existing) return existing;
  return prisma.wishlist.create({ data: { customerId }, select: { id: true } });
}

// ── getWishlist ──────────────────────────────────────────────────────────────

export async function getWishlist(customerId: string): Promise<WishlistDTO> {
  const wishlist = await prisma.wishlist.findUnique({
    where:  { customerId },
    select: {
      items: {
        include: WISHLIST_ITEM_INCLUDE,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!wishlist) return { items: [], totalItems: 0 };

  const items = wishlist.items.map(serializeItem);
  return { items, totalItems: items.length };
}

// ── getWishlistProductIds ──────────────────────────────────────────────────

export async function getWishlistProductIds(customerId: string): Promise<string[]> {
  const wishlist = await prisma.wishlist.findUnique({
    where:  { customerId },
    select: { items: { select: { productId: true } } },
  });
  return wishlist?.items.map((i) => i.productId) ?? [];
}

// ── addToWishlist ──────────────────────────────────────────────────────────

export async function addToWishlist(customerId: string, productId: string): Promise<WishlistDTO> {
  const product = await prisma.product.findUnique({
    where:  { id: productId },
    select: { id: true },
  });
  if (!product) throw new RecordNotFoundError("Product");

  const wishlist = await getOrCreateWishlist(customerId);

  const existing = await prisma.wishlistItem.findUnique({
    where:  { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    select: { id: true },
  });

  if (!existing) {
    await prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, productId } });
  }

  return getWishlist(customerId);
}

// ── removeFromWishlist ──────────────────────────────────────────────────────

export async function removeFromWishlist(customerId: string, productId: string): Promise<WishlistDTO> {
  const wishlist = await prisma.wishlist.findUnique({
    where:  { customerId },
    select: { id: true },
  });

  if (wishlist) {
    await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id, productId } });
  }

  return getWishlist(customerId);
}
