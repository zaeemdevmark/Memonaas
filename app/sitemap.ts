import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import prisma from "@/lib/prisma";

// Revalidate the sitemap hourly so newly published products appear quickly
export const revalidate = 3600;

const STATIC: MetadataRoute.Sitemap = [
  {
    url:             SITE_URL,
    lastModified:    new Date(),
    changeFrequency: "daily",
    priority:        1.0,
  },
  {
    url:             `${SITE_URL}/shop`,
    lastModified:    new Date(),
    changeFrequency: "daily",
    priority:        0.9,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where:  { status: "Active" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({
        where:  { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
      url:             `${SITE_URL}/products/${p.slug}`,
      lastModified:    p.updatedAt,
      changeFrequency: "weekly",
      priority:        0.8,
    }));

    const categoryUrls: MetadataRoute.Sitemap = categories.map((c) => ({
      url:             `${SITE_URL}/categories/${c.slug}`,
      lastModified:    c.updatedAt,
      changeFrequency: "weekly",
      priority:        0.7,
    }));

    return [...STATIC, ...productUrls, ...categoryUrls];
  } catch {
    return STATIC;
  }
}
