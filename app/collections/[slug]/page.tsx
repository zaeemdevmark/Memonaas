import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import prisma from "@/lib/prisma";
import JsonLd from "@/components/JsonLd";
import ProductCard from "@/components/ProductCard";
import CollectionPagination from "@/components/collection/CollectionPagination";
import { buildMetadata, breadcrumbSchema, SITE_NAME, SITE_URL } from "@/lib/seo";

// Force dynamic so pagination search params work correctly
export const dynamic = "force-dynamic";

const PAGE_SIZE = 16;

// ── Helpers ────────────────────────────────────────────────────────

function fmt(n: { toString(): string } | null | undefined): string | null {
  if (n == null) return null;
  const v = parseFloat(n.toString());
  return isNaN(v) ? null : `Rs. ${Math.round(v).toLocaleString("en-PK")}`;
}

async function fetchCategory(slug: string) {
  return prisma.category.findFirst({
    where:  { slug, isActive: true },
    select: { id: true, name: true, slug: true, description: true, imageThumbnailUrl: true },
  });
}

async function fetchProducts(categoryId: string, page: number) {
  const skip = (page - 1) * PAGE_SIZE;

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where:   { categoryId, status: "Active" },
      select: {
        id:        true,
        slug:      true,
        name:      true,
        basePrice: true,
        salePrice: true,
        images: {
          orderBy: [{ isDefault: "desc" }, { position: "asc" }],
          select:  { optimizedUrl: true, url: true, altText: true },
          take:    2,
        },
        variants: { select: { stock: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where: { categoryId, status: "Active" } }),
  ]);

  return { rows, total };
}

// ── Metadata ───────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const category = await fetchCategory(slug);
    if (!category) return {};

    return buildMetadata({
      title:       `${category.name} — ${SITE_NAME}`,
      description:
        category.description ??
        `Shop the ${category.name} collection at ${SITE_NAME}. Considered clothing made for everyday life.`,
      path:        `/collections/${slug}`,
      image:       category.imageThumbnailUrl ?? undefined,
      keywords:    [
        category.name,
        `${category.name} Pakistan`,
        "modern women's fashion",
        "Pakistani clothing brand",
        SITE_NAME,
      ],
    });
  } catch {
    return {};
  }
}

// ── Page ───────────────────────────────────────────────────────────

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params:       Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug }   = await params;
  const { page: pageParam } = await searchParams;

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const category = await fetchCategory(slug);
  if (!category) notFound();

  const { rows, total } = await fetchProducts(category.id, page);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const products = rows.map((p) => ({
    id:         p.id,
    slug:       p.slug,
    name:       p.name,
    price:      fmt(p.basePrice) ?? "Price on request",
    salePrice:  fmt(p.salePrice) ?? undefined,
    image:      p.images[0]?.optimizedUrl ?? p.images[0]?.url ?? undefined,
    hoverImage: p.images[1]?.optimizedUrl ?? p.images[1]?.url ?? undefined,
    soldOut:    p.variants.length === 0 || p.variants.every((v) => v.stock === 0),
  }));

  const collectionUrl  = `${SITE_URL}/collections/${slug}`;

  const jsonLdSchema = breadcrumbSchema([
    { name: "Home",          url: SITE_URL },
    { name: category.name,   url: collectionUrl },
  ]);

  return (
    <>
      <JsonLd schema={jsonLdSchema} />

      <div className="px-5 sm:px-[30px]">

        {/* Heading */}
        <div className="pt-4 lg:pt-0">
          <h1 className="text-[23px] font-medium text-[var(--black)]">
            {category.name}
          </h1>
        </div>

        {/* Product grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 mt-8">
              {products.map((product, idx) => (
                <ProductCard key={product.slug} {...product} priority={idx === 0} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-16 pb-16">
                <Suspense>
                  <CollectionPagination
                    currentPage={page}
                    totalPages={totalPages}
                  />
                </Suspense>
              </div>
            )}
          </>
        ) : (
          <div className="py-24 text-center text-[13px] text-[var(--muted)] tracking-wide">
            This collection is being curated. Check back soon.
          </div>
        )}

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 py-6 mt-6 border-t border-[var(--border)] text-[11px] text-[var(--muted)] tracking-wide">
          <Link href="/" className="hover:text-[var(--accent)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[var(--accent)] transition-colors">Shop All</Link>
          <span>/</span>
          <span className="text-[var(--black)]">{category.name}</span>
        </nav>

      </div>
    </>
  );
}
