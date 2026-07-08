import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";
import JsonLd from "@/components/JsonLd";
import {
  buildMetadata,
  productSchema,
  breadcrumbSchema,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import { getProductBySlug, getProducts } from "@/lib/services/product.service";

export const dynamic = "force-dynamic";

function fmt(amount: number): string {
  return `Rs. ${Math.round(amount).toLocaleString("en-US")}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product  = await getProductBySlug(slug);
  if (!product) return {};

  return buildMetadata({
    title:       `${product.name} — ${SITE_NAME}`,
    description: product.description ??
      `Shop ${product.name} at ${SITE_NAME}. Considered clothing made for everyday life.`,
    path:        `/products/${slug}`,
    keywords:    [
      product.name,
      "everyday women's clothing",
      "Pakistani clothing brand",
      SITE_NAME,
      "women's fashion Pakistan",
    ],
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product  = await getProductBySlug(slug);
  if (!product) notFound();

  // Related products from the same category (excluding self)
  const related: Array<{ id: string; slug: string; name: string; price: string; salePrice?: string; soldOut?: boolean; image?: string; hoverImage?: string }> = [];
  if (product.category) {
    const { items } = await getProducts({
      page:     1,
      limit:    5,
      sort:     "newest",
      category: product.category.slug,
    });
    for (const p of items) {
      if (p.slug === slug) continue;
      related.push({
        id:         p.id,
        slug:       p.slug,
        name:       p.name,
        price:      fmt(p.basePrice),
        salePrice:  p.salePrice != null ? fmt(p.salePrice) : undefined,
        soldOut:    p.totalStock === 0,
        image:      p.image?.optimizedUrl ?? p.image?.url ?? undefined,
        hoverImage: p.hoverImage?.optimizedUrl ?? p.hoverImage?.url ?? undefined,
      });
      if (related.length === 4) break;
    }
  }

  // All sizes — zero-stock ones shown as strikethrough on the product page
  const sizes = [
    ...new Set(product.variants.map((v) => String(v.size))),
  ];

  const productData = {
    id:          product.id,
    slug:        product.slug,
    name:        product.name,
    sku:         product.sku,
    price:       fmt(product.basePrice),
    salePrice:   product.salePrice != null ? fmt(product.salePrice) : undefined,
    soldOut:     product.totalStock === 0,
    sizes,
    variants:    product.variants.map((v) => ({ id: v.id, size: String(v.size), stock: v.stock })),
    description:  product.description  ?? "",
    tab1Title:    product.tab1Title    ?? null,
    tab1Content:  product.tab1Content  ?? null,
    images:
      product.images.length > 0
        ? product.images.map((img) => ({
            id:  img.id,
            url: img.optimizedUrl ?? img.url,
          }))
        : [{ id: "placeholder", bg: "linear-gradient(135deg, #EDE8E1 0%, #D9D2C6 100%)" }],
    accordion: [
      ...(product.tab1Title && product.tab1Content
        ? [{ title: product.tab1Title, content: product.tab1Content, isHtml: true }]
        : []),
      {
        title:   "Care Instructions",
        content: "Dry clean only. Do not wring or tumble dry. Store in a cool, dry place away from direct sunlight. Iron on low heat with a protective cloth.",
      },
      {
        title:   "Delivery",
        content: "Standard delivery within 5–7 business days. Express delivery available within 2–3 business days. Free shipping on orders above Rs. 5,000.",
      },
    ],
    related,
    sizeGuideImage1: product.sizeGuideImage1 ?? null,
    sizeGuideImage2: product.sizeGuideImage2 ?? null,
  };

  const productUrl     = `${SITE_URL}/products/${slug}`;
  const effectivePrice = product.salePrice ?? product.basePrice;

  return (
    <>
      <JsonLd schema={productSchema({
        name:         product.name,
        description:  product.description ?? undefined,
        sku:          product.sku,
        price:        effectivePrice,
        url:          productUrl,
        availability: product.totalStock === 0
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      })} />
      <JsonLd schema={breadcrumbSchema([
        { name: "Home",         url: SITE_URL },
        { name: "Shop",         url: `${SITE_URL}/shop` },
        { name: product.name,   url: productUrl },
      ])} />

      <ProductDetailClient product={productData} />
    </>
  );
}
