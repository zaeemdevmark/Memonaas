import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import type { CartDTO, CartItemDTO, EmptyCartDTO } from "@/lib/types/cart";

// ── Domain error ───────────────────────────────────────────────────────────

export class CartError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly meta?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "CartError";
  }
}

// ── Prisma include ─────────────────────────────────────────────────────────

const CART_INCLUDE = {
  items: {
    orderBy: { createdAt: "asc" } as Prisma.CartItemOrderByWithRelationInput,
    include: {
      variant: {
        include: {
          product: {
            select: {
              id:     true,
              name:   true,
              slug:   true,
              status: true,
              images: {
                where:  { isDefault: true } as Prisma.ProductImageWhereInput,
                take:   1,
                select: { url: true, altText: true },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CartInclude;

type CartRow     = Prisma.CartGetPayload<{ include: typeof CART_INCLUDE }>;
type CartItemRow = CartRow["items"][number];

// ── Serialization ──────────────────────────────────────────────────────────

function d(val: Prisma.Decimal | null | undefined): number | null {
  return val == null ? null : val.toNumber();
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function serializeItem(item: CartItemRow): CartItemDTO {
  const v = item.variant;
  const price         = v.price.toNumber();
  const salePrice     = d(v.salePrice);
  const effectivePrice = salePrice ?? price;

  return {
    id:       item.id,
    quantity: item.quantity,
    variant: {
      id:        v.id,
      sku:       v.sku,
      size:      v.size,
      color:     v.color,
      colorHex:  v.colorHex,
      stock:     v.stock,
      price,
      salePrice,
    },
    product: {
      id:    v.product.id,
      name:  v.product.name,
      slug:  v.product.slug,
      image: v.product.images[0] ?? null,
    },
    effectivePrice,
    lineTotal: round2(effectivePrice * item.quantity),
  };
}

function serializeCart(cart: CartRow): CartDTO {
  const items = cart.items.map(serializeItem);
  return {
    id:         cart.id,
    items,
    totalItems: items.reduce((s, i) => s + i.quantity, 0),
    subtotal:   round2(items.reduce((s, i) => s + i.lineTotal, 0)),
  };
}

export const EMPTY_CART: EmptyCartDTO = {
  id:         null,
  items:      [],
  totalItems: 0,
  subtotal:   0,
};

// ── getCart ────────────────────────────────────────────────────────────────

export async function getCart(cartId: string): Promise<CartDTO | null> {
  const cart = await prisma.cart.findUnique({
    where:   { id: cartId },
    include: CART_INCLUDE,
  });
  return cart ? serializeCart(cart) : null;
}

// ── addToCart ──────────────────────────────────────────────────────────────

export interface AddToCartResult {
  cart:        CartDTO;
  cartId:      string;
  cartCreated: boolean;
}

export async function addToCart(
  cartId:    string | undefined,
  variantId: string,
  quantity:  number,
): Promise<AddToCartResult> {
  // 1. Validate variant and product
  const variant = await prisma.productVariant.findUnique({
    where:   { id: variantId },
    include: { product: { select: { id: true, status: true } } },
  });

  if (!variant) {
    throw new CartError("Product variant not found", 404);
  }
  if (variant.product.status !== "Active") {
    throw new CartError("This product is no longer available", 400);
  }

  // 2. Resolve or create the cart
  let cartCreated = false;
  let resolvedCartId: string;

  if (cartId) {
    const existing = await prisma.cart.findUnique({
      where:  { id: cartId },
      select: { id: true },
    });
    if (existing) {
      resolvedCartId = existing.id;
    } else {
      // Stale cookie — create fresh cart
      const fresh  = await prisma.cart.create({ data: {}, select: { id: true } });
      resolvedCartId = fresh.id;
      cartCreated    = true;
    }
  } else {
    const newCart  = await prisma.cart.create({ data: {}, select: { id: true } });
    resolvedCartId = newCart.id;
    cartCreated    = true;
  }

  // 3. Check existing quantity for this variant in the cart
  const existingItem = await prisma.cartItem.findUnique({
    where:  { cartId_variantId: { cartId: resolvedCartId, variantId } },
    select: { id: true, quantity: true },
  });

  const existingQty = existingItem?.quantity ?? 0;
  const newQty      = existingQty + quantity;

  if (newQty > variant.stock) {
    const canAdd = Math.max(0, variant.stock - existingQty);
    throw new CartError(
      canAdd === 0
        ? "No more stock available for this variant"
        : `Only ${canAdd} more unit(s) can be added (${variant.stock} in stock)`,
      400,
      { available: canAdd, stock: variant.stock },
    );
  }

  // 4. Upsert the cart item
  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data:  { quantity: newQty },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: resolvedCartId, variantId, quantity },
    });
  }

  // 5. Return fresh cart state
  const updated = await prisma.cart.findUniqueOrThrow({
    where:   { id: resolvedCartId },
    include: CART_INCLUDE,
  });

  return { cart: serializeCart(updated), cartId: resolvedCartId, cartCreated };
}

// ── updateCartItem ─────────────────────────────────────────────────────────

export async function updateCartItem(
  cartId:   string,
  itemId:   string,
  quantity: number,
): Promise<CartDTO> {
  const item = await prisma.cartItem.findFirst({
    where:   { id: itemId, cartId },
    include: { variant: { select: { stock: true } } },
  });

  if (!item) throw new CartError("Cart item not found", 404);

  if (quantity > item.variant.stock) {
    throw new CartError(
      `Only ${item.variant.stock} unit(s) in stock`,
      400,
      { available: item.variant.stock },
    );
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data:  { quantity },
  });

  const cart = await prisma.cart.findUniqueOrThrow({
    where:   { id: cartId },
    include: CART_INCLUDE,
  });

  return serializeCart(cart);
}

// ── removeCartItem ─────────────────────────────────────────────────────────

export async function removeCartItem(
  cartId: string,
  itemId: string,
): Promise<CartDTO> {
  const item = await prisma.cartItem.findFirst({
    where:  { id: itemId, cartId },
    select: { id: true },
  });

  if (!item) throw new CartError("Cart item not found", 404);

  await prisma.cartItem.delete({ where: { id: itemId } });

  const cart = await prisma.cart.findUniqueOrThrow({
    where:   { id: cartId },
    include: CART_INCLUDE,
  });

  return serializeCart(cart);
}
