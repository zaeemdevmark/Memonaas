import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import MarqueeStrip from "@/components/home/MarqueeStrip";
import NewArrivalsSection from "@/components/home/NewArrivalsSection";
import CategoryProductRow from "@/components/home/CategoryProductRow";
import FeatureSplit from "@/components/home/FeatureSplit";
import CategoryTiles from "@/components/home/CategoryTiles";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
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

function toCardProps(items: Awaited<ReturnType<typeof getProducts>>["items"]) {
  return items.map((p) => ({
    id:        p.id,
    slug:      p.slug,
    name:      p.name,
    price:     fmt(p.basePrice),
    salePrice: p.salePrice != null ? fmt(p.salePrice) : undefined,
    soldOut:   p.totalStock === 0,
    image:     p.image?.optimizedUrl ?? p.image?.url ?? undefined,
  }));
}

export default async function Home() {
  let newArrivalItems: Awaited<ReturnType<typeof getProducts>>["items"] = [];
  let embroideredPretItems: Awaited<ReturnType<typeof getProducts>>["items"] = [];
  let summerPrintItems: Awaited<ReturnType<typeof getProducts>>["items"] = [];
  try {
    [
      { items: newArrivalItems },
      { items: embroideredPretItems },
      { items: summerPrintItems },
    ] = await Promise.all([
      getProducts({ page: 1, limit: 4,  sort: "custom" }),
      getProducts({ page: 1, limit: 10, sort: "custom", category: "3-piece-suits" }),
      getProducts({ page: 1, limit: 10, sort: "custom", category: "printed-suits" }),
    ]);
  } catch {
    // Database unavailable — render page without products rather than 500
  }

  const newArrivals = toCardProps(newArrivalItems);
  const embroideredPret = toCardProps(embroideredPretItems);
  const summerPrint = toCardProps(summerPrintItems);

  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute inset-0 -z-10 home-bg-texture" />

      <JsonLd schema={webSiteSchema} />

      <HeroSection />
      <MarqueeStrip />
      <CategoryTiles />
      <CategoryProductRow
        eyebrow="Collection One"
        title="Embroidered Pret"
        href="/collections/3-piece-suits"
        products={embroideredPret}
      />
      <CategoryProductRow
        eyebrow="Collection Two"
        title="Summer Print"
        href="/collections/printed-suits"
        products={summerPrint}
      />
      <NewArrivalsSection products={newArrivals} />
      <FeatureSplit />
      <WhyChooseUs />
      <Testimonials />
    </div>
  );
}
