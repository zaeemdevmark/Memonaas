"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Section";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--bg)]">
      {/* Decorative color blocks — no stock photography, just soft shapes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-[var(--accent-soft)] blur-3xl opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-[-10%] w-[320px] h-[320px] rounded-full bg-[var(--sage)]/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-[1400px] px-5 md:px-10 pt-16 pb-20 md:pt-28 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <Eyebrow>New Season</Eyebrow>
          <h1 className="font-display text-[42px] leading-[1.08] md:text-[68px] md:leading-[1.05] text-[var(--ink)]">
            Considered clothing,
            <br />
            made for everyday life.
          </h1>
          <p className="mt-6 text-base md:text-lg text-[var(--muted)] max-w-md">
            Modern silhouettes, honest fabrics, and pieces built to be worn often —
            not just once.
          </p>
          <div className="mt-9 flex items-center gap-6">
            <LinkButton href="/shop" size="lg">
              Shop the Collection
            </LinkButton>
            <Link
              href="/about-us"
              className="text-sm font-medium text-[var(--ink)] underline underline-offset-4 decoration-[var(--border)] hover:decoration-[var(--accent)] transition-colors"
            >
              Our story
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
