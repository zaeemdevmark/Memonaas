"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const TILES = [
  { index: "01", label: "Embroidered Pret", href: "/collections/3-piece-suits", image: "/images/products/p1-01.jpg" },
  { index: "02", label: "Summer Print",     href: "/collections/printed-suits", image: "/images/products/p11-01.jpg" },
];

export default function CategoryTiles() {
  return (
    <section className="bg-transparent py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-14 md:mb-16"
        >
          <span className="text-[11px] font-medium tracking-[0.3em] uppercase text-[var(--accent-text)]">
            Shop By Edit
          </span>
          <div className="w-10 h-px bg-[var(--accent)] mx-auto mt-4" />
        </motion.div>

        <div className="grid grid-cols-1 min-[640px]:grid-cols-2 gap-8 md:gap-10">
          {TILES.map((tile, i) => (
            <motion.div
              key={tile.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.12 }}
            >
              <Link
                href={tile.href}
                className="group relative block aspect-[3/4] overflow-hidden transition-transform duration-300 ease-out hover:-translate-y-1"
              >
                <Image
                  src={tile.image}
                  alt={tile.label}
                  fill
                  sizes="(max-width: 639px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent"
                />
                <div aria-hidden="true" className="absolute inset-4 border border-white/25 pointer-events-none" />

                <span
                  aria-hidden="true"
                  className="absolute top-6 left-6 font-display text-[72px] md:text-[88px] leading-none text-white/20 select-none"
                >
                  {tile.index}
                </span>

                <div className="absolute inset-x-6 bottom-6">
                  <span className="block text-[10px] font-medium tracking-[0.3em] uppercase text-[var(--accent)]">
                    Collection
                  </span>
                  <h3 className="font-display text-2xl md:text-[28px] text-white mt-1">
                    {tile.label}
                  </h3>
                  <span className="inline-flex items-center gap-2 mt-3 text-[11px] font-medium tracking-[0.2em] uppercase text-white/90 border-b border-white/40 group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-colors pb-1">
                    Explore
                    <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
