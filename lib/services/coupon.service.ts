import { Prisma, DiscountType } from "@prisma/client";
import prisma from "@/lib/prisma";
import type { CouponDTO, ApplyCouponResult, CouponListResult } from "@/lib/types/coupon";
import type { CreateCouponBody, UpdateCouponBody, CouponsQuery } from "@/lib/validations/coupon";

// ── Domain error ───────────────────────────────────────────────────────────

export class CouponError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "CouponError";
  }
}

// ── Serialization ──────────────────────────────────────────────────────────

const COUPON_SELECT = {
  id:            true,
  code:          true,
  description:   true,
  discountType:  true,
  discountValue: true,
  minOrderValue: true,
  maxDiscount:   true,
  usageLimit:    true,
  usedCount:     true,
  isActive:      true,
  startDate:     true,
  expiresAt:     true,
  createdAt:     true,
  updatedAt:     true,
} satisfies Prisma.CouponSelect;

type CouponRow = Prisma.CouponGetPayload<{ select: typeof COUPON_SELECT }>;

function d(v: Prisma.Decimal | null | undefined): number | null {
  return v == null ? null : v.toNumber();
}

function serialize(row: CouponRow): CouponDTO {
  return {
    id:            row.id,
    code:          row.code,
    description:   row.description,
    discountType:  row.discountType as "Percentage" | "Fixed",
    discountValue: row.discountValue.toNumber(),
    minOrderValue: d(row.minOrderValue),
    maxDiscount:   d(row.maxDiscount),
    usageLimit:    row.usageLimit,
    usedCount:     row.usedCount,
    isActive:      row.isActive,
    startDate:     row.startDate ? row.startDate.toISOString() : null,
    endDate:       row.expiresAt ? row.expiresAt.toISOString() : null,
    createdAt:     row.createdAt.toISOString(),
    updatedAt:     row.updatedAt.toISOString(),
  };
}

// ── validateCoupon ─────────────────────────────────────────────────────────

export async function validateCoupon(
  code:     string,
  subtotal: number,
): Promise<CouponRow> {
  const coupon = await prisma.coupon.findUnique({
    where:  { code: code.toUpperCase() },
    select: COUPON_SELECT,
  });

  if (!coupon) throw new CouponError("Coupon not found", 404, "NOT_FOUND");

  if (!coupon.isActive) throw new CouponError("This coupon is no longer active", 400, "INACTIVE");

  const now = new Date();
  if (coupon.startDate && coupon.startDate > now) {
    throw new CouponError("This coupon is not yet valid", 400, "NOT_STARTED");
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    throw new CouponError("This coupon has expired", 400, "EXPIRED");
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new CouponError("This coupon has reached its usage limit", 400, "USAGE_LIMIT");
  }

  if (coupon.minOrderValue !== null && subtotal < coupon.minOrderValue.toNumber()) {
    const min = coupon.minOrderValue.toNumber();
    throw new CouponError(
      `A minimum order of Rs. ${min.toLocaleString()} is required to use this coupon`,
      400,
      "MIN_ORDER",
    );
  }

  return coupon;
}

// ── applyCoupon ────────────────────────────────────────────────────────────

export function applyCoupon(coupon: CouponRow, subtotal: number): ApplyCouponResult {
  let discountAmount: number;
  const discountValue = coupon.discountValue.toNumber();

  if (coupon.discountType === DiscountType.Percentage) {
    discountAmount = (discountValue / 100) * subtotal;
    if (coupon.maxDiscount !== null) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscount.toNumber());
    }
  } else {
    discountAmount = discountValue;
  }

  // Clamp: discount cannot exceed subtotal
  discountAmount = Math.min(discountAmount, subtotal);
  // Round to 2 decimal places
  discountAmount = Math.round(discountAmount * 100) / 100;

  const updatedSubtotal = Math.round((subtotal - discountAmount) * 100) / 100;

  return {
    couponId:        coupon.id,
    code:            coupon.code,
    discountType:    coupon.discountType as "Percentage" | "Fixed",
    discountValue,
    discountAmount,
    subtotal,
    updatedSubtotal,
  };
}

