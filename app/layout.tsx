import type { Metadata } from "next";
import { Instrument_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import ConditionalShell from "@/components/ConditionalShell";
import JsonLd from "@/components/JsonLd";
import { auth } from "@/auth";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, organizationSchema } from "@/lib/seo";
import { Analytics }      from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ClickEffect from "@/components/ClickEffect";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets:  ["latin"],
  display:  "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets:  ["latin"],
  axes:     ["opsz", "SOFT"],
  display:  "swap",
});

export const metadata: Metadata = {
  metadataBase:    new URL(SITE_URL),
  title:           `${SITE_NAME} — Considered Everyday Wear`,
  description:     SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    locale:   "en_US",
    type:     "website",
  },
  twitter: {
    card:    "summary_large_image",
    creator: "@memonaas",
    site:    "@memonaas",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const role    = session?.user?.role ?? null;

  return (
    <html lang="en" className={`${instrumentSans.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[var(--font-instrument-sans)] bg-[var(--bg)] text-[var(--ink)]">
        <JsonLd schema={organizationSchema()} />
        <ConditionalShell role={role}>{children}</ConditionalShell>
        <ClickEffect />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
