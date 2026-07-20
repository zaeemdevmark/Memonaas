"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const TILES = [
  { label: "Embroidered Pret", href: "/collections/3-piece-suits", image: "/images/products/p1-01.jpg" },
  { label: "Luxury Print",     href: "/collections/printed-suits", image: "/images/products/p11-01.jpg" },
];

export default function CategoryTiles() {
  return (
    <section className="bg-[var(--bg)] py-20 md:py-28">
      <div className="mx-auto max-w-[1500px] px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-14 md:mb-16"
        >
          <span className="text-[11px] font-medium tracking-[0.3em] uppercase text-[var(--accent)]">
            Our Collection
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
                className="group relative block aspect-[4/5] overflow-hidden"
              >
                <Image
                  src={tile.image}
                  alt={tile.label}
                  fill
                  sizes="(max-width: 639px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[1600ms] ease-in-out group-hover:scale-110"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent"
                />
                <div className="absolute inset-x-6 bottom-6">
                  <span className="block text-[10px] font-medium tracking-[0.3em] uppercase text-white">
                    Collection
                  </span>
                  <span className="btn-fill inline-flex items-center gap-2 mt-2 px-5 py-2.5 border border-white text-white text-[12.5px] font-medium tracking-[0.15em] uppercase">
                    <span>{tile.label}</span>
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
