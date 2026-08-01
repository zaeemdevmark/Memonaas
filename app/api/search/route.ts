import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getRatingsForProductIds } from "@/lib/services/review.service";

function fmt(n: unknown): string {
  const v = parseFloat(String(n));
  return `Rs. ${Math.round(v).toLocaleString("en-US")}`;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  try {
    const products = await prisma.product.findMany({
      where: {
        status: "Active",
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
      select: {
        id:        true,
        slug:      true,
        name:      true,
        basePrice: true,
        salePrice: true,
        createdAt: true,
        isFeatured:       true,
        isLimitedEdition: true,
        images: {
          orderBy: [{ isDefault: "desc" }, { position: "asc" }],
          select:  { optimizedUrl: true, url: true },
          take:    1,
        },
        variants: { select: { stock: true, reservedStock: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const ratings = await getRatingsForProductIds(products.map((p) => p.id));

    return NextResponse.json(
      products.map((p) => {
        const totalStock = p.variants.reduce((sum, v) => sum + Math.max(0, v.stock - v.reservedStock), 0);
        const rating = ratings.get(p.id);
        return {
          slug:      p.slug,
          name:      p.name,
          price:     fmt(p.basePrice),
          salePrice: p.salePrice != null ? fmt(p.salePrice) : undefined,
          image:     p.images[0]?.optimizedUrl ?? p.images[0]?.url ?? undefined,
          soldOut:   totalStock === 0,
          createdAt:        p.createdAt.toISOString(),
          isBestseller:     p.isFeatured,
          isLimitedEdition: p.isLimitedEdition,
          totalStock,
          averageRating: rating?.averageRating ?? null,
          reviewCount:   rating?.reviewCount ?? 0,
        };
      })
    );
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
