"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

interface Product {
  id?: string;
  image?: string;
  hoverImage?: string;
  name: string;
  price: string;
  salePrice?: string;
  slug: string;
  soldOut?: boolean;
}

export default function NewArrivalsSection({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section id="new-arrivals" className="scroll-mt-[76px] bg-transparent py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-14 md:mb-16"
        >
          <span className="text-[11px] font-medium tracking-[0.3em] uppercase text-[var(--accent-text)]">
            Curated Selection
          </span>
          <h2 className="font-display text-3xl md:text-[42px] leading-[1.2] text-[var(--ink)] mt-3">
            New Arrivals
          </h2>
          <div className="w-10 h-px bg-[var(--accent)] mx-auto mt-5" />
        </motion.div>
      </div>

      {/* Mobile — horizontal snap-scroll carousel, one card at a time with a peek of the next */}
      <div
        className="no-scrollbar min-[640px]:hidden flex snap-x snap-mandatory overflow-x-auto"
        style={{
          gap: "16px",
          paddingLeft: "20px",
          paddingRight: "20px",
          scrollPaddingLeft: "20px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        } as React.CSSProperties}
      >
        {products.slice(0, 4).map((p, i) => (
          <div key={p.slug} className="snap-start shrink-0" style={{ flex: "0 0 82vw", width: "82vw" }}>
            <ProductCard {...p} priority={i === 0} />
          </div>
        ))}
      </div>

      {/* Tablet/desktop — 4-column grid */}
      <div className="hidden min-[640px]:block mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid grid-cols-4 gap-6 md:gap-10">
          {products.slice(0, 4).map((p, i) => (
            <ProductCard key={p.slug} {...p} priority={i === 0} />
          ))}
        </div>
      </div>

      <div className="text-center mt-14 md:mt-16">
        <Link
          href="/shop"
          className="group/link inline-flex items-center gap-2 text-[12px] font-medium tracking-[0.2em] uppercase text-[var(--accent-text)] border-b border-[var(--accent)]/50 hover:border-[var(--accent)] pb-1 transition-colors"
        >
          View All Products
          <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover/link:translate-x-1">&rarr;</span>
        </Link>
      </div>
    </section>
  );
}
