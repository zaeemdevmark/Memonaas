import type { Metadata } from "next";
import Link from "next/link";
import ShopClient from "@/components/ShopClient";
import { buildMetadata, SITE_NAME } from "@/lib/seo";
import { getProducts } from "@/lib/services/product.service";

export const revalidate = 60;

export const metadata: Metadata = buildMetadata({
  title:       `Shop All — ${SITE_NAME}`,
  description: "Browse the complete Memonaas collection — considered everyday pieces, modern silhouettes, and honest fabrics.",
  path:        "/shop",
  keywords:    [
    "shop women's clothing Pakistan",
    "modern women's fashion online",
    "Pakistani clothing brand",
    "everyday wear Pakistan",
    "contemporary women's wear",
    "Memonaas collection",
  ],
});

function fmt(amount: number): string {
  return `Rs. ${Math.round(amount).toLocaleString("en-US")}`;
}

export default async function ShopPage() {
  const { items } = await getProducts({ page: 1, limit: 100, sort: "custom" });

  const products = items.map((p) => ({
    id:         p.id,
    slug:       p.slug,
    name:       p.name,
    price:      fmt(p.basePrice),
    salePrice:  p.salePrice != null ? fmt(p.salePrice) : undefined,
    soldOut:    p.totalStock === 0,
    image:      p.image?.optimizedUrl ?? p.image?.url ?? undefined,
    hoverImage: p.hoverImage?.optimizedUrl ?? p.hoverImage?.url ?? undefined,
  }));

  return (
    <div className="px-5 sm:px-[30px] max-w-[1400px] mx-auto">

      <div className="pt-10 lg:pt-14">
        <h1 className="font-display text-3xl md:text-4xl text-[var(--ink)]">
          Shop All
        </h1>
      </div>

      {products.length === 0 ? (
        <div className="py-24 text-center text-[13px] text-[var(--muted)] tracking-wide">
          No products available yet. Check back soon.
        </div>
      ) : (
        <ShopClient products={products} />
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 py-6 mt-6 border-t border-[var(--border)] text-[11px] text-[var(--muted)] tracking-wide">
        <Link href="/" className="hover:text-[var(--accent)] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[var(--ink)]">Shop All</span>
      </nav>

    </div>
  );
}
