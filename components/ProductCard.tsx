import Image from "next/image";
import Link from "next/link";
import WishlistButton from "@/components/WishlistButton";

interface ProductCardProps {
  id?: string;
  image?: string;
  hoverImage?: string;
  name: string;
  price: string;
  salePrice?: string;
  slug: string;
  soldOut?: boolean;
  priority?: boolean;
}

function parsePrice(str: string): number {
  return parseInt(str.replace(/[^0-9]/g, ""), 10);
}

export default function ProductCard({ id, image, hoverImage, name, price, salePrice, slug, soldOut = false, priority = false }: ProductCardProps) {
  const discountPercent =
    salePrice
      ? Math.round((1 - parsePrice(salePrice) / parsePrice(price)) * 100)
      : null;

  const verticalStyle: React.CSSProperties = {
    writingMode: "vertical-rl",
    transform: "rotate(180deg)",
  };

  return (
    <div className="group flex flex-col transition-transform duration-300 ease-out hover:-translate-y-1">

      {/* Image */}
      <div
        className="relative aspect-[3/4] max-[639px]:aspect-auto max-[639px]:h-[var(--mobile-product-h)] w-full overflow-hidden bg-white"
      >
        <Link
          href={`/products/${slug}`}
          className="absolute inset-0 block"
        >
        {image ? (
          <>
            {/* Primary image */}
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover ${hoverImage ? "transition-opacity duration-[400ms] ease-in-out group-hover:opacity-0" : "transition-transform duration-500 ease-in-out group-hover:scale-105"}`}
              priority={priority}
            />

            {/* Hover image — zooms in from scale-110 to scale-100 while fading in */}
            {hoverImage && (
              <Image
                src={hoverImage}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover opacity-0 group-hover:opacity-100 scale-100 transition-transform duration-[400ms] ease-in-out group-hover:scale-110"
                aria-hidden="true"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-black/10 text-[9px] tracking-widest uppercase select-none">
              Image
            </span>
          </div>
        )}

        {/* Badge — Sold Out takes priority over Sale */}
        {soldOut ? (
          <span
            className="absolute top-[15px] left-[10px] text-[10px] tracking-[0.2em] uppercase text-red-500 font-medium"
            style={verticalStyle}
          >
            Sold Out
          </span>
        ) : discountPercent ? (
          <span
            className="absolute top-[15px] left-[10px] text-[10px] tracking-[0.2em] uppercase text-[var(--accent-text)] font-medium"
            style={verticalStyle}
          >
            Sale {discountPercent}%
          </span>
        ) : null}
      </Link>

        {/* Gold hover-frame — the museum-frame accent used on every full-bleed
            photo across the homepage, echoed here at card scale. */}
        <div
          aria-hidden="true"
          className="absolute inset-2 border border-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        />

        {/* Wishlist heart — sibling of the Link, not nested inside it */}
        {id && (
          <div className="absolute top-2.5 right-2.5 bg-white/70 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center z-10">
            <WishlistButton productId={id} />
          </div>
        )}
      </div>

      {/* Info — name left, price right */}
      <div className="px-0.5 pt-4 pb-1 flex items-center justify-between gap-3">
        <Link
          href={`/products/${slug}`}
          className="text-[13px] font-medium tracking-[0.02em] text-[var(--black)] hover:text-[var(--accent-text)] transition-colors leading-snug truncate"
        >
          {name}
        </Link>
        <div className="flex items-center gap-1.5 shrink-0">
          {salePrice ? (
            <>
              <span className="text-[14px] text-[var(--sold-out)] line-through">{price}</span>
              <span className="text-[14px] text-[var(--muted)]">{salePrice}</span>
            </>
          ) : (
            <span className="text-[14px] text-[var(--muted)]">{price}</span>
          )}
        </div>
      </div>

    </div>
  );
}
