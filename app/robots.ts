import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow:    ["/", "/shop", "/products/", "/categories/"],
        disallow: [
          "/admin",
          "/api/",
          "/dashboard",
          "/checkout",
          "/cart",
          "/login",
          "/register",
          "/unauthorized",
          "/forbidden",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
