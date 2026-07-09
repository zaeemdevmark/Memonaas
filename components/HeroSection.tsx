"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--bg)]">
      <div className="relative min-[992px]:h-[600px] flex flex-col-reverse min-[992px]:flex-row items-stretch">

        {/* Text column — wrapped so it re-centers within the site's 1400px content
            width on desktop, even though the row itself is full-bleed for the image */}
        <div className="min-[992px]:absolute min-[992px]:inset-0 min-[992px]:mx-auto min-[992px]:max-w-[1400px] min-[992px]:pointer-events-none min-[992px]:z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col justify-center px-6 md:px-10 py-8 min-[992px]:py-0 min-[992px]:w-[46%] min-[992px]:absolute min-[992px]:left-0 min-[992px]:top-1/2 min-[992px]:-translate-y-1/2 min-[992px]:pointer-events-auto"
          >
            {/* Heading/tagline — overlaid on the photo itself on mobile (below), so
                hidden here to avoid duplication; shown here only from 992px up */}
            <h1 className="hidden min-[992px]:block font-display text-[56px] leading-[1.08] text-[var(--ink)]">
              Elegance Redefined
            </h1>
            <div className="hidden min-[992px]:block w-16 h-px bg-[var(--accent)] my-5" />
            <p className="hidden min-[992px]:block text-base text-[var(--muted)] max-w-sm">
              Premium 3-piece lawn suits for the modern woman.
            </p>
            <div className="hidden min-[992px]:block min-[992px]:mt-8">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium tracking-wide rounded-[4px] bg-[var(--accent)] text-white hover:bg-[var(--accent-ink)] transition-colors"
              >
                Shop Now
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Image — on mobile the whole photo links to /shop since the button below it is hidden there */}
        <Link
          href="/shop"
          aria-label="Shop Now"
          className="relative block w-full h-[560px] min-[992px]:h-full min-[992px]:w-[68%] min-[992px]:ml-auto min-[992px]:pointer-events-none"
        >
          <Image
            src="/images/hero.jpg"
            alt="Memonaas — Elegance Redefined, models wearing the new collection"
            fill
            priority
            sizes="(max-width: 991px) 100vw, 68vw"
            className="object-cover"
          />
          {/* Readability scrim — fades the page background into the photo so the
              overlapping text column (which extends past the image's left edge
              on desktop) stays legible over real photography. */}
          <div
            aria-hidden="true"
            className="hidden min-[992px]:block absolute inset-y-0 left-0 w-[28%] bg-gradient-to-r from-[var(--bg)] to-transparent"
          />

          {/* Mobile — heading overlaid on the photo itself, matching the reference layout */}
          <div
            aria-hidden="false"
            className="min-[992px]:hidden absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pt-24 pb-6 px-6"
          >
            <h1 className="font-display text-[34px] leading-[1.1] text-white">
              Elegance Redefined
            </h1>
            <p className="mt-2 text-[13px] text-white/80 max-w-xs">
              Premium 3-piece lawn suits for the modern woman.
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}
