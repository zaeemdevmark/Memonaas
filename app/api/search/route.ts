import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
        slug:      true,
        name:      true,
        basePrice: true,
        salePrice: true,
        images: {
          orderBy: [{ isDefault: "desc" }, { position: "asc" }],
          select:  { optimizedUrl: true, url: true },
          take:    1,
        },
        variants: { select: { stock: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(
      products.map((p) => ({
        slug:      p.slug,
        name:      p.name,
        price:     fmt(p.basePrice),
        salePrice: p.salePrice != null ? fmt(p.salePrice) : undefined,
        image:     p.images[0]?.optimizedUrl ?? p.images[0]?.url ?? undefined,
        soldOut:   p.variants.length === 0 || p.variants.every((v) => v.stock === 0),
      }))
    );
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
