import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import type { InventoryStatus, VariantInventoryDTO, InventoryListResult } from "@/lib/types/inventory";
import type { InventoryQuery } from "@/lib/validations/inventory";

// ── Domain error ───────────────────────────────────────────────────────────

export class InventoryError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly meta?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "InventoryError";
  }
}

// ── Status computation ─────────────────────────────────────────────────────

export function computeInventoryStatus(
  stock:             number,
  reservedStock:     number,
  lowStockThreshold: number,
): InventoryStatus {
  const available = stock - reservedStock;
  if (available <= 0)                return "OutOfStock";
  if (available <= lowStockThreshold) return "LowStock";
  return "InStock";
}

// ── Serialization ──────────────────────────────────────────────────────────

const VARIANT_INVENTORY_SELECT = {
  id:                true,
  sku:               true,
  size:              true,
  color:             true,
  colorHex:          true,
  stock:             true,
  reservedStock:     true,
  lowStockThreshold: true,
  updatedAt:         true,
  product: {
    select: {
      id:   true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.ProductVariantSelect;

type VariantRow = Prisma.ProductVariantGetPayload<{ select: typeof VARIANT_INVENTORY_SELECT }>;

function serialize(row: VariantRow): VariantInventoryDTO {
  const available = row.stock - row.reservedStock;
  return {
    variantId:         row.id,
    sku:               row.sku,
    size:              String(row.size),
    color:             row.color,
    colorHex:          row.colorHex,
    productId:         row.product.id,
    productName:       row.product.name,
    productSlug:       row.product.slug,
    stock:             row.stock,
    reservedStock:     row.reservedStock,
    availableStock:    available,
    lowStockThreshold: row.lowStockThreshold,
    status:            computeInventoryStatus(row.stock, row.reservedStock, row.lowStockThreshold),
    updatedAt:         row.updatedAt.toISOString(),
  };
}

// ── Core stock operations ──────────────────────────────────────────────────

type Tx = Prisma.TransactionClient;

async function loadVariant(variantId: string, tx?: Tx) {
  const client = tx ?? prisma;
  const variant = await client.productVariant.findUnique({
    where:  { id: variantId },
    select: { id: true, stock: true, reservedStock: true, sku: true },
  });
  if (!variant) throw new InventoryError(`Variant ${variantId} not found`, 404);
  return variant;
}

/**
 * Reserve stock when an order is placed.
 * Increments reservedStock; validates enough is available to sell.
 */
export async function reserveStock(
  variantId: string,
  qty:       number,
  tx?:       Tx,
): Promise<void> {
  if (qty <= 0) throw new InventoryError("Quantity must be positive", 400);
  const client  = tx ?? prisma;
  const variant = await loadVariant(variantId, tx);
  const available = variant.stock - variant.reservedStock;

  if (available < qty) {
    throw new InventoryError(
      `Insufficient stock for variant ${variant.sku}. Available: ${available}, requested: ${qty}`,
      400,
      { available, requested: qty, variantId },
    );
  }

  await client.productVariant.update({
    where: { id: variantId },
    data:  { reservedStock: { increment: qty } },
  });
}

/**
 * Release reserved stock when an order is cancelled.
 * Decrements reservedStock; does not touch total stock.
 */
export async function releaseStock(
  variantId: string,
  qty:       number,
  tx?:       Tx,
): Promise<void> {
  if (qty <= 0) throw new InventoryError("Quantity must be positive", 400);
  const client  = tx ?? prisma;
  const variant = await loadVariant(variantId, tx);

  if (variant.reservedStock < qty) {
    throw new InventoryError(
      `Cannot release ${qty} units for ${variant.sku}: only ${variant.reservedStock} reserved`,
      400,
      { reserved: variant.reservedStock, requested: qty, variantId },
    );
  }

  await client.productVariant.update({
    where: { id: variantId },
    data:  { reservedStock: { decrement: qty } },
  });
}

/**
 * Permanently consume stock when an order is shipped.
 * Decrements both stock and reservedStock.
 */
export async function decreaseStock(
  variantId: string,
  qty:       number,
  tx?:       Tx,
): Promise<void> {
  if (qty <= 0) throw new InventoryError("Quantity must be positive", 400);
  const client  = tx ?? prisma;
  const variant = await loadVariant(variantId, tx);

  if (variant.stock < qty) {
    throw new InventoryError(
      `Cannot decrease stock by ${qty} for ${variant.sku}: only ${variant.stock} in stock`,
      400,
      { stock: variant.stock, requested: qty, variantId },
    );
  }
  if (variant.reservedStock < qty) {
    throw new InventoryError(
      `Cannot decrease reserved by ${qty} for ${variant.sku}: only ${variant.reservedStock} reserved`,
      400,
      { reserved: variant.reservedStock, requested: qty, variantId },
    );
  }

  await client.productVariant.update({
    where: { id: variantId },
    data:  {
      stock:         { decrement: qty },
      reservedStock: { decrement: qty },
    },
  });
}

/**
 * Add physical stock (manual restock / admin adjustment).
 * Only increases total stock; does not touch reservedStock.
 */
export async function increaseStock(variantId: string, qty: number): Promise<VariantInventoryDTO> {
  if (qty <= 0) throw new InventoryError("Quantity must be positive", 400);
  await loadVariant(variantId);

  const updated = await prisma.productVariant.update({
    where:  { id: variantId },
    data:   { stock: { increment: qty } },
    select: VARIANT_INVENTORY_SELECT,
  });
  return serialize(updated);
}

/**
 * Directly set total stock (admin override). Preserves reservedStock.
 */
export async function setStock(variantId: string, qty: number): Promise<VariantInventoryDTO> {
  if (qty < 0) throw new InventoryError("Stock cannot be negative", 400);
  const variant = await loadVariant(variantId);

  if (qty < variant.reservedStock) {
    throw new InventoryError(
      `Cannot set stock to ${qty}: ${variant.reservedStock} units are already reserved`,
      400,
      { reserved: variant.reservedStock, requestedStock: qty, variantId },
    );
  }

  const updated = await prisma.productVariant.update({
    where:  { id: variantId },
    data:   { stock: qty },
    select: VARIANT_INVENTORY_SELECT,
  });
  return serialize(updated);
}

/**
 * Update the low-stock alert threshold.
 */
export async function setLowStockThreshold(variantId: string, threshold: number): Promise<VariantInventoryDTO> {
  if (threshold < 0) throw new InventoryError("Threshold cannot be negative", 400);
  await loadVariant(variantId);

  const updated = await prisma.productVariant.update({
    where:  { id: variantId },
    data:   { lowStockThreshold: threshold },
    select: VARIANT_INVENTORY_SELECT,
  });
  return serialize(updated);
}

// ── Queries ────────────────────────────────────────────────────────────────

export async function getVariantInventory(variantId: string): Promise<VariantInventoryDTO | null> {
  const row = await prisma.productVariant.findUnique({
    where:  { id: variantId },
    select: VARIANT_INVENTORY_SELECT,
  });
  return row ? serialize(row) : null;
}

export async function listInventory(query: InventoryQuery): Promise<InventoryListResult> {
  // Build Prisma where clause
  const productWhere: Prisma.ProductWhereInput = {
    ...(query.productId && { id: query.productId }),
    ...(query.search && {
      OR: [
        { name: { contains: query.search, mode: "insensitive" } },
        { variants: { some: { sku:   { contains: query.search, mode: "insensitive" } } } },
        { variants: { some: { color: { contains: query.search, mode: "insensitive" } } } },
      ],
    }),
  };

  const where: Prisma.ProductVariantWhereInput = {
    ...(query.productId && { productId: query.productId }),
    ...(query.search && {
      OR: [
        { sku:   { contains: query.search, mode: "insensitive" } },
        { color: { contains: query.search, mode: "insensitive" } },
        { product: { name: { contains: query.search, mode: "insensitive" } } },
      ],
    }),
  };

  // Fetch all matching rows (status filtering is computed, so we fetch then filter)
  // For large datasets a raw query or stored column would be better, but this is
  // sufficient for admin use where result sets are manageable.
  const allRows = await prisma.productVariant.findMany({
    where,
    select:  VARIANT_INVENTORY_SELECT,
    orderBy: [{ product: { name: "asc" } }, { size: "asc" }, { color: "asc" }],
  });

  const serialized = allRows.map(serialize);

  // Apply status filter in JS (computed field)
  const filtered = query.status
    ? serialized.filter((r) => r.status === query.status)
    : serialized;

  const total = filtered.length;
  const skip  = (query.page - 1) * query.limit;
  const items = filtered.slice(skip, skip + query.limit);

  return { items, total };
}
