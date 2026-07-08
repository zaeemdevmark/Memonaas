import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import type {
  CreateReviewBody, UpdateReviewBody,
  ModerateReviewBody, ReviewsQuery, AdminReviewsQuery,
} from "@/lib/validations/review";
import type {
  ReviewDTO, AdminReviewDTO,
  ReviewSummary, RatingDistribution,
  ProductReviewsResult, AdminReviewsResult,
} from "@/lib/types/review";
import { RecordNotFoundError } from "@/lib/db/errors";

// ── Domain error ───────────────────────────────────────────────────

export class ReviewError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = "ReviewError";
  }
}

// ── Shared select fragments ────────────────────────────────────────

const REVIEW_SELECT = {
  id:         true,
  rating:     true,
  title:      true,
  body:       true,
  isVerified: true,
  isApproved: true,
  productId:  true,
  createdAt:  true,
  updatedAt:  true,
  customer:   { select: { id: true, name: true } },
} satisfies Prisma.ReviewSelect;

const ADMIN_REVIEW_SELECT = {
  id:         true,
  rating:     true,
  title:      true,
  body:       true,
  isVerified: true,
  isApproved: true,
  productId:  true,
  createdAt:  true,
  updatedAt:  true,
  customer:   { select: { id: true, name: true } },
  product:    { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ReviewSelect;

type ReviewRow      = Prisma.ReviewGetPayload<{ select: typeof REVIEW_SELECT }>;
type AdminReviewRow = Prisma.ReviewGetPayload<{ select: typeof ADMIN_REVIEW_SELECT }>;

// ── Serializers ────────────────────────────────────────────────────

function serialize(r: ReviewRow): ReviewDTO {
  return {
    id:         r.id,
    rating:     r.rating,
    title:      r.title,
    body:       r.body,
    isVerified: r.isVerified,
    isApproved: r.isApproved,
    productId:  r.productId,
    user:       { id: r.customer.id, name: r.customer.name },
    createdAt:  r.createdAt.toISOString(),
    updatedAt:  r.updatedAt.toISOString(),
  };
}

function serializeAdmin(r: AdminReviewRow): AdminReviewDTO {
  return {
    id:         r.id,
    rating:     r.rating,
    title:      r.title,
    body:       r.body,
    isVerified: r.isVerified,
    isApproved: r.isApproved,
    productId:  r.productId,
    user:       { id: r.customer.id, name: r.customer.name },
    product:    r.product,
    createdAt:  r.createdAt.toISOString(),
    updatedAt:  r.updatedAt.toISOString(),
  };
}

// ── calculateProductRating ─────────────────────────────────────────

export async function calculateProductRating(productId: string): Promise<ReviewSummary> {
  const [agg, groups, total] = await Promise.all([
    prisma.review.aggregate({
      where:  { productId, isApproved: true },
      _avg:   { rating: true },
      _count: true,
    }),
    prisma.review.groupBy({
      by:     ["rating"],
      where:  { productId, isApproved: true },
      _count: { rating: true },
    }),
    prisma.review.count({ where: { productId } }),
  ]);

  const distribution: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const g of groups) {
    distribution[g.rating as keyof RatingDistribution] = g._count.rating;
  }

  const avg = agg._avg.rating;
  return {
    averageRating:   avg != null ? Math.round(avg * 10) / 10 : null,
    totalReviews:    total,
    approvedReviews: agg._count,
    distribution,
  };
}

// ── listProductReviews ─────────────────────────────────────────────

export async function listProductReviews(
  productSlug:     string,
  query:           ReviewsQuery,
  customerId?:     string,
  isAuthenticated = false,
): Promise<ProductReviewsResult> {
  const product = await prisma.product.findUnique({
    where:  { slug: productSlug },
    select: { id: true },
  });
  if (!product) throw new RecordNotFoundError("Product");

  const { page, limit } = query;
  const where: Prisma.ReviewWhereInput = { productId: product.id, isApproved: true };

  const [rows, total, summary] = await Promise.all([
    prisma.review.findMany({
      where,
      select:  REVIEW_SELECT,
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
    prisma.review.count({ where }),
    calculateProductRating(product.id),
  ]);

  let userReview: ReviewDTO | null = null;
  if (customerId) {
    const ur = await prisma.review.findUnique({
      where:  { customerId_productId: { customerId, productId: product.id } },
      select: REVIEW_SELECT,
    });
    if (ur) userReview = serialize(ur);
  }

  return {
    reviews:         rows.map(serialize),
    summary,
    userReview,
    isAuthenticated,
    total,
    page,
    totalPages:      Math.max(1, Math.ceil(total / limit)),
  };
}

// ── createReview ───────────────────────────────────────────────────

export async function createReview(
  productSlug: string,
  customerId:  string,
  body:        CreateReviewBody,
): Promise<ReviewDTO> {
  const product = await prisma.product.findUnique({
    where:  { slug: productSlug },
    select: { id: true },
  });
  if (!product) throw new RecordNotFoundError("Product");

  const existing = await prisma.review.findUnique({
    where:  { customerId_productId: { customerId, productId: product.id } },
    select: { id: true },
  });
  if (existing) throw new ReviewError("You have already reviewed this product", 409);

  const deliveredOrder = await prisma.order.findFirst({
    where: {
      customerId,
      status: "Delivered",
      items:  { some: { productId: product.id } },
    },
    select: { id: true },
  });

  const review = await prisma.review.create({
    data: {
      customerId,
      productId:  product.id,
      rating:     body.rating,
      title:      body.title,
      body:       body.body,
      isVerified: !!deliveredOrder,
      isApproved: false,
    },
    select: REVIEW_SELECT,
  });

  return serialize(review);
}

// ── updateReview ───────────────────────────────────────────────────

export async function updateReview(
  reviewId:   string,
  customerId: string,
  body:       UpdateReviewBody,
): Promise<ReviewDTO> {
  const existing = await prisma.review.findUnique({
    where:  { id: reviewId },
    select: { id: true, customerId: true },
  });
  if (!existing) throw new RecordNotFoundError("Review");
  if (existing.customerId !== customerId) throw new ReviewError("You can only edit your own reviews", 403);

  const review = await prisma.review.update({
    where: { id: reviewId },
    data:  {
      ...(body.rating !== undefined && { rating: body.rating }),
      ...(body.title  !== undefined && { title:  body.title  }),
      ...(body.body   !== undefined && { body:   body.body   }),
      isApproved: false,
    },
    select: REVIEW_SELECT,
  });

  return serialize(review);
}

// ── deleteReview ───────────────────────────────────────────────────

export async function deleteReview(
  reviewId:   string,
  customerId: string,
  role:       string,
): Promise<void> {
  const existing = await prisma.review.findUnique({
    where:  { id: reviewId },
    select: { id: true, customerId: true },
  });
  if (!existing) throw new RecordNotFoundError("Review");
  if (role !== "Admin" && existing.customerId !== customerId)
    throw new ReviewError("You can only delete your own reviews", 403);
  await prisma.review.delete({ where: { id: reviewId } });
}

// ── moderateReview ─────────────────────────────────────────────────

export async function moderateReview(
  reviewId: string,
  body:     ModerateReviewBody,
): Promise<ReviewDTO> {
  const existing = await prisma.review.findUnique({
    where:  { id: reviewId },
    select: { id: true },
  });
  if (!existing) throw new RecordNotFoundError("Review");

  const review = await prisma.review.update({
    where: { id: reviewId },
    data:  {
      ...(body.isApproved !== undefined && { isApproved: body.isApproved }),
    },
    select: REVIEW_SELECT,
  });

  return serialize(review);
}

// ── listAllReviews (admin) ─────────────────────────────────────────

export async function listAllReviews(
  query: AdminReviewsQuery,
): Promise<AdminReviewsResult> {
  const { page, limit, status, search } = query;

  const where: Prisma.ReviewWhereInput = {
    ...(status === "pending"  && { isApproved: false }),
    ...(status === "approved" && { isApproved: true  }),
    ...(search && {
      OR: [
        { title:    { contains: search, mode: "insensitive" } },
        { body:     { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
        { product:  { name: { contains: search, mode: "insensitive" } } },
      ],
    }),
  };

  const [rows, total] = await Promise.all([
    prisma.review.findMany({
      where,
      select:  ADMIN_REVIEW_SELECT,
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    reviews:    rows.map(serializeAdmin),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
