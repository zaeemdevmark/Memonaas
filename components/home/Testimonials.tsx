"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const QUOTES = [
  { text: "Absolutely loved the fabric and fit — every detail felt considered.", author: "Ayesha K." },
  { text: "Beautiful design and superb quality. I was genuinely impressed.", author: "Sara M." },
];

export default function Testimonials() {
  return (
    <section className="bg-transparent py-20 md:py-28">
      <div className="relative min-h-[560px] md:min-h-[640px] w-full">
        <Image
          src="/images/testimonial.jpg"
          alt="Memonaas customer wearing a piece from the collection"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-black/40" />
        <div aria-hidden="true" className="absolute inset-4 md:inset-6 border border-white/25 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-center min-h-[560px] md:min-h-[640px] px-5 py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-xl bg-[var(--bg)] shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-[var(--accent)]/30 px-7 py-10 md:px-14 md:py-14 text-center"
          >
            <span className="block text-[11px] font-medium tracking-[0.3em] uppercase text-[var(--accent-text)]">
              In Their Words
            </span>
            <span aria-hidden="true" className="block font-display text-[56px] leading-none text-[var(--accent)]/30 mt-3">
              &ldquo;
            </span>

            <div className="space-y-8 -mt-2">
              {QUOTES.map((q) => (
                <div key={q.author}>
                  <p className="font-display italic text-lg md:text-xl text-[var(--ink)] leading-snug">
                    {q.text}
                  </p>
                  <p className="mt-3 text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--accent-text)]">
                    {q.author}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
