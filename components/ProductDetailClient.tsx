"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import SizeGuideButton from "@/components/SizeGuideButton";
import SizeGuideModal  from "@/components/SizeGuideModal";
import WishlistButton  from "@/components/WishlistButton";
import { useCartStore } from "@/store/cartStore";

// framer-motion lives inside ProductImageSlider — split it into its own chunk
// so the main product-detail bundle stays lean.
const ProductImageSlider = dynamic(
  () => import("@/components/ProductImageSlider"),
  {
    ssr:     true,
    loading: () => (
      <div className="flex gap-3 w-full">
        <div className="w-16 shrink-0" />
        <div className="flex-1 aspect-[3/4] rounded-[10px] bg-[#EDE8E1] animate-pulse" />
      </div>
    ),
  },
);

// Desktop main image — separate framer-motion chunk for the 3-col grid
const ProductImageMain = dynamic(
  () => import("@/components/ProductImageMain"),
  {
    ssr:     true,
    loading: () => (
      <div className="aspect-[563/844] rounded-[12px] bg-[#EDE8E1] animate-pulse" />
    ),
  },
);


interface ProductImage {
  id: string;
  url?: string;
  bg?: string;
}

interface AccordionItem {
  title:   string;
  content: string;
  isHtml?: boolean;
}

interface RelatedProduct {
  id?:         string;
  slug:        string;
  name:        string;
  price:       string;
  salePrice?:  string;
  soldOut?:    boolean;
  image?:      string;
  hoverImage?: string;
}

interface SizeGuideImage {
  url:          string;
  optimizedUrl: string;
}

interface Variant {
  id:    string;
  size:  string;
  stock: number;
}

interface Product {
  id?:  string;
  slug: string;
  name: string;
  sku: string;
  price: string;
  salePrice?: string;
  soldOut: boolean;
  sizes: string[];
  variants: Variant[];
  description:  string;
  tab1Title?:   string | null;
  tab1Content?: string | null;
  images: ProductImage[];
  accordion: AccordionItem[];
  related: RelatedProduct[];
  sizeGuideImage1?: SizeGuideImage | null;
  sizeGuideImage2?: SizeGuideImage | null;
}

function parsePrice(str: string): number {
  return parseInt(str.replace(/[^0-9]/g, ""), 10);
}

