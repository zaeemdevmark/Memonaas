import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import NewArrivalsSection from "@/components/home/NewArrivalsSection";
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

export default async function Home() {
  let items: Awaited<ReturnType<typeof getProducts>>["items"] = [];
  try {
    ({ items } = await getProducts({ page: 1, limit: 4, sort: "custom" }));
  } catch {
    // Database unavailable — render page without products rather than 500
  }

  const newArrivals = items.map((p) => ({
    id:        p.id,
    slug:      p.slug,
    name:      p.name,
    price:     fmt(p.basePrice),
    salePrice: p.salePrice != null ? fmt(p.salePrice) : undefined,
    soldOut:   p.totalStock === 0,
    image:     p.image?.optimizedUrl ?? p.image?.url ?? undefined,
  }));

  return (
    <>
      <JsonLd schema={webSiteSchema} />

      <HeroSection />
      <NewArrivalsSection products={newArrivals} />
      <FeatureSplit />
      <CategoryTiles />
      <WhyChooseUs />
      <Testimonials />
    </>
  );
}
