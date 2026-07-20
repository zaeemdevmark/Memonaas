"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function FeatureSplit() {
  return (
    <section className="bg-[var(--bg)] py-20 md:py-28">
      <div className="relative h-[560px] sm:h-[520px] md:h-[600px] w-full">
        <Image
          src="/images/about-story.jpg"
          alt="Where elegance meets modern femininity"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent md:from-black/50" />
        <div aria-hidden="true" className="absolute inset-4 md:inset-6 border border-white/25 pointer-events-none" />

        <div className="absolute inset-0 flex items-end sm:items-center px-5 sm:px-10 md:px-16 pb-8 sm:pb-0">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full sm:w-[380px] md:w-[440px] bg-[var(--bg)] shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[var(--accent)]/30 px-6 py-7 md:px-9 md:py-9"
          >
            <span className="block text-[10.5px] md:text-[11px] font-medium tracking-[0.3em] uppercase text-[var(--accent-text)]">
              Our Philosophy
            </span>
            <h2 className="font-display text-[26px] sm:text-[28px] md:text-[34px] leading-[1.2] text-[var(--ink)] mt-3">
              Where Elegance Meets{" "}
              <span className="italic text-[var(--accent-text)]">Modern Femininity</span>
            </h2>
            <div className="w-12 h-px bg-[var(--accent)] mt-5 mb-5" />
            <p className="text-[13.5px] md:text-[14.5px] text-[var(--muted)] leading-[1.7] max-w-[360px]">
              Crafted with premium fabrics and refined details, our collections
              celebrate the beauty of every woman with effortless sophistication.
            </p>
            <Link
              href="/about-us"
              className="group/btn inline-flex items-center justify-center gap-2 mt-6 px-7 py-3 text-[12.5px] font-medium tracking-[0.15em] uppercase border border-[var(--accent)] bg-transparent text-[var(--ink)] hover:bg-[var(--accent)] hover:text-white transition-colors"
            >
              Learn More
              <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover/btn:translate-x-1">&rarr;</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
