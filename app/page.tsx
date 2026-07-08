import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import CollectionSection from "@/components/CollectionSection";
import JsonLd from "@/components/JsonLd";
import { buildMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";
import { getProducts } from "@/lib/services/product.service";

export const revalidate = 60; // ISR: serve from CDN, regenerate in background every 60 s

export const metadata: Metadata = buildMetadata({
  title:       `${SITE_NAME} — Considered Everyday Wear`,
  description: "Discover considered everyday clothing at Memonaas — modern silhouettes, honest fabrics, and thoughtfully made collections.",
  path:        "/",
  keywords:    [
    "everyday clothing Pakistan",
    "modern women's fashion",
    "Memonaas",
    "Pakistani clothing brand",
    "contemporary fashion Lahore",
    "women's clothing online Pakistan",
  ],
});

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type":    "WebSite",
  name:       SITE_NAME,
  url:        SITE_URL,
};

function fmt(amount: number): string {
  return `Rs. ${Math.round(amount).toLocaleString("en-US")}`;
}

export default async function Home() {
  let items: Awaited<ReturnType<typeof getProducts>>["items"] = [];
  try {
    ({ items } = await getProducts({ page: 1, limit: 100, sort: "custom" }));
  } catch {
    // Database unavailable — render page without collections rather than 500
  }

  // Group products by category, ordered by the admin-defined category sortOrder
  const categoryMap = new Map<string, {
    name: string;
    slug: string;
    description: string | null;
    sortOrder: number;
    products: typeof items;
  }>();

  for (const p of items) {
    if (!p.category) continue;
    const key = p.category.slug;
    if (!categoryMap.has(key)) {
      categoryMap.set(key, {
        name:        p.category.name,
        slug:        key,
        description: p.category.description ?? null,
        sortOrder:   p.category.sortOrder,
        products:    [],
      });
    }
    categoryMap.get(key)!.products.push(p);
  }

  const collections = [...categoryMap.values()]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 3);

  return (
    <>
      <JsonLd schema={webSiteSchema} />

      <HeroSection />

      {collections.map((col, i) => (
        <CollectionSection
          key={col.slug}
          className={i === 0 ? "!mt-0 min-[992px]:!mt-[67px] !mb-6 min-[992px]:!mb-[137px]" : i === 1 ? "!mt-2 min-[992px]:!mt-0 !mb-[73px]" : i === 2 ? "!mb-6 min-[992px]:!mb-[70px]" : ""}
          title={col.name}
          description={col.description ?? ""}
          slug={col.slug}
          priorityFirst={i === 0}
          products={col.products.map((p) => ({
            id:         p.id,
            slug:       p.slug,
            name:       p.name,
            price:      fmt(p.basePrice),
            salePrice:  p.salePrice != null ? fmt(p.salePrice) : undefined,
            soldOut:    p.totalStock === 0,
            image:      p.image?.optimizedUrl ?? p.image?.url ?? undefined,
            hoverImage: p.hoverImage?.optimizedUrl ?? p.hoverImage?.url ?? undefined,
          }))}
        />
      ))}
    </>
  );
}