// ── incrementCouponUsage ───────────────────────────────────────────────────

export async function incrementCouponUsage(
  couponId: string,
  tx?: Prisma.TransactionClient,
): Promise<void> {
  const client = tx ?? prisma;
  await client.coupon.update({
    where: { id: couponId },
    data:  { usedCount: { increment: 1 } },
  });
}

// ── getCouponById ──────────────────────────────────────────────────────────

export async function getCouponById(id: string): Promise<CouponDTO | null> {
  const row = await prisma.coupon.findUnique({
    where:  { id },
    select: COUPON_SELECT,
  });
  return row ? serialize(row) : null;
}

// ── listCoupons ────────────────────────────────────────────────────────────

export async function listCoupons(query: CouponsQuery): Promise<CouponListResult> {
  const where: Prisma.CouponWhereInput = {
    ...(query.isActive !== null && { isActive: query.isActive }),
    ...(query.search && {
      OR: [
        { code:        { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ],
    }),
  };

  const [rows, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      select:  COUPON_SELECT,
      orderBy: { createdAt: "desc" },
      skip:    (query.page - 1) * query.limit,
      take:    query.limit,
    }),
    prisma.coupon.count({ where }),
  ]);

  return { items: rows.map(serialize), total };
}

// ── createCoupon ───────────────────────────────────────────────────────────

export async function createCoupon(body: CreateCouponBody): Promise<CouponDTO> {
  const existing = await prisma.coupon.findUnique({ where: { code: body.code }, select: { id: true } });
  if (existing) throw new CouponError(`Coupon code '${body.code}' already exists`, 409, "DUPLICATE_CODE");

  const row = await prisma.coupon.create({
    data: {
      code:          body.code,
      description:   body.description,
      discountType:  body.discountType as DiscountType,
      discountValue: body.discountValue,
      minOrderValue: body.minOrderValue,
      maxDiscount:   body.maxDiscount,
      usageLimit:    body.usageLimit,
      isActive:      body.isActive,
      startDate:     body.startDate,
      expiresAt:     body.endDate,
    },
    select: COUPON_SELECT,
  });
  return serialize(row);
}

// ── updateCoupon ───────────────────────────────────────────────────────────

export async function updateCoupon(id: string, body: UpdateCouponBody): Promise<CouponDTO> {
  const existing = await prisma.coupon.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new CouponError("Coupon not found", 404);

  if (body.code) {
    const conflict = await prisma.coupon.findFirst({
      where: { code: body.code, id: { not: id } },
      select: { id: true },
    });
    if (conflict) throw new CouponError(`Coupon code '${body.code}' already exists`, 409, "DUPLICATE_CODE");
  }

  const data: Prisma.CouponUpdateInput = {};
  if (body.code          !== undefined) data.code          = body.code;
  if (body.description   !== undefined) data.description   = body.description;
  if (body.discountType  !== undefined) data.discountType  = body.discountType as DiscountType;
  if (body.discountValue !== undefined) data.discountValue = body.discountValue;
  if (body.minOrderValue !== undefined) data.minOrderValue = body.minOrderValue;
  if (body.maxDiscount   !== undefined) data.maxDiscount   = body.maxDiscount;
  if (body.usageLimit    !== undefined) data.usageLimit    = body.usageLimit;
  if (body.isActive      !== undefined) data.isActive      = body.isActive;
  if (body.startDate     !== undefined) data.startDate     = body.startDate;
  if (body.endDate       !== undefined) data.expiresAt     = body.endDate;

  const row = await prisma.coupon.update({
    where:  { id },
    data,
    select: COUPON_SELECT,
  });
  return serialize(row);
}

// ── deleteCoupon ───────────────────────────────────────────────────────────

export async function deleteCoupon(id: string): Promise<void> {
  const existing = await prisma.coupon.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new CouponError("Coupon not found", 404);

  await prisma.coupon.delete({ where: { id } });
}
