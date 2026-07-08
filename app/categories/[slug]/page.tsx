import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import Breadcrumb from "@/components/Breadcrumb";
import JsonLd from "@/components/JsonLd";
import ProductCard from "@/components/ProductCard";
import {
  buildMetadata,
  breadcrumbSchema,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";

// ISR: revalidate category pages every hour
export const revalidate = 3600;

// ── Cached DB queries ─────────────────────────────────────────────

const getCategoryMeta = unstable_cache(
  async (slug: string) =>
    prisma.category.findFirst({
      where:  { slug, isActive: true },
      select: { name: true, description: true, imageThumbnailUrl: true },
    }),
  ["category-meta"],
  { revalidate: 3600, tags: ["categories"] },
);

const getCategoryPage = unstable_cache(
  async (slug: string) =>
    prisma.category.findFirst({
      where:  { slug, isActive: true },
      select: {
        id:          true,
        name:        true,
        slug:        true,
        description: true,
        imageUrl:    true,
        parent: { select: { name: true, slug: true } },
      },
    }),
  ["category-page"],
  { revalidate: 3600, tags: ["categories"] },
);

const getCategoryProducts = unstable_cache(
  async (categoryId: string) =>
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
          select:  { thumbnailUrl: true, url: true, altText: true },
          take:    2,
        },
        variants: { select: { stock: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ["category-products"],
  { revalidate: 3600, tags: ["categories", "products"] },
);

// ── Helpers ────────────────────────────────────────────────────────

function formatPrice(value: { toString(): string } | null | undefined): string | undefined {
  if (value == null) return undefined;
  const num = parseFloat(value.toString());
  return isNaN(num) ? undefined : `Rs. ${num.toLocaleString("en-US")}`;
}

// ── Static params ──────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({
      where:  { isActive: true },
      select: { slug: true },
    });
    return categories.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

// ── Dynamic metadata ───────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const category = await getCategoryMeta(slug);
    if (!category) return {};

    return buildMetadata({
      title:       `${category.name} — ${SITE_NAME}`,
      description: category.description ??
        `Shop the ${category.name} collection at ${SITE_NAME}. Considered clothing made for everyday life.`,
      path:        `/categories/${slug}`,
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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await getCategoryPage(slug);
  if (!category) notFound();

  const dbProducts = await getCategoryProducts(category.id);

  const products = dbProducts.map((p) => ({
    id:        p.id,
    slug:      p.slug,
    name:      p.name,
    price:     formatPrice(p.basePrice) ?? "Price on request",
    salePrice: formatPrice(p.salePrice),
    soldOut:    p.variants.length === 0 || p.variants.every((v) => v.stock === 0),
    image:      p.images[0]?.thumbnailUrl ?? p.images[0]?.url,
    hoverImage: p.images[1]?.thumbnailUrl ?? p.images[1]?.url ?? undefined,
  }));

  const categoryUrl = `${SITE_URL}/categories/${slug}`;

  const breadcrumbItems = category.parent
    ? [
        { name: "Home",              url: SITE_URL },
        { name: category.parent.name, url: `${SITE_URL}/categories/${category.parent.slug}` },
        { name: category.name,        url: categoryUrl },
      ]
    : [
        { name: "Home",         url: SITE_URL },
        { name: category.name,  url: categoryUrl },
      ];

  const breadcrumbNavItems = category.parent
    ? [
        { label: "Home",               href: "/" },
        { label: category.parent.name, href: `/categories/${category.parent.slug}` },
        { label: category.name },
      ]
    : [
        { label: "Home",          href: "/" },
        { label: category.name },
      ];

  return (
    <>
      <JsonLd schema={breadcrumbSchema(breadcrumbItems)} />

      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="hidden sm:block">
          <Breadcrumb items={breadcrumbNavItems} />
        </div>

        {/* Category header */}
        <div className="pt-4 pb-0 sm:pt-8 sm:pb-6 sm:border-b sm:border-[var(--border)]">
          <h1
            className="font-display text-[23px] sm:text-5xl text-[var(--ink)]"
          >
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-3 text-[14px] text-[var(--muted)] max-w-2xl leading-relaxed">
              {category.description}
            </p>
          )}
        </div>

        {/* Product grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 mt-8 pb-16">
            {products.map((product) => (
              <ProductCard key={product.slug} {...product} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-[13px] text-[var(--muted)] tracking-wide sm:text-[14px] sm:text-[var(--muted)] sm:tracking-normal">
              No products in this collection yet.
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-block text-[12px] tracking-widest uppercase text-[var(--ink)] border-b border-[var(--ink)] pb-0.5 hover:opacity-60 transition-opacity"
            >
              View all products
            </Link>
          </div>
        )}

        {/* Mobile breadcrumb — bottom placement, matches shop page style */}
        <nav className="sm:hidden flex items-center gap-2 py-6 mt-6 border-t border-[var(--border)] text-[11px] text-[var(--muted)] tracking-wide">
          {breadcrumbNavItems.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span>/</span>}
              {item.href ? (
                <Link href={item.href} className="hover:text-[var(--accent)] transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-[var(--black)]">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </>
  );
}
