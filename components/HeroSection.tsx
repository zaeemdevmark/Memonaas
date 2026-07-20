"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-transparent">
      {/* Pinned to the viewport (not the section) — the section above still
          reserves a full screen of scroll space, but the photo itself stays
          put while the next section on the page scrolls up over it. */}
      <div className="fixed inset-0 z-0 h-screen w-full">
        <Image
          src="/images/products/hero-home.jpg"
          alt="Memonaas — Where Modesty Meets Modern Elegance, model wearing an embroidered suit from the collection"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_32%]"
        />

        {/* Base scrim — keeps the floating panel's edge and any overlapping
            photo detail legible without flattening the photography. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent"
        />

        {/* Floating panel — the page's signature motif: a solid ivory card
            overlapping a full-bleed photo. Repeated in the philosophy banner
            and testimonials section to tie the page together visually. */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-x-5 bottom-5 sm:inset-x-auto sm:left-8 sm:right-auto sm:bottom-8 sm:w-[380px] md:left-14 md:bottom-12 md:w-[440px] bg-[var(--bg)] shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[var(--accent)]/30 px-6 py-7 md:px-9 md:py-9"
        >
          <h1 className="font-display text-[22px] sm:text-[26px] md:text-[30px] leading-[1.3] text-[var(--ink)]">
            Where Modesty Meets{" "}
            <span className="text-[var(--accent)]">Modern Elegance</span>
          </h1>
          <div className="w-12 h-px bg-[var(--accent)] mt-5 mb-5" />
          <p className="text-[13.5px] md:text-[14.5px] leading-[1.7] text-[var(--muted)] max-w-[360px]">
            Crafted with premium fabrics and refined details, our collections
            celebrate the beauty of every woman with effortless sophistication.
          </p>
          <Link
            href="/shop"
            className="group/btn btn-fill flex w-full items-center justify-center gap-2 mt-6 px-7 py-3 text-[12.5px] font-medium tracking-[0.15em] uppercase border border-[var(--accent)] bg-transparent text-[var(--ink)]"
          >
            <span>Shop All</span>
            <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover/btn:translate-x-1">&rarr;</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
