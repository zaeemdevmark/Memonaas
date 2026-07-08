"use client";

import { useRef, useLayoutEffect, useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

interface Product {
  id?:         string;
  image?:      string;
  hoverImage?: string;
  name:        string;
  price:       string;
  salePrice?:  string;
  slug:        string;
  soldOut?:    boolean;
}

interface CollectionSectionProps {
  title:          string;
  description?:   string;
  slug:           string;
  products:       Product[];
  className?:     string;
  priorityFirst?: boolean;
}

const GAP = 26; // matches original gap-[26px]
const SNAP_EASE   = 0.14; // easing factor per frame (~350 ms to reach target)
const VEL_THRESH  = 0.3;  // px/ms — above this, snap one card in swipe direction
const WHEEL_DELAY = 150;  // ms idle after last wheel event before snapping

export default function CollectionSection({
  title,
  description,
  slug,
  products,
  className = "",
  priorityFirst = false,
}: CollectionSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef     = useRef<HTMLDivElement>(null);

  // Mobile scroll-progress indicator (thin line below the carousel)
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0); // 0–1
  const [thumbPercent,   setThumbPercent]   = useState(100); // visible fraction, %

  // All mutable scroll state lives in a single ref — zero re-renders during interaction
  const s = useRef({
    offset:     0,
    thirdW:     0,   // track.scrollWidth / 3  (3-copy loop)
    cardW:      0,   // single card pixel width
    drag:       false,
    dragX:      0,
    startX:     0,
    startY:     0,
    touchDir:   null as "h" | "v" | null,
    velX:       0,       // px/ms  +  → moving left (offset growing)
    lastMoveT:  0,       // timestamp of last pointermove for velocity
    rafId:      0,       // snap animation frame id
    wheelTimer: 0,       // debounce timer id for trackpad wheel
  });

  // 3 copies so the snap animation has buffer room at both loop boundaries
  const items = [...products, ...products, ...products];

  // ── Measure card widths and set initial offset ────────────────────────────
  useLayoutEffect(() => {
    const container = containerRef.current;
    const track     = trackRef.current;
    if (!container || !track) return;

    const measure = () => {
      const w = container.offsetWidth;
      if (w === 0) return; // element is display:none on mobile — skip
      // Tablet/desktop only: 3-column grid
      const cardW = (w - GAP * 2) / 3;
      s.current.cardW = cardW;
      container.style.setProperty("--card-w", `${cardW}px`);

      // Reading scrollWidth after setProperty forces a synchronous reflow
      const thirdW    = track.scrollWidth / 3;
      const prevThird = s.current.thirdW;

      if (prevThird > 0 && thirdW > 0) {
        // Preserve relative position within the middle copy across resizes
        s.current.offset = thirdW + (s.current.offset - prevThird);
      } else {
        // First mount: start in the middle copy so loops work in both directions
        s.current.offset = thirdW;
      }
      s.current.thirdW = thirdW;
      track.style.transform = `translate3d(${-s.current.offset}px,0,0)`;
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // ── Mobile carousel scroll-progress indicator ─────────────────────────────
  useEffect(() => {
    const el = mobileScrollRef.current;
    if (!el) return;

    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setThumbPercent(el.scrollWidth > 0 ? (el.clientWidth / el.scrollWidth) * 100 : 100);
      setScrollProgress(max > 0 ? el.scrollLeft / max : 0);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [products.length]);

  // ── Scroll-progress bar — draggable, seeks the mobile carousel ────────────
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const progressDrag = useRef(false);

  function seekToClientX(clientX: number) {
    const track = progressTrackRef.current;
    const el    = mobileScrollRef.current;
    if (!track || !el) return;
    const rect  = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    el.scrollLeft = ratio * (el.scrollWidth - el.clientWidth);
  }

  function snapToNearestCard() {
    const el = mobileScrollRef.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    if (children.length === 0) return;
    let nearest = children[0];
    let nearestDist = Infinity;
    for (const child of children) {
      const dist = Math.abs((child.offsetLeft - 24) - el.scrollLeft);
      if (dist < nearestDist) { nearestDist = dist; nearest = child; }
    }
    el.scrollTo({ left: nearest.offsetLeft - 24, behavior: "smooth" });
  }

  function handleProgressPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    progressDrag.current = true;
    seekToClientX(e.clientX);
  }
  function handleProgressPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!progressDrag.current) return;
    seekToClientX(e.clientX);
  }
  function handleProgressPointerUp() {
    if (!progressDrag.current) return;
    progressDrag.current = false;
    snapToNearestCard();
  }

  // ── Interaction handlers ──────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const apply = () => {
      if (trackRef.current)
        trackRef.current.style.transform =
          `translate3d(${-s.current.offset}px,0,0)`;
    };

    // Re-center within the middle copy so both loop directions always have buffer.
    // Safe to call while the track content at neighbouring copies is identical.
    const recenter = () => {
      const tw = s.current.thirdW;
      if (tw <= 0) return;
      if (s.current.offset >= 2 * tw) s.current.offset -= tw;
      else if (s.current.offset <  tw) s.current.offset += tw;
    };

    // Ease to the nearest clean card boundary, honouring swipe velocity.
    const snapNearest = () => {
      const step = s.current.cardW + GAP;
      if (step <= 0) return;

      const vel = s.current.velX;
      let idx: number;

      if (Math.abs(vel) > VEL_THRESH) {
        // Fast swipe: jump one full card in the swipe direction
        idx = vel > 0
          ? Math.floor(s.current.offset / step) + 1   // swipe left  → next card
          : Math.ceil(s.current.offset  / step) - 1;  // swipe right → prev card
      } else {
        idx = Math.round(s.current.offset / step);
      }

      const target      = idx * step;
      s.current.velX    = 0;

      const animate = () => {
        const dist = target - s.current.offset;
        if (Math.abs(dist) < 0.3) {
          s.current.offset = target;
          recenter();   // bring back into middle-copy range after animation
          apply();
          return;
        }
        s.current.offset += dist * SNAP_EASE;
        apply();
        s.current.rafId = requestAnimationFrame(animate);
      };

      cancelAnimationFrame(s.current.rafId);
      s.current.rafId = requestAnimationFrame(animate);
    };

    // ── Trackpad horizontal swipe ─────────────────────────────────────────
    // Only intercept when deltaX dominates — vertical page scroll untouched.
    // Debounce: snap after WHEEL_DELAY ms of inactivity.
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        cancelAnimationFrame(s.current.rafId);
        clearTimeout(s.current.wheelTimer);
        s.current.offset += e.deltaX;
        recenter(); apply();
        s.current.velX      = 0; // use position-based snap for trackpad
        s.current.wheelTimer =
          window.setTimeout(snapNearest, WHEEL_DELAY);
      }
      // deltaY dominant → no preventDefault → page scrolls normally
    };

    // ── Touch (mobile finger swipe) ───────────────────────────────────────
    const onTouchStart = (e: TouchEvent) => {
      cancelAnimationFrame(s.current.rafId);
      clearTimeout(s.current.wheelTimer);
      s.current.drag      = true;
      s.current.startX    = e.touches[0].clientX;
      s.current.startY    = e.touches[0].clientY;
      s.current.dragX     = e.touches[0].clientX;
      s.current.touchDir  = null;
      s.current.velX      = 0;
      s.current.lastMoveT = performance.now();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!s.current.drag) return;
      const t = e.touches[0];

      // Lock in scroll direction on the first significant movement
      if (!s.current.touchDir) {
        const absX = Math.abs(t.clientX - s.current.startX);
        const absY = Math.abs(t.clientY - s.current.startY);
        if (absX < 5 && absY < 5) return;
        s.current.touchDir = absX >= absY ? "h" : "v";
      }

      if (s.current.touchDir === "h") {
        e.preventDefault(); // block page-scroll only for horizontal swipes
        const now = performance.now();
        const dt  = now - s.current.lastMoveT;
        if (dt > 0 && dt < 100)
          s.current.velX = (s.current.dragX - t.clientX) / dt;
        s.current.lastMoveT = now;
        s.current.offset   += s.current.dragX - t.clientX;
        s.current.dragX     = t.clientX;
        recenter(); apply();
      }
      // "v" direction: fall through so the page scrolls normally
    };

    const onTouchEnd = () => {
      if (s.current.touchDir === "h") snapNearest();
      s.current.drag     = false;
      s.current.touchDir = null;
    };

    // ── Click & drag (desktop) ────────────────────────────────────────────
    const onMouseDown = (e: MouseEvent) => {
      cancelAnimationFrame(s.current.rafId);
      clearTimeout(s.current.wheelTimer);
      s.current.drag      = true;
      s.current.dragX     = e.clientX;
      s.current.velX      = 0;
      s.current.lastMoveT = performance.now();
      el.style.cursor     = "grabbing";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!s.current.drag) return;
      const now = performance.now();
      const dt  = now - s.current.lastMoveT;
      if (dt > 0 && dt < 100)
        s.current.velX = (s.current.dragX - e.clientX) / dt;
      s.current.lastMoveT = now;
      s.current.offset   += s.current.dragX - e.clientX;
      s.current.dragX     = e.clientX;
      recenter(); apply();
    };

    const onMouseUp = () => {
      if (s.current.drag) snapNearest();
      s.current.drag  = false;
      el.style.cursor = "";
    };

    el.addEventListener("wheel",      onWheel,      { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true  });
    el.addEventListener("touchmove",  onTouchMove,  { passive: false });
    el.addEventListener("touchend",   onTouchEnd);
    el.addEventListener("mousedown",  onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup",   onMouseUp);

    return () => {
      cancelAnimationFrame(s.current.rafId);
      clearTimeout(s.current.wheelTimer);
      el.removeEventListener("wheel",      onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove",  onTouchMove);
      el.removeEventListener("touchend",   onTouchEnd);
      el.removeEventListener("mousedown",  onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup",   onMouseUp);
    };
  }, []);

  if (!products.length) return null;

  return (
    <section className={`bg-[var(--surface)] mt-[10px] ${className}`}>
      <div className="flex flex-col lg:flex-row">

        {/* ── Left — text column ── */}
        <div className="lg:w-[25%] px-6 pt-10 pb-4 lg:pb-10 flex flex-col justify-center shrink-0">
          <h2 className="font-display text-2xl text-[var(--ink)] leading-snug mb-3">
            {title}
          </h2>
          {description && (
            <p className="text-[14px] text-[var(--muted)] leading-snug mb-6">
              {description}
            </p>
          )}
          <Link
            href={`/collections/${slug}`}
            className="btn-fill self-start text-[10px] tracking-[0.18em] uppercase border border-[var(--ink)] text-[var(--ink)] px-5 py-2 rounded-full"
          >
            <span>View All Collection</span>
          </Link>
        </div>

        {/* ── Mobile CSS scroll-snap carousel — phones only (<640 px) ── */}
        <div className="min-[640px]:hidden pt-2 pb-5">
          <div
            ref={mobileScrollRef}
            className="flex snap-x snap-mandatory overflow-x-auto"
            style={{
              gap: "24px",
              paddingLeft: "24px",
              paddingRight: "16px",
              scrollPaddingLeft: "24px",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            } as React.CSSProperties}
          >
            {products.map((p, i) => (
              <div
                key={p.slug}
                className="snap-start shrink-0"
                style={{ flex: "0 0 82vw", width: "82vw" }}
              >
                <ProductCard {...p} priority={priorityFirst && i === 0} />
              </div>
            ))}
          </div>

          {/* Scroll-progress line — draggable to seek the carousel */}
          {thumbPercent < 100 && (
            <div className="px-6 mt-3">
              <div
                ref={progressTrackRef}
                onPointerDown={handleProgressPointerDown}
                onPointerMove={handleProgressPointerMove}
                onPointerUp={handleProgressPointerUp}
                onPointerCancel={handleProgressPointerUp}
                className="relative h-[14px] w-full flex items-center cursor-pointer touch-none"
              >
                <div className="relative h-px w-full bg-[#E5E5E5] rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 h-full bg-[var(--black)] rounded-full"
                    style={{
                      width: `${thumbPercent}%`,
                      left:  `${scrollProgress * (100 - thumbPercent)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Desktop/tablet JS carousel — unchanged, shown ≥ 640 px ── */}
        <div className="hidden min-[640px]:block lg:w-[75%] p-5 pl-[12px] pr-[24px]">
          <div
            ref={containerRef}
            className="overflow-hidden cursor-grab select-none"
          >
            <div
              ref={trackRef}
              className="flex will-change-transform"
              style={{ width: "max-content", gap: `${GAP}px` }}
            >
              {items.map((p, i) => (
                <div
                  key={`${p.slug}-${i}`}
                  className="shrink-0"
                  style={{ width: "var(--card-w)" }}
                >
                  <ProductCard
                    {...p}
                    priority={priorityFirst && i === 0}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
