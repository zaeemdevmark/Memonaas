"use client";

import { useEffect, useRef } from "react";
import SizeGuideImageGallery from "./SizeGuideImageGallery";

interface SizeGuideImage {
  url:          string;
  optimizedUrl: string;
}

interface SizeGuideModalProps {
  images: SizeGuideImage[];
  onClose: () => void;
}

export default function SizeGuideModal({ images, onClose }: SizeGuideModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent background scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Size Guide"
    >
      <div className="relative flex w-full max-w-lg flex-col rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="text-lg font-semibold tracking-tight text-stone-900">Size Guide</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
            aria-label="Close size guide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto p-5" style={{ maxHeight: "calc(90vh - 80px)" }}>
          <SizeGuideImageGallery images={images} />
        </div>
      </div>
    </div>
  );
}
