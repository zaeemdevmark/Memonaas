"use client";

import { motion } from "framer-motion";

const ITEMS = [
  {
    label: "Premium Quality Fabric",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-9 h-9">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v10.5a2.5 2.5 0 0 1-5 0V7a1 1 0 0 0-1-1H6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6v12a3 3 0 0 0 3 3h9" />
      </svg>
    ),
  },
  {
    label: "Elegant Boutique Design",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-9 h-9">
        <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 8 6-8 12-8-12 8-6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h16M9.5 3 8 9l4 12M14.5 3 16 9l-4 12" />
      </svg>
    ),
  },
  {
    label: "Perfect For Every Occasion",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-9 h-9">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75h18M4.5 9.75v9a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-9M12 9.75V21M8.5 6.75a2 2 0 1 1 3.5-1.8 2 2 0 1 1 3.5 1.8H8.5Z" />
      </svg>
    ),
  },
  {
    label: "Cash On Delivery",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-9 h-9">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h13.5v9H2.25v-9ZM15.75 11.25h2.478a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 1 .44 1.061v2.379h-3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 17.25a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Zm10.5 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Z" />
      </svg>
    ),
  },
];

export default function WhyChooseUs() {
  return (
    // Full-bleed signature band — the one deliberate moment on the page where
    // the brand's own ink color becomes the background instead of the text
    // color. Same palette as everywhere else, just inverted, so it reads as
    // an intentional accent rather than a break in the page's color story.
    <section className="bg-[var(--ink)] py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-14 md:mb-16"
        >
          <span className="text-[11px] font-medium tracking-[0.3em] uppercase text-[var(--accent)]">
            The Memonaas Promise
          </span>
          <h2 className="font-display text-2xl md:text-[32px] leading-[1.2] text-white mt-3">
            Why Choose Memonaas
          </h2>
          <div className="w-10 h-px bg-[var(--accent)] mx-auto mt-5" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="grid grid-cols-2 min-[640px]:grid-cols-4 divide-x divide-y min-[640px]:divide-y-0 divide-[var(--accent)]/20"
        >
          {ITEMS.map((item) => (
            <div key={item.label} className="flex flex-col items-center text-center gap-4 px-4 py-8 text-[var(--accent)]">
              {item.icon}
              <span className="text-[13px] font-medium tracking-[0.03em] text-white/90 max-w-[160px]">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
