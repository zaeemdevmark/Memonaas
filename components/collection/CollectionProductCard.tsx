import Image from "next/image";
import Link from "next/link";

interface CollectionProductCardProps {
  slug:        string;
  name:        string;
  price:       string;
  salePrice?:  string;
  image?:      string;
  hoverImage?: string;
  soldOut?:    boolean;
  priority?:   boolean;
}

export default function CollectionProductCard({
  slug,
  name,
  price,
  salePrice,
  image,
  hoverImage,
  soldOut = false,
  priority = false,
}: CollectionProductCardProps) {
  const displayPrice = salePrice ?? price;

  return (
    <div className="group flex flex-col">

      {/* Image container — portrait 3:4, no border-radius (full-bleed collection style) */}
      <Link
        href={`/products/${slug}`}
        className="relative block w-full overflow-hidden bg-[#F0EDE8]"
        style={{ aspectRatio: "3 / 4" }}
      >
        {image ? (
          <>
            {/* Primary image */}
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={`object-cover ${hoverImage ? "transition-opacity duration-[400ms] ease-in-out group-hover:opacity-0" : "transition-transform duration-700 ease-in-out group-hover:scale-105"}`}
              priority={priority}
            />

            {/* Hover image — preloaded in DOM, fades in on hover */}
            {hoverImage && (
              <Image
                src={hoverImage}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover opacity-0 transition-opacity duration-[400ms] ease-in-out group-hover:opacity-100"
                aria-hidden="true"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#C8C0B4] text-[10px] tracking-[0.2em] uppercase select-none">
              Nayab Posh
            </span>
          </div>
        )}

        {/* Sold Out overlay */}
        {soldOut && (
          <>
            <div className="absolute inset-0 bg-white/30" />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <span className="bg-white/90 text-[#111] text-[10px] tracking-[0.25em] uppercase px-3 py-1.5">
                Sold Out
              </span>
            </div>
          </>
        )}
      </Link>

      {/* Product info — name left, price right */}
      <div className="pt-3.5 flex items-start justify-between gap-3">
        <Link
          href={`/products/${slug}`}
          className="flex-1 min-w-0 text-[13px] sm:text-[14px] font-light text-[var(--black)] leading-snug hover:opacity-60 transition-opacity duration-200 line-clamp-2"
        >
          {name}
        </Link>
        <span className="shrink-0 text-[13px] sm:text-[14px] font-light text-[var(--muted)] whitespace-nowrap">
          {displayPrice}
        </span>
      </div>

    </div>
  );
}
