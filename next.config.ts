import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Content-Security-Policy without nonces (nonces would disable ISR/static caching).
// 'unsafe-inline' for scripts is required by Next.js's hydration runtime;
// all other source lists are locked down to known-good origins.
const CSP = [
  "default-src 'self'",
  // Next.js injects inline scripts for hydration — unsafe-inline is unavoidable here.
  // unsafe-eval is only needed in development (React error-stack reconstruction).
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // Tailwind and CSS-in-JS generate inline styles at runtime.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // Cloudinary for product/category images, data: for blurred placeholders
  "img-src 'self' data: blob: https://res.cloudinary.com",
  // Sentry error reporting (only wires up when SENTRY_DSN is set)
  // Vercel Analytics + Speed Insights beacons
  "connect-src 'self' https://*.ingest.sentry.io https://vitals.vercel-insights.com https://va.vercel-scripts.com",
  // Vercel Analytics + Speed Insights scripts
  "script-src-elem 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  // Prevent clickjacking — more specific than X-Frame-Options
  "frame-ancestors 'none'",
  "frame-src 'none'",
  // Prevent abuse of <base> and <form action>
  "base-uri 'self'",
  "form-action 'self'",
  // Block plugins (Flash, Java, etc.)
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = [
  // Enforce HTTPS — only in production (dev uses HTTP)
  ...(isDev ? [] : [
    {
      key:   "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
  ]),
  { key: "Content-Security-Policy",  value: CSP },
  { key: "X-Frame-Options",          value: "DENY" },
  { key: "X-Content-Type-Options",   value: "nosniff" },
  { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control",   value: "on" },
  {
    key:   "Permissions-Policy",
    // Deny access to sensitive browser features we don't use
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress:        true,

  // Tell Next.js not to bundle these heavy server-only packages — they're
  // resolved at runtime by Node.js, so bundling them wastes compile time.
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
    "cloudinary",
    "bcryptjs",
    "resend",
    "@react-email/components",
    "@react-email/render",
  ],

  experimental: {
    // Enables per-package tree-shaking so only imported symbols are bundled.
    // Particularly effective for @sentry/nextjs and framer-motion.
    optimizePackageImports: [
      "framer-motion",
      "@sentry/nextjs",
      "@vercel/analytics",
      "@vercel/speed-insights",
      "zustand",
    ],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:  "res.cloudinary.com",
        pathname:  "/**",
      },
    ],
    formats:         ["image/avif", "image/webp"],
    minimumCacheTTL: 31_536_000,
    deviceSizes:     [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes:      [16, 32, 48, 64, 96, 128, 256, 384],
  },

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source:  "/(.*)",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