function AccordionRow({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-[#E8E8E8]">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-[13px] tracking-[0.15em] uppercase text-[var(--black)] font-medium">
          {title}
        </span>
        <span className={`text-[var(--muted)] transition-transform duration-300 ${open ? "rotate-45" : ""}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-400 ease-in-out ${open ? "max-h-[500px] pb-5" : "max-h-0"}`}>
        {children}
      </div>
    </div>
  );
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(() =>
    product.sizes.includes("S") ? "S" : (product.sizes[0] ?? null)
  );
  const [quantity,      setQuantity]      = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeError,     setSizeError]     = useState(false);
  const [stockWarning,  setStockWarning]  = useState(false);
  const [adding,        setAdding]        = useState(false);

  const selectedVariant = product.variants.find((v) => v.size === selectedSize) ?? null;
  const availableStock  = selectedVariant?.stock ?? 0;
  const [openAccordion, setOpenAccordion] = useState(0);
  const toggleAccordion = (i: number) => setOpenAccordion((cur) => (cur === i ? -1 : i));

  // Desktop image state — mobile uses ProductImageSlider's own internal state
  const [[activeImg, imgDir], setImg] = useState<[number, number]>([0, 0]);
  const goImg = (next: number, dir?: number) => {
    if (next < 0 || next >= product.images.length) return;
    setImg((prev) => {
      const [cur] = prev;
      if (next === cur) return prev;
      return [next, dir ?? (next > cur ? 1 : -1)];
    });
  };

  // Refs for wheel-based gallery navigation (desktop only)
  const activeImgRef  = useRef(0);
  useEffect(() => { activeImgRef.current = activeImg; }, [activeImg]); // keep the wheel closure's ref fresh

  const thumbColRef   = useRef<HTMLDivElement>(null);
  const mainImgRef    = useRef<HTMLDivElement>(null);
  const thumbRefs     = useRef<(HTMLButtonElement | null)[]>([]);

  // Keep the thumbnail strip following the active image, however it was selected.
  // Scroll the strip's own container directly (never scrollIntoView: when the
  // strip has no overflow of its own, the browser walks up and scrolls the
  // whole page instead).
  useEffect(() => {
    const col = thumbColRef.current;
    const btn = thumbRefs.current[activeImg];
    if (!col || !btn) return;
    const target = btn.offsetTop - (col.clientHeight - btn.clientHeight) / 2;
    const max    = col.scrollHeight - col.clientHeight;
    col.scrollTo({ top: Math.max(0, Math.min(target, max)), behavior: "smooth" });
  }, [activeImg]);

  useEffect(() => {
    let accumulator = 0;   // running total of deltaY within a gesture
    let cooldown    = false;
    const THRESHOLD   = 100; // pixel delta required to fire one navigation
    const COOLDOWN_MS = 700; // silence window after each image change
    const MIN_DELTA   = 10;  // skip sub-threshold trackpad micro-events entirely
    const total = product.images.length;

    const onWheel = (e: WheelEvent) => {
      if (window.innerWidth < 1024) return; // desktop only

      // Always block page scroll when hovering the gallery
      e.preventDefault();

      const cur       = activeImgRef.current;
      const goingDown = e.deltaY > 0;

      // At the first image, scrolling further up does nothing.
      // At the last image, scrolling down wraps back to the first (no stop).
      if (!goingDown && cur === 0) { accumulator = 0; return; }

      // Ignore trackpad micro-movements (noise below 10px delta)
      if (Math.abs(e.deltaY) < MIN_DELTA) return;

      // Cooldown active → consume silently, accumulator stays zeroed
      if (cooldown) return;

      // Build up delta until one full gesture is detected
      accumulator += e.deltaY;

      if (accumulator >= THRESHOLD) {
        accumulator = 0;
        cooldown    = true;
        const next = cur === total - 1 ? 0 : cur + 1; // wrap forward at the end
        goImg(next, 1);
        setTimeout(() => { cooldown = false; }, COOLDOWN_MS);
      } else if (accumulator <= -THRESHOLD) {
        accumulator = 0;
        cooldown    = true;
        goImg(cur - 1);
        setTimeout(() => { cooldown = false; }, COOLDOWN_MS);
      }
    };

    const thumbEl = thumbColRef.current;
    const mainEl  = mainImgRef.current;

    thumbEl?.addEventListener("wheel", onWheel, { passive: false });
    mainEl?.addEventListener("wheel",  onWheel, { passive: false });

    return () => {
      thumbEl?.removeEventListener("wheel", onWheel);
      mainEl?.removeEventListener("wheel",  onWheel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — uses refs for fresh state, goImg is stable

  const { addItem, openCart } = useCartStore();

  async function handleAddToCart() {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    const variant = product.variants.find((v) => v.size === selectedSize);
    if (!variant) { setSizeError(true); return; }

    if (quantity > availableStock) {
      setStockWarning(true);
      return;
    }

    setAdding(true);
    try {
      const res  = await fetch("/api/cart", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ variantId: variant.id, quantity }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        const apiItem = (json.data?.items ?? []).find(
          (i: { variant: { id: string; stock: number }; id: string }) => i.variant.id === variant.id,
        );
        addItem({
          slug:      product.slug,
          name:      product.name,
          price:     product.price,
          salePrice: product.salePrice,
          size:      selectedSize,
          quantity,
          image:     product.images[0]?.url,
          apiId:     apiItem?.id,
          stock:     (apiItem?.variant?.stock as number | undefined) ?? availableStock,
        });
        openCart();
      }
    } catch {
      // network error — silently ignore
    } finally {
      setAdding(false);
    }
  }

  const sizeGuideImages = [product.sizeGuideImage1, product.sizeGuideImage2].filter(
    (img): img is SizeGuideImage => img != null,
  );

  const discountPercent = product.salePrice
    ? Math.round((1 - parsePrice(product.salePrice) / parsePrice(product.price)) * 100)
    : null;

  // Product info content — shared between mobile (flex col) and desktop (sticky col 3)
  const productInfoContent = (
    <>
      {/* Title */}
      <h1 className="text-[26px] sm:text-4xl font-semibold text-[var(--black)] leading-snug mb-2">
        {product.name}
      </h1>

      {/* SKU */}
      <p className="text-[11px] text-[var(--muted)] tracking-[0.15em] uppercase mb-2 lg:mb-5">
        SKU: {product.sku}
      </p>

      {/* Price */}
      <div className="flex items-center gap-3 mb-3">
        {product.salePrice ? (
          <>
            <span className="text-xl text-[var(--black)] font-medium">{product.salePrice}</span>
            <span className="text-lg text-[var(--muted)] line-through">{product.price}</span>
            {discountPercent && (
              <span className="text-[11px] tracking-[0.1em] uppercase text-white bg-black px-2 py-0.5">
                -{discountPercent}%
              </span>
            )}
          </>
        ) : (
          <span className="text-xl text-[var(--black)] font-medium">{product.price}</span>
        )}
      </div>

      {/* Availability */}
      <p className={`text-[12px] tracking-[0.15em] uppercase mb-6 ${product.soldOut ? "text-red-500" : "text-green-600"}`}>
        {product.soldOut ? "Sold Out" : "In Stock"}
      </p>

      {/* Size selection — hidden entirely when sold out */}
      {!product.soldOut && (
        <div className="mb-6">
          <p className="text-[11px] tracking-[0.15em] uppercase text-[var(--muted)] mb-3">
            Size {selectedSize && <span className="text-[var(--black)]">— {selectedSize}</span>}
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {product.sizes.map((size) => {
              const sizeStock = product.variants.find((v) => v.size === size)?.stock ?? 0;
              const unavailable = sizeStock === 0;
              return (
                <button
                  key={size}
                  disabled={unavailable}
                  onClick={() => {
                    if (unavailable) return;
                    setSelectedSize(size);
                    setSizeError(false);
                    setStockWarning(false);
                    setQuantity((q) => Math.min(q, sizeStock));
                  }}
                  className={`group relative w-8 h-8 flex items-center justify-center border text-[10px] tracking-[0.1em] uppercase font-medium transition-colors duration-200 ${
                    unavailable
                      ? "border-[#D8D8D8] text-[#BBBBBB] cursor-not-allowed"
                      : selectedSize === size
                      ? "bg-[var(--black)] border-[var(--black)] text-white"
                      : "bg-white border-[var(--black)] text-[var(--black)]"
                  }`}
                >
                  <span className={unavailable ? "line-through" : ""}>{size}</span>
                  {!unavailable && selectedSize !== size && (
                    <span className="absolute -bottom-[3px] left-0 right-0 h-[1px] bg-[var(--black)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out origin-left" />
                  )}
                </button>
              );
            })}
          </div>
          {stockWarning && (
            <p className="text-[11px] text-red-500 mt-1 mb-1">
              Stock is low for this size. Please reduce your quantity.
            </p>
          )}
          {sizeError && (
            <p className="text-[11px] text-red-500 mt-1 mb-1">Please select a size</p>
          )}
          {sizeGuideImages.length > 0 && (
            <SizeGuideButton onClick={() => setSizeGuideOpen(true)} />
          )}
        </div>
      )}

      {/* Quantity + Add to Cart — inline row; or Out of Stock block */}
      {product.soldOut ? (
        <div className="flex items-stretch gap-3 mb-6">
          <div className="flex-1 py-4 text-center text-[12px] tracking-[0.25em] uppercase font-medium border border-[#E8E8E8] text-[var(--muted)] cursor-not-allowed">
            Out of Stock
          </div>
          {product.id && (
            <div className="w-[52px] flex items-center justify-center self-stretch shrink-0">
              <WishlistButton productId={product.id} />
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-stretch gap-3 mb-6">

          {/* Quantity stepper */}
          <div className="flex items-center border border-[#E8E8E8] shrink-0">
            <button
              onClick={() => { setQuantity((q) => Math.max(1, q - 1)); setStockWarning(false); }}
              className="w-10 h-full flex items-center justify-center text-[var(--black)] hover:bg-[#F5F5F5] transition-colors text-lg"
            >
              −
            </button>
            <span className="w-10 flex items-center justify-center text-[13px] text-[var(--black)] border-x border-[#E8E8E8] self-stretch">
              {quantity}
            </span>
            <button
              onClick={() => {
                if (availableStock > 0 && quantity >= availableStock) {
                  setStockWarning(true);
                  return;
                }
                setQuantity((q) => q + 1);
              }}
              className="w-10 h-full flex items-center justify-center text-[var(--black)] hover:bg-[#F5F5F5] transition-colors text-lg"
            >
              +
            </button>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className={`flex-1 py-4 text-[12px] tracking-[0.25em] uppercase font-medium
                       bg-white border border-[var(--black)] text-[var(--black)]
                       active:scale-[0.98] transition-transform duration-150
                       disabled:opacity-60 disabled:cursor-not-allowed
                       ${!adding ? "btn-fill" : ""}`}
          >
            <span>{adding ? "Adding…" : "Add To Cart"}</span>
          </button>

          {/* Wishlist */}
          {product.id && (
            <div className="w-[52px] flex items-center justify-center self-stretch shrink-0">
              <WishlistButton productId={product.id} />
            </div>
          )}

        </div>
      )}

      {/* Short description */}
      <div
        className="prose-product text-[13px] text-[#3D3D3D] leading-relaxed border-t border-[#E8E8E8] pt-6"
        dangerouslySetInnerHTML={{ __html: product.description ?? "" }}
      />

      {/* Accordion */}
      <div className="mt-6">
        {(() => {
          const hasCustomTab = !!(product.tab1Title && product.tab1Content);
          const careIdx     = hasCustomTab ? 1 : 0;
          const deliveryIdx = hasCustomTab ? 2 : 1;
          return (
            <>
              {hasCustomTab && (
                <AccordionRow title={product.tab1Title!} open={openAccordion === 0} onToggle={() => toggleAccordion(0)}>
                  <div
                    className="prose-product text-[13px] text-[#3D3D3D] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: product.tab1Content! }}
                  />
                </AccordionRow>
              )}

              <AccordionRow title="Care Instructions" open={openAccordion === careIdx} onToggle={() => toggleAccordion(careIdx)}>
                <ul className="space-y-2 text-[13px] text-[#3D3D3D] leading-relaxed">
                  {[
                    "Dry clean recommended.",
                    "Iron at a moderate temperature.",
                    "Avoid exposing damp fabric to strong sunlight.",
                    "Do not use bleach or harsh stain removers.",
                  ].map((line) => (
                    <li key={line} className="flex gap-2">
                      <span aria-hidden="true">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </AccordionRow>

              <AccordionRow title="Delivery" open={openAccordion === deliveryIdx} onToggle={() => toggleAccordion(deliveryIdx)}>
                <div className="space-y-3 text-[13px] text-[#3D3D3D] leading-relaxed">
                  <div>
                    <span className="font-medium text-[var(--black)]">Pakistan:</span><br />
                    Delivery within 5 business days.
                  </div>
                  <div>
                    <span className="font-medium text-[var(--black)]">Shipping Charges:</span><br />
                    Free shipping within Pakistan.
                  </div>
                  <div>
                    <span className="font-medium text-[var(--black)]">Order Processing:</span><br />
                    Orders are dispatched within 24–48 hours, and tracking information is provided after dispatch.
                  </div>
                  <div>
                    <span className="font-medium text-[var(--black)]">For Assistance:</span><br />
                    Contact us at{" "}
                    <a
                      href="mailto:wecare@nayabposh.com"
                      className="underline hover:text-[var(--black)] transition-colors"
                    >
                      wecare@nayabposh.com
                    </a>
                  </div>
                </div>
              </AccordionRow>

              <div className="border-t border-[#E8E8E8]" />
            </>
          );
        })()}
      </div>
    </>
  );

  return (
    <>
    <div className="max-w-7xl mx-auto px-[30px] sm:px-6">

      {/* ── MOBILE layout — below lg ─────────────────────────────────────── */}
      <div className="lg:hidden flex flex-col gap-4 pb-2">
        <ProductImageSlider images={product.images} productName={product.name} />
        <div className="flex flex-col">
          {productInfoContent}
        </div>
      </div>

      {/* ── DESKTOP layout — lg and above: 3-column grid ────────────────── */}
      <div
        className="hidden lg:grid pb-20"
        style={{ gridTemplateColumns: "126px 563px 1fr", gap: "24px" }}
      >
        {/* Col 1: Vertical thumbnail strip — fixed height matches main image, scrollable */}
        <div
          ref={thumbColRef}
          className="flex flex-col gap-2.5 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden"
          style={{
            height: "844px",
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          } as React.CSSProperties}
        >
          {product.images.map((thumb, i) => (
            <button
              key={thumb.id}
              ref={(el) => { thumbRefs.current[i] = el; }}
              onClick={() => goImg(i)}
              className={`relative w-[126px] h-[190px] shrink-0 overflow-hidden transition-all duration-200 ${
                activeImg === i ? "opacity-100" : "opacity-50 hover:opacity-80"
              }`}
            >
              {thumb.url ? (
                <Image
                  src={thumb.url}
                  alt={`${product.name} view ${i + 1}`}
                  fill
                  sizes="126px"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0" style={{ background: thumb.bg }} />
              )}
            </button>
          ))}
        </div>

        {/* Col 2: Main animated image */}
        <div ref={mainImgRef}>
        <ProductImageMain
          images={product.images}
          productName={product.name}
          active={activeImg}
          direction={imgDir}
        />
        </div>

        {/* Col 3: Product info — sticky so it stays visible while scrolling images */}
        <div className="sticky top-[90px] self-start flex flex-col">
          {productInfoContent}
        </div>
      </div>

    </div>

      {/* You May Also Like — full width */}
      <div className="px-[30px] pb-[30px] pt-4 lg:pt-[30px]">
        <h2 className="text-[23px] font-medium text-[var(--black)] mb-[20px]">
          You May Also Like
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[30px]">
          {product.related.map((p) => (
            <ProductCard key={p.slug} {...p} />
          ))}
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 px-[30px] py-6 mt-6 border-t border-[#E8E8E8] text-[11px] text-[var(--muted)] tracking-wide">
        <Link href="/" className="hover:text-[var(--black)] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-[var(--black)] transition-colors">Shop All</Link>
        <span>/</span>
        <span className="text-[var(--black)]">{product.name}</span>
      </nav>

      {sizeGuideOpen && sizeGuideImages.length > 0 && (
        <SizeGuideModal images={sizeGuideImages} onClose={() => setSizeGuideOpen(false)} />
      )}
    </>
  );
}
