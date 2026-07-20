"use client";

import { useRef } from "react";
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

export default function CategoryProductRow({
  eyebrow,
  title,
  href,
  products,
}: {
  eyebrow: string;
  title: string;
  href: string;
  products: Product[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (!products.length) return null;

  function scroll(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = (card?.getBoundingClientRect().width ?? 320) + 20;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  return (
    <section className="bg-[var(--bg)] py-16 md:py-20">
      <div className="px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-end justify-between gap-4 mb-8 md:mb-10"
        >
          <div>
            <span className="block text-[11px] font-medium tracking-[0.3em] uppercase text-[var(--accent-text)]">
              {eyebrow}
            </span>
            <h2 className="font-display text-2xl md:text-[32px] leading-[1.2] text-[var(--ink)] mt-2">
              {title}
            </h2>
          </div>

          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <Link
              href={href}
              className="text-[12px] font-medium tracking-[0.15em] uppercase text-[var(--accent-text)] border-b border-[var(--accent)]/50 hover:border-[var(--accent)] pb-1 transition-colors"
            >
              View All
            </Link>
            <button
              type="button"
              aria-label={`Scroll ${title} left`}
              onClick={() => scroll(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--accent)]/40 text-[var(--ink)] hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-colors"
            >
              &larr;
            </button>
            <button
              type="button"
              aria-label={`Scroll ${title} right`}
              onClick={() => scroll(1)}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--accent)]/40 text-[var(--ink)] hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-colors"
            >
              &rarr;
            </button>
          </div>
        </motion.div>
      </div>

      <div
        ref={scrollerRef}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto gap-5 md:gap-6 px-5 md:px-10"
        style={{
          scrollPaddingLeft: "20px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        } as React.CSSProperties}
      >
        {products.map((p, i) => (
          <div
            key={p.slug}
            data-card
            className="snap-start shrink-0 w-[78%] min-[640px]:w-[46%] min-[900px]:w-[31.3%]"
          >
            <ProductCard {...p} priority={i === 0} />
          </div>
        ))}
      </div>
    </section>
  );
}
