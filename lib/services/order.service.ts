import { Prisma, OrderStatus } from "@prisma/client";
import prisma           from "@/lib/prisma";
import { withTransaction } from "@/lib/db";
import { getCart }      from "@/lib/services/cart.service";
import { reserveStock, releaseStock, decreaseStock } from "@/lib/services/inventory.service";
import { validateCoupon, applyCoupon, incrementCouponUsage } from "@/lib/services/coupon.service";
import {
  sendOrderConfirmation, sendNewOrderAdmin,
  sendOrderShipped, sendOrderDelivered, sendOrderCancelled,
  sendLowStockAlert,
} from "@/lib/services/email.service";
import type { OrderDTO, OrderSummaryDTO, AdminOrderSummaryDTO, CustomerOrderDTO, CustomerOrderItemDTO } from "@/lib/types/order";
import type { LowStockItem } from "@/lib/email/templates/LowStockAlert";
import type { CreateOrderBody, OrdersQuery } from "@/lib/validations/order";

// ── Domain error ───────────────────────────────────────────────────────────

export class OrderError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly meta?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "OrderError";
  }
}

// ── Shipping cost ──────────────────────────────────────────────────────────

const FREE_SHIPPING_THRESHOLD = 5_000;  // Rs.
const FLAT_SHIPPING_COST      = 200;    // Rs.

function calcShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST;
}

// ── Order number ───────────────────────────────────────────────────────────

