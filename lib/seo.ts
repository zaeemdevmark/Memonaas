import type { Metadata } from "next";

export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nayabposh.com").replace(/\/$/, "");

export const SITE_NAME        = "Nayab Posh";
export const SITE_DESCRIPTION =
  "Premium ladies clothing — timeless silhouettes and the finest fabrics, crafted for the refined woman.";
export const TWITTER_HANDLE   = "@nayabposh";

// ── Core metadata builder ──────────────────────────────────────────

export function buildMetadata({
  title,
  description = SITE_DESCRIPTION,
  path        = "/",
  image,
  noIndex     = false,
  keywords,
}: {
  title:        string;
  description?: string;
  path?:        string;
  image?:       string;
  noIndex?:     boolean;
  keywords?:    string[];
}): Metadata {
  const canonicalUrl = `${SITE_URL}${path}`;
  const ogImage      = image ?? "/og-default.jpg";

  return {
    title,
    description,
    keywords,
    alternates: { canonical: canonicalUrl },
    robots:     noIndex
      ? { index: false, follow: false }
      : { index: true,  follow: true },
    openGraph: {
      title,
      description,
      url:      canonicalUrl,
      siteName: SITE_NAME,
      locale:   "en_US",
      type:     "website",
      images:   [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images:      [ogImage],
      creator:     TWITTER_HANDLE,
      site:        TWITTER_HANDLE,
    },
  };
}

// ── JSON-LD schema builders ────────────────────────────────────────

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type":    "Organization",
    name:       SITE_NAME,
    url:        SITE_URL,
    logo: {
      "@type": "ImageObject",
      url:     `${SITE_URL}/logo.png`,
    },
    sameAs:      [] as string[],
    contactPoint: {
      "@type":           "ContactPoint",
      contactType:       "customer service",
      availableLanguage: "English",
    },
  };
}

export function productSchema({
  name,
  description,
  image,
  price,
  sku,
  url,
  currency     = "PKR",
  availability = "https://schema.org/InStock",
}: {
  name:          string;
  description?:  string;
  image?:        string;
  price:         number | string;
  sku:           string;
  url:           string;
  currency?:     string;
  availability?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type":    "Product",
    name,
    description,
    sku,
    image,
    url,
    brand:  { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type":       "Offer",
      price:         String(price),
      priceCurrency: currency,
      availability,
      url,
      seller:        { "@type": "Organization", name: SITE_NAME },
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context":      "https://schema.org",
    "@type":         "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type":  "ListItem",
      position: i + 1,
      name:     item.name,
      item:     item.url,
    })),
  };
}
