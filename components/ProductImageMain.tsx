"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { SliderImage } from "./ProductImageSlider";

// Identical animation to ProductImageSlider — scroll-up forward, scroll-down backward
const variants = {
  enter:  (dir: number) => ({ y: dir >= 0 ? "100%" : "-100%" }),
  center: { y: 0 },
  exit:   (dir: number) => ({ y: dir >= 0 ? "-100%" : "100%" }),
};

const transition = {
  duration: 0.52,
  ease: [0.45, 0.0, 0.55, 1.0] as const,
};

export default function ProductImageMain({
  images,
  productName,
  active,
  direction,
}: {
  images:      SliderImage[];
  productName: string;
  active:      number;
  direction:   number;
}) {
  const img = images[active] ?? images[0];

  return (
    <div className="relative aspect-[563/844] rounded-[12px] overflow-hidden bg-[var(--accent-soft)]/40">
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={active}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          className="absolute inset-0"
          style={{ willChange: "transform" }}
        >
          {img?.url ? (
            <Image
              src={img.url}
              alt={productName}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
              priority={active === 0}
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0" style={{ background: img?.bg }} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
