"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const DESKTOP_SLIDES = [
  { src: "/heroImg1.png", alt: "Nayab Posh — Collection" },
  { src: "/heroImg2.png", alt: "Nayab Posh — Collection" },
];

const MOBILE_SLIDES = [
  { src: "/mhImg1.png", alt: "Nayab Posh — Collection" },
  { src: "/mhImg2.png", alt: "Nayab Posh — Collection" },
];

const DISPLAY_MS    = 7000; // how long each image is shown before the next starts
const TRANSITION_MS = 2300; // fade duration (ms)

export default function HeroSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % DESKTOP_SLIDES.length);
    }, DISPLAY_MS);
    return () => clearInterval(id);
  }, []);

  const slideStyle = (i: number): React.CSSProperties => ({
    opacity:    i === active ? 1 : 0,
    transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
    willChange: "opacity",
  });

  return (
    <Link
      href="/shop"
      aria-label="Shop the collection"
      className="block relative w-full h-[55vh] min-[992px]:h-[566px] mt-0 min-[992px]:mt-[25px] mb-0 overflow-hidden bg-black cursor-pointer"
    >
      {/* ── Desktop images — hidden below 992 px ─────────────────────── */}
      {DESKTOP_SLIDES.map((slide, i) => (
        <Image
          key={`d-${slide.src}`}
          src={slide.src}
          alt={slide.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover hidden min-[992px]:block"
          style={slideStyle(i)}
        />
      ))}

      {/* ── Mobile / tablet images — hidden at 992 px and above ──────── */}
      {MOBILE_SLIDES.map((slide, i) => (
        <Image
          key={`m-${slide.src}`}
          src={slide.src}
          alt={slide.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover min-[992px]:hidden"
          style={slideStyle(i)}
        />
      ))}
    </Link>
  );
}
