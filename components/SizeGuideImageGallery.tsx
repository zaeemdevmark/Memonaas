"use client";

import { useState } from "react";
import Image from "next/image";

interface SizeGuideImage {
  url:          string;
  optimizedUrl: string;
}

interface SizeGuideImageGalleryProps {
  images: SizeGuideImage[];
}

export default function SizeGuideImageGallery({ images }: SizeGuideImageGalleryProps) {
  const [zoomed, setZoomed] = useState(false);
  const [active, setActive] = useState(0);

  if (images.length === 0) return null;

  const current = images[active];

  return (
    <div className="flex flex-col gap-4">
      {/* Main image with zoom toggle */}
      <div
        className={`relative w-full cursor-zoom-in overflow-hidden rounded-md bg-stone-100 ${
          zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        }`}
        style={{ minHeight: 300 }}
        onClick={() => setZoomed((z) => !z)}
      >
        <Image
          src={current.optimizedUrl}
          alt={`Size guide ${active + 1}`}
          fill
          className={`object-contain transition-transform duration-200 ${
            zoomed ? "scale-150" : "scale-100"
          }`}
          sizes="(max-width: 768px) 100vw, 600px"
          unoptimized
        />
        <span className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
          {zoomed ? "Click to zoom out" : "Click to zoom in"}
        </span>
      </div>

      {/* Thumbnail strip — only shown when there are 2 images */}
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setActive(i); setZoomed(false); }}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border-2 transition-colors ${
                i === active ? "border-stone-800" : "border-transparent hover:border-stone-400"
              }`}
            >
              <Image
                src={img.optimizedUrl}
                alt={`Size guide thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