function generateOrderNumber(): string {
  const now  = new Date();
  const y    = now.getFullYear();
  const m    = String(now.getMonth() + 1).padStart(2, "0");
  const d    = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MN-${y}${m}${d}-${rand}`;
}

// ── Serialization ──────────────────────────────────────────────────────────

function d(val: Prisma.Decimal | null | undefined): number | null {
  return val == null ? null : val.toNumber();
}

const ORDER_INCLUDE = {
  items:   true,
  payment: true,
  statusHistory: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.OrderInclude;

type OrderRow = Prisma.OrderGetPayload<{ include: typeof ORDER_INCLUDE }>;

function serializeOrder(o: OrderRow): OrderDTO {
  return {
    id:             o.id,
    orderNumber:    o.orderNumber,
    status:         o.status,
    items: o.items.map((i) => {
      const unitPrice      = i.unitPrice.toNumber();
      const salePrice      = d(i.salePrice);
      const effectivePrice = salePrice ?? unitPrice;
      return {
        id:             i.id,
        productId:      i.productId,
        variantId:      i.variantId,
        productName:    i.productName,
        size:           i.size,
        color:          i.color,
        unitPrice,
        salePrice,
        effectivePrice,
        quantity:       i.quantity,
        lineTotal:      i.lineTotal.toNumber(),
      };
    }),
    payment: o.payment
      ? {
          id:            o.payment.id,
          method:        o.payment.method,
          status:        o.payment.status,
          amount:        o.payment.amount.toNumber(),
          transactionId: o.payment.transactionId,
          failureReason: o.payment.failureReason,
          paidAt:        o.payment.paidAt?.toISOString() ?? null,
        }
      : null,
    statusHistory: o.statusHistory.map((h) => ({
      id:        h.id,
      status:    h.status,
      note:      h.note,
      createdAt: h.createdAt.toISOString(),
    })),
    subtotal:       o.subtotal.toNumber(),
    discountAmount: o.discountAmount.toNumber(),
    shippingCost:   o.shippingCost.toNumber(),
    taxAmount:      o.taxAmount.toNumber(),
    total:          o.total.toNumber(),
    shipping: {
      name:       o.shipName,
      email:      o.shipEmail,
      phone:      o.shipPhone,
      street:     o.shipStreet,
      city:       o.shipCity,
      province:   o.shipProvince,
      postalCode: o.shipPostalCode,
      country:    o.shipCountry,
    },
    notes:     o.notes,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

// ── getOrderById ───────────────────────────────────────────────────────────

export async function getOrderById(id: string): Promise<OrderDTO | null> {
  const order = await prisma.order.findUnique({
    where:   { id },
    include: ORDER_INCLUDE,
  });
  return order ? serializeOrder(order) : null;
}

// ── getOrdersByIds ─────────────────────────────────────────────────────────

const SUMMARY_SELECT = {
  id:          true,
  orderNumber: true,
  status:      true,
  total:       true,
  createdAt:   true,
  items: { select: { quantity: true } },
} satisfies Prisma.OrderSelect;

type SummaryRow = Prisma.OrderGetPayload<{ select: typeof SUMMARY_SELECT }>;

function serializeSummary(o: SummaryRow): OrderSummaryDTO {
  return {
    id:          o.id,
    orderNumber: o.orderNumber,
    status:      o.status,
    total:       o.total.toNumber(),
    totalItems:  o.items.reduce((s, i) => s + i.quantity, 0),
    createdAt:   o.createdAt.toISOString(),
  };
}

export interface GetOrdersResult {
  orders: OrderSummaryDTO[];
  total:  number;
}

export async function getOrdersByIds(
  ids:   string[],
  query: OrdersQuery,
): Promise<GetOrdersResult> {
  if (ids.length === 0) return { orders: [], total: 0 };

  const where: Prisma.OrderWhereInput = {
    id:     { in: ids },
    ...(query.status && { status: query.status }),
  };

  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:    (query.page - 1) * query.limit,
      take:    query.limit,
      select:  SUMMARY_SELECT,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders: rows.map(serializeSummary), total };
}

// ── getAllOrders (admin) ────────────────────────────────────────────────────

const ADMIN_SUMMARY_SELECT = {
  id:          true,
  orderNumber: true,
  status:      true,
  total:       true,
  shipName:    true,
  createdAt:   true,
  items:    { select: { quantity: true } },
  payment:  { select: { method: true, status: true } },
  customer: { select: { email: true, phone: true } },
} satisfies Prisma.OrderSelect;

type AdminSummaryRow = Prisma.OrderGetPayload<{ select: typeof ADMIN_SUMMARY_SELECT }>;

function serializeAdminSummary(o: AdminSummaryRow): AdminOrderSummaryDTO {
  return {
    id:            o.id,
    orderNumber:   o.orderNumber,
    status:        o.status,
    payment:       o.payment ? { method: o.payment.method, status: o.payment.status } : null,
    total:         o.total.toNumber(),
    totalItems:    o.items.reduce((s, i) => s + i.quantity, 0),
    shipName:      o.shipName,
    customerEmail: o.customer?.email ?? null,
    customerPhone: o.customer?.phone ?? null,
    createdAt:     o.createdAt.toISOString(),
  };
}

export interface GetAllOrdersResult {
  orders: AdminOrderSummaryDTO[];
  total:  number;
}

export async function getAllOrders(query: OrdersQuery): Promise<GetAllOrdersResult> {
  const where: Prisma.OrderWhereInput = {
    ...(query.status && { status: query.status }),
    ...(query.search && {
      OR: [
        { orderNumber: { contains: query.search, mode: "insensitive" } },
        { shipName:    { contains: query.search, mode: "insensitive" } },
        { customer:    { email: { contains: query.search, mode: "insensitive" } } },
      ],
    }),
  };

  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:    (query.page - 1) * query.limit,
      take:    query.limit,
      select:  ADMIN_SUMMARY_SELECT,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders: rows.map(serializeAdminSummary), total };
}

// ── createOrder ────────────────────────────────────────────────────────────

export async function createOrder(
  cartId:      string,
  body:        CreateOrderBody,
  couponCode?: string,
  customerId?: string,
): Promise<OrderDTO> {
  // 1. Load cart (outside transaction — fast read, no locking needed here)
  const cart = await getCart(cartId);

  if (!cart || cart.items.length === 0) {
    throw new OrderError("Your cart is empty", 400);
  }

  // 2. Validate and apply coupon (if provided)
  const subtotal = cart.subtotal;
  let discountAmount = 0;
  let couponId: string | null = null;

  if (couponCode) {
    const couponRow = await validateCoupon(couponCode, subtotal);
    const applied   = applyCoupon(couponRow, subtotal);
    discountAmount  = applied.discountAmount;
    couponId        = couponRow.id;
  }

  // 3. Calculate totals
  const discountedSubtotal = subtotal - discountAmount;
  const shippingCost       = calcShipping(discountedSubtotal);
  const taxAmount          = 0;
  const total              = discountedSubtotal + shippingCost + taxAmount;

  const orderNumber = generateOrderNumber();

  // 4. Transactional: validate stock → create order → reserve stock → increment coupon → clear cart
  const orderId = await withTransaction(async (tx) => {
    // Validate live stock for every item
    for (const item of cart.items) {
      const variant = await tx.productVariant.findUnique({
        where:   { id: item.variant.id },
        select:  { stock: true, reservedStock: true, product: { select: { name: true, status: true } } },
      });

      if (!variant) {
        throw new OrderError(
          `Variant for "${item.product.name}" is no longer available`,
          400,
        );
      }
      if (variant.product.status !== "Active") {
        throw new OrderError(
          `"${variant.product.name}" is no longer available`,
          400,
        );
      }
      const available = variant.stock - variant.reservedStock;
      if (available < item.quantity) {
        throw new OrderError(
          `Insufficient stock for "${item.product.name}" ` +
          `(${item.variant.size} / ${item.variant.color}). ` +
          `Only ${available} unit${available === 1 ? "" : "s"} available.`,
          400,
          { available },
        );
      }
    }

    // Create order
    const order = await tx.order.create({
      data: {
        orderNumber,
        subtotal,
        discountAmount,
        shippingCost,
        taxAmount,
        total,
        ...(couponId    && { couponId }),
        ...(customerId  && { customerId }),
        shipName:       body.name,
        shipEmail:      body.email,
        shipPhone:      body.phone,
        shipStreet:     body.street,
        shipCity:       body.city,
        shipProvince:   body.province,
        shipPostalCode: body.postalCode,
        shipCountry:    body.country,
        notes:          body.notes,
      },
      select: { id: true },
    });

    // Create order items (snapshots of product/variant data at purchase time)
    await tx.orderItem.createMany({
      data: cart.items.map((item) => ({
        orderId:     order.id,
        productId:   item.product.id,
        variantId:   item.variant.id,
        productName: item.product.name,
        size:        String(item.variant.size),
        color:       item.variant.color,
        unitPrice:   item.variant.price,
        salePrice:   item.variant.salePrice,
        quantity:    item.quantity,
        lineTotal:   item.lineTotal,
      })),
    });

    // Create payment record
    await tx.payment.create({
      data: {
        orderId: order.id,
        method:  body.paymentMethod,
        status:  "Pending",
        amount:  total,
      },
    });

    // Record initial status history
    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status:  "Pending",
        note:    "Order placed",
      },
    });

    // Reserve stock for each variant (increments reservedStock, validates availability)
    for (const item of cart.items) {
      await reserveStock(item.variant.id, item.quantity, tx);
    }

    // Increment coupon usage atomically within the transaction
    if (couponId) {
      await incrementCouponUsage(couponId, tx);
    }

    // Clear cart items so the cart is empty after checkout
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return order.id;
  });

  // 4. Return full order (Prisma re-fetch after commit)
  const created = await getOrderById(orderId);
  if (!created) throw new OrderError("Order was created but could not be retrieved", 500);

  // Fire emails in the background — never let failures affect the checkout response
  void Promise.all([
    sendOrderConfirmation(created),
    sendNewOrderAdmin(created),
  ]);

  return created;
}

// ── createCodOrder ─────────────────────────────────────────────────────────

export async function createCodOrder(
  cartId: string,
  body:   Omit<CreateOrderBody, "paymentMethod">,
): Promise<OrderDTO> {
  return createOrder(cartId, { ...body, paymentMethod: "COD" });
}

// ── updateOrderStatus ──────────────────────────────────────────────────────

// Allowed forward transitions — prevents nonsensical status regressions.
const TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  Pending:    ["Processing", "Cancelled"],
  Processing: ["Shipped",    "Cancelled"],
  Shipped:    ["Delivered"],
  Delivered:  [],
  Cancelled:  [],
};

export async function updateOrderStatus(
  id:     string,
  status: OrderStatus,
  note?:  string,
): Promise<OrderDTO> {
  const existing = await prisma.order.findUnique({
    where:  { id },
    select: {
      id:     true,
      status: true,
      items:  { select: { variantId: true, quantity: true } },
    },
  });

  if (!existing) throw new OrderError("Order not found", 404);

  const allowed = TRANSITIONS[existing.status] ?? [];
  if (!allowed.includes(status)) {
    throw new OrderError(
      allowed.length === 0
        ? `Order is ${existing.status} and cannot be updated`
        : `Cannot change status from ${existing.status} to ${status}. Allowed: ${allowed.join(", ")}`,
      422,
    );
  }

  await withTransaction(async (tx) => {
    await tx.order.update({ where: { id }, data: { status } });

    await tx.orderStatusHistory.create({
      data: { orderId: id, status, ...(note && { note }) },
    });

    if (status === "Cancelled") {
      // Release reserved stock back to available
      for (const item of existing.items) {
        await releaseStock(item.variantId, item.quantity, tx);
      }
    } else if (status === "Shipped") {
      // Permanently consume stock — items have left the warehouse
      for (const item of existing.items) {
        await decreaseStock(item.variantId, item.quantity, tx);
      }
    }
  });

  const updated = await getOrderById(id);
  if (!updated) throw new OrderError("Order could not be retrieved after update", 500);

  // Fire status-change email and optional low-stock alert in the background
  void (async () => {
    if (status === "Shipped") {
      await sendOrderShipped(updated);
      // Check for variants that have dropped to low-stock or zero after this shipment
      const variantIds = existing.items.map((i) => i.variantId);
      const variants = await prisma.productVariant.findMany({
        where:  { id: { in: variantIds } },
        select: {
          sku: true, size: true, color: true,
          stock: true, reservedStock: true, lowStockThreshold: true,
          product: { select: { name: true } },
        },
      });
      const lowItems: LowStockItem[] = variants
        .filter((v) => (v.stock - v.reservedStock) <= v.lowStockThreshold)
        .map((v) => ({
          productName: v.product.name,
          sku:         v.sku,
          size:        String(v.size),
          color:       v.color,
          stock:       v.stock - v.reservedStock,
        }));
      if (lowItems.length > 0) {
        await sendLowStockAlert(lowItems, id, updated.orderNumber);
      }
    } else if (status === "Delivered") {
      await sendOrderDelivered(updated);
    } else if (status === "Cancelled") {
      await sendOrderCancelled(updated);
    }
  })();

  return updated;
}

// ── getUserDashboardStats ──────────────────────────────────────────────────

export interface DashboardStatsResult {
  totalOrders:     number;
  pendingOrders:   number;
  deliveredOrders: number;
  totalSpent:      number;
}

const PENDING_STATUSES: OrderStatus[] = ["Pending", "Processing", "Shipped"];

export async function getUserDashboardStats(customerId: string): Promise<DashboardStatsResult> {
  const [total, pending, deliveredAgg] = await Promise.all([
    prisma.order.count({ where: { customerId } }),
    prisma.order.count({ where: { customerId, status: { in: PENDING_STATUSES } } }),
    prisma.order.aggregate({
      where:  { customerId, status: "Delivered" },
      _count: { _all: true },
      _sum:   { total: true },
    }),
  ]);

  return {
    totalOrders:     total,
    pendingOrders:   pending,
    deliveredOrders: deliveredAgg._count._all,
    totalSpent:      deliveredAgg._sum.total?.toNumber() ?? 0,
  };
}

// ── getUserOrders ──────────────────────────────────────────────────────────

export async function getUserOrders(
  customerId: string,
  query:      OrdersQuery,
): Promise<GetOrdersResult> {
  const where: Prisma.OrderWhereInput = {
    customerId,
    ...(query.status && { status: query.status }),
  };

  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip:    (query.page - 1) * query.limit,
      take:    query.limit,
      select:  SUMMARY_SELECT,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders: rows.map(serializeSummary), total };
}

// ── getUserRecentOrders ────────────────────────────────────────────────────

export async function getUserRecentOrders(
  customerId: string,
  limit = 3,
): Promise<OrderSummaryDTO[]> {
  const rows = await prisma.order.findMany({
    where:   { customerId },
    orderBy: { createdAt: "desc" },
    take:    limit,
    select:  SUMMARY_SELECT,
  });
  return rows.map(serializeSummary);
}

// ── getUserOrderById (with ownership check + product images) ───────────────

const CUSTOMER_ORDER_INCLUDE = {
  items: {
    include: {
      product: {
        select: {
          images: {
            where:  { isDefault: true },
            select: { thumbnailUrl: true, url: true },
            take:   1,
          },
        },
      },
    },
  },
  payment: true,
  statusHistory: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.OrderInclude;

type CustomerOrderRow = Prisma.OrderGetPayload<{ include: typeof CUSTOMER_ORDER_INCLUDE }>;

function serializeCustomerOrder(o: CustomerOrderRow): CustomerOrderDTO {
  const items: CustomerOrderItemDTO[] = o.items.map((i) => {
    const unitPrice      = i.unitPrice.toNumber();
    const salePrice      = d(i.salePrice);
    const effectivePrice = salePrice ?? unitPrice;
    return {
      id:           i.id,
      productId:    i.productId,
      variantId:    i.variantId,
      productName:  i.productName,
      size:         i.size,
      color:        i.color,
      unitPrice,
      salePrice,
      effectivePrice,
      quantity:     i.quantity,
      lineTotal:    i.lineTotal.toNumber(),
      productImage: i.product?.images?.[0]?.thumbnailUrl ?? i.product?.images?.[0]?.url ?? null,
    };
  });

  return {
    id:             o.id,
    orderNumber:    o.orderNumber,
    status:         o.status,
    items,
    payment: o.payment
      ? {
          id:            o.payment.id,
          method:        o.payment.method,
          status:        o.payment.status,
          amount:        o.payment.amount.toNumber(),
          transactionId: o.payment.transactionId,
          failureReason: o.payment.failureReason,
          paidAt:        o.payment.paidAt?.toISOString() ?? null,
        }
      : null,
    statusHistory: o.statusHistory.map((h) => ({
      id:        h.id,
      status:    h.status,
      note:      h.note,
      createdAt: h.createdAt.toISOString(),
    })),
    subtotal:       o.subtotal.toNumber(),
    discountAmount: o.discountAmount.toNumber(),
    shippingCost:   o.shippingCost.toNumber(),
    taxAmount:      o.taxAmount.toNumber(),
    total:          o.total.toNumber(),
    shipping: {
      name:       o.shipName,
      email:      o.shipEmail,
      phone:      o.shipPhone,
      street:     o.shipStreet,
      city:       o.shipCity,
      province:   o.shipProvince,
      postalCode: o.shipPostalCode,
      country:    o.shipCountry,
    },
    notes:     o.notes,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

export async function getUserOrderById(
  customerId: string,
  orderId:    string,
): Promise<CustomerOrderDTO | null> {
  const order = await prisma.order.findUnique({
    where:   { id: orderId },
    include: CUSTOMER_ORDER_INCLUDE,
  });
  if (!order || order.customerId !== customerId) return null;
  return serializeCustomerOrder(order);
}

// ── markPaymentPaid ────────────────────────────────────────────────────────

export async function markPaymentPaid(orderId: string): Promise<OrderDTO> {
  const order = await prisma.order.findUnique({
    where:  { id: orderId },
    select: { id: true, payment: { select: { id: true, method: true, status: true } } },
  });

  if (!order)          throw new OrderError("Order not found", 404);
  if (!order.payment)  throw new OrderError("No payment record found for this order", 404);
  if (order.payment.status === "Completed") {
    throw new OrderError("Payment is already marked as paid", 409);
  }

  await prisma.payment.update({
    where: { id: order.payment.id },
    data:  { status: "Completed", paidAt: new Date(), failureReason: null },
  });

  const updated = await getOrderById(orderId);
  if (!updated) throw new OrderError("Order could not be retrieved after update", 500);
  return updated;
}

// ── markPaymentFailed ──────────────────────────────────────────────────────

export async function markPaymentFailed(
  orderId: string,
  reason?: string,
): Promise<OrderDTO> {
  const order = await prisma.order.findUnique({
    where:  { id: orderId },
    select: { id: true, payment: { select: { id: true, method: true, status: true } } },
  });

  if (!order)          throw new OrderError("Order not found", 404);
  if (!order.payment)  throw new OrderError("No payment record found for this order", 404);
  if (order.payment.status === "Failed") {
    throw new OrderError("Payment is already marked as failed", 409);
  }

  await prisma.payment.update({
    where: { id: order.payment.id },
    data:  { status: "Failed", failureReason: reason ?? null },
  });

  const updated = await getOrderById(orderId);
  if (!updated) throw new OrderError("Order could not be retrieved after update", 500);
  return updated;
}
