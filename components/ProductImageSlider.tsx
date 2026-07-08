"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export interface SliderImage {
  id:   string;
  url?: string;
  bg?:  string;
}

const variants = {
  enter: (dir: number) => ({ y: dir >= 0 ? "100%" : "-100%" }),
  center: { y: 0 },
  exit:  (dir: number) => ({ y: dir >= 0 ? "-100%" : "100%" }),
};

const transition = {
  duration: 0.52,
  ease: [0.45, 0.0, 0.55, 1.0] as const,
};

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export default function ProductImageSlider({
  images,
  productName,
}: {
  images:      SliderImage[];
  productName: string;
}) {
  const [[active, direction], setSlide] = useState<[number, number]>([0, 0]);
  const [fullscreen, setFullscreen]     = useState(false);
  const [fsScale, setFsScale]           = useState(1);
  const [fsOffset, setFsOffset]         = useState({ x: 0, y: 0 });

  const go = useCallback((next: number, dir?: number) => {
    if (next === active || next < 0 || next >= images.length) return;
    setSlide([next, dir ?? (next > active ? 1 : -1)]);
  }, [active, images.length]);

  const img = images[active] ?? images[0];

  // Keep the thumbnail strip following the active image — scroll the strip's own
  // container directly (never scrollIntoView: when the strip has no overflow of
  // its own, the browser walks up and scrolls the whole page instead).
  const thumbColRef = useRef<HTMLDivElement>(null);
  const thumbRefs   = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    const col = thumbColRef.current;
    const btn = thumbRefs.current[active];
    if (!col || !btn) return;
    const target = btn.offsetTop - (col.clientHeight - btn.clientHeight) / 2;
    const max    = col.scrollHeight - col.clientHeight;
    col.scrollTo({ top: Math.max(0, Math.min(target, max)), behavior: "smooth" });
  }, [active]);

  // Lock body scroll in fullscreen; reset zoom on close
  useEffect(() => {
    document.body.style.overflow = fullscreen ? "hidden" : "";
    if (!fullscreen) {
      setFsScale(1);
      setFsOffset({ x: 0, y: 0 });
    }
    return () => { document.body.style.overflow = ""; };
  }, [fullscreen]);

  // ── Normal image: block page scroll on touch ──────────────────────
  const touch      = useRef({ y: 0, x: 0, locked: false });
  const mainImgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mainImgRef.current;
    if (!el) return;
    const block = (e: TouchEvent) => e.preventDefault();
    el.addEventListener("touchmove", block, { passive: false });
    return () => el.removeEventListener("touchmove", block);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    touch.current.y = e.touches[0].clientY;
    touch.current.x = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touch.current.locked) return;
    const deltaY = touch.current.y - e.changedTouches[0].clientY;
    const deltaX = Math.abs(touch.current.x - e.changedTouches[0].clientX);
    if (Math.abs(deltaY) < 10 && deltaX < 10) { setFullscreen(true); return; }
    if (Math.abs(deltaY) < 40 || deltaX > Math.abs(deltaY)) return;
    touch.current.locked = true;
    if (deltaY > 0) {
      const next = active === images.length - 1 ? 0 : active + 1; // wrap forward at the end
      go(next, 1);
    } else {
      go(active - 1);
    }
    setTimeout(() => { touch.current.locked = false; }, 450);
  };

  // ── Fullscreen: pinch zoom + double-tap zoom + pan + swipe ────────
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const fsGesture = useRef({
    scale:       1,
    ox:          0,
    oy:          0,
    pinching:    false,
    pinchDist:   0,
    pinchScale:  1,
    panX:        0,
    panY:        0,
    panOX:       0,
    panOY:       0,
    lastTap:     0,
    tapTimer:    undefined as ReturnType<typeof setTimeout> | undefined,
    swipeY:      0,
    swipeX:      0,
    swipeLocked: false,
  });

  useEffect(() => {
    const el = fullscreenRef.current;
    if (!el || !fullscreen) return;

    const g = fsGesture.current;
    const touchDist = (a: Touch, b: Touch) =>
      Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);

    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        g.pinching   = true;
        g.pinchDist  = touchDist(e.touches[0], e.touches[1]);
        g.pinchScale = g.scale;
      } else {
        g.panX  = e.touches[0].clientX;
        g.panY  = e.touches[0].clientY;
        g.panOX = g.ox;
        g.panOY = g.oy;
        g.swipeY = e.touches[0].clientY;
        g.swipeX = e.touches[0].clientX;
      }
    };

    const onMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 2) {
        const d = touchDist(e.touches[0], e.touches[1]);
        const s = Math.min(3, Math.max(1, g.pinchScale * (d / g.pinchDist)));
        g.scale = s;
        if (s <= 1) { g.ox = 0; g.oy = 0; }
        setFsScale(s);
        setFsOffset({ x: g.ox, y: g.oy });
      } else if (e.touches.length === 1 && g.scale > 1) {
        g.ox = g.panOX + (e.touches[0].clientX - g.panX);
        g.oy = g.panOY + (e.touches[0].clientY - g.panY);
        setFsOffset({ x: g.ox, y: g.oy });
      }
    };

    const onEnd = (e: TouchEvent) => {
      if (e.touches.length > 0) return;

      const t = e.changedTouches[0];
      const dx = Math.abs(t.clientX - g.panX);
      const dy = Math.abs(t.clientY - g.panY);
      const isTap = dx < 10 && dy < 10 && !g.pinching;

      // Snap scale to 1 if near bottom of range
      if (g.scale < 1.1) {
        g.scale = 1; g.ox = 0; g.oy = 0;
        setFsScale(1); setFsOffset({ x: 0, y: 0 });
      }

      if (isTap) {
        const now = Date.now();
        if (now - g.lastTap < 300) {
          // Double tap — toggle zoom
          clearTimeout(g.tapTimer);
          g.lastTap = 0;
          if (g.scale > 1) {
            g.scale = 1; g.ox = 0; g.oy = 0;
            setFsScale(1); setFsOffset({ x: 0, y: 0 });
          } else {
            g.scale = 2.5;
            setFsScale(2.5);
          }
        } else {
          g.lastTap = now;
          // Single tap — close after 300 ms (cancelled if double tap)
          g.tapTimer = setTimeout(() => {
            setFullscreen(false);
          }, 300);
        }
      }

      // Swipe to navigate when not zoomed
      if (!isTap && !g.pinching && g.scale <= 1) {
        const swipeDY = g.swipeY - t.clientY;
        const swipeDX = Math.abs(g.swipeX - t.clientX);
        if (Math.abs(swipeDY) >= 40 && swipeDX < Math.abs(swipeDY) && !g.swipeLocked) {
          g.swipeLocked = true;
          // use go via a ref-captured closure-safe approach
          setSlide(([cur]) => {
            const next = swipeDY > 0 ? cur + 1 : cur - 1;
            if (next < 0 || next >= images.length) return [cur, 0];
            return [next, swipeDY > 0 ? 1 : -1];
          });
          setTimeout(() => { g.swipeLocked = false; }, 450);
        }
      }

      g.pinching = false;
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove",  onMove,  { passive: false });
    el.addEventListener("touchend",   onEnd,   { passive: true });

    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove",  onMove);
      el.removeEventListener("touchend",   onEnd);
      clearTimeout(g.tapTimer);
    };
  }, [fullscreen, images.length]);

  // ── Shared vertical dot strip ──────────────────────────────────────
  const vertDots = (bg: string, activeBg: string) =>
    images.length > 1 && (
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); go(i); }}
            aria-label={`View image ${i + 1}`}
            className={`rounded-full transition-all duration-200 ${
              i === active ? `h-4 w-1.5 ${activeBg}` : `h-1.5 w-1.5 ${bg}`
            }`}
          />
        ))}
      </div>
    );

  return (
    <>
      <div className="lg:w-[55%] flex gap-2.5">

        {/* Vertical thumbnail strip — capped to main image height, extra thumbs scroll */}
        <div
          ref={thumbColRef}
          className="flex flex-col gap-1 w-[46px] shrink-0 h-[60vh] overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
        >
          {images.map((thumb, i) => (
            <button
              key={thumb.id}
              ref={(el) => { thumbRefs.current[i] = el; }}
              onClick={() => go(i)}
              className={`relative w-[46px] h-[68px] overflow-hidden transition-all duration-200 shrink-0 ${
                active === i ? "opacity-100" : "opacity-60 hover:opacity-100"
              }`}
            >
              {thumb.url ? (
                <Image src={thumb.url} alt={`${productName} view ${i + 1}`} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0" style={{ background: thumb.bg }} />
              )}
            </button>
          ))}
        </div>

        {/* Main image frame */}
        <div
          ref={mainImgRef}
          className="relative h-[60vh] w-[82vw] overflow-hidden bg-[var(--accent-soft)]/40 cursor-zoom-in"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={() => setFullscreen(true)}
        >
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
                <Image src={img.url} alt={productName} fill className="object-cover" priority={active === 0} draggable={false} />
              ) : (
                <div className="absolute inset-0" style={{ background: img?.bg }} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Dots — vertical left, mobile only */}
          <div className="lg:hidden">
            {vertDots("bg-[var(--black)]/30", "bg-[var(--black)]")}
          </div>
        </div>
      </div>

      {/* Fullscreen lightbox */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            ref={fullscreenRef}
            key="fullscreen"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black overflow-hidden lg:hidden"
          >
            {/* Zoomable + pannable image layer */}
            <div
              className="absolute inset-0"
              style={{
                transform: `scale(${fsScale}) translate(${fsOffset.x / fsScale}px, ${fsOffset.y / fsScale}px)`,
                transition: fsScale === 1 ? "transform 0.25s ease" : "none",
                transformOrigin: "center center",
              }}
            >
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
                    <Image src={img.url} alt={productName} fill className="object-contain" draggable={false} />
                  ) : (
                    <div className="absolute inset-0" style={{ background: img?.bg }} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Close button */}
            <button
              onClick={() => setFullscreen(false)}
              className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-white/15 flex items-center justify-center"
              aria-label="Close fullscreen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Dots — vertical left */}
            {vertDots("bg-white/40", "bg-white")}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
