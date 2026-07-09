import Link from "next/link";
import ProductCard from "@/components/ProductCard";

interface Product {
  id?: string;
  image?: string;
  hoverImage?: string;
  name: string;
  price: string;
  salePrice?: string;
  slug: string;
  soldOut?: boolean;
}

export default function NewArrivalsSection({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section id="new-arrivals" className="scroll-mt-[76px] bg-[var(--bg)] py-16 md:py-24">
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="relative flex items-center justify-center mb-12">
          <div className="absolute inset-x-0 top-1/2 h-px bg-[var(--border)]" />
          <h2 className="relative bg-[var(--bg)] px-6 font-display text-3xl md:text-4xl text-[var(--ink)]">
            New Arrivals
          </h2>
          <Link
            href="/shop"
            className="absolute right-0 text-[13px] font-medium text-[var(--accent)] hover:text-[var(--accent-ink)] transition-colors"
          >
            View All &gt;
          </Link>
        </div>
      </div>

      {/* Mobile — horizontal snap-scroll carousel, one card at a time with a peek of the next */}
      <div
        className="min-[640px]:hidden flex snap-x snap-mandatory overflow-x-auto"
        style={{
          gap: "16px",
          paddingLeft: "20px",
          paddingRight: "20px",
          scrollPaddingLeft: "20px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        } as React.CSSProperties}
      >
        {products.slice(0, 4).map((p, i) => (
          <div key={p.slug} className="snap-start shrink-0" style={{ flex: "0 0 82vw", width: "82vw" }}>
            <ProductCard {...p} priority={i === 0} />
          </div>
        ))}
      </div>

      {/* Tablet/desktop — 4-column grid */}
      <div className="hidden min-[640px]:block mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid grid-cols-4 gap-5 md:gap-7">
          {products.slice(0, 4).map((p, i) => (
            <ProductCard key={p.slug} {...p} priority={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
