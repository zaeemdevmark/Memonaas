"use client";

import { useState } from "react";
import Link from "next/link";
import type { WishlistItemDTO } from "@/lib/types/wishlist";
import { useWishlistStore } from "@/store/wishlistStore";
import { SectionTitle, EmptyState, fp } from "./ui";

interface Props {
  initialItems: WishlistItemDTO[];
}

export default function WishlistManager({ initialItems }: Props) {
  const [items, setItems]     = useState<WishlistItemDTO[]>(initialItems);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { remove: removeFromStore } = useWishlistStore();

  async function handleRemove(productId: string) {
    setRemovingId(productId);
    try {
      const res = await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.productId !== productId));
        removeFromStore(productId);
      }
    } catch {
      // ignore — item stays in the list
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div>
      <SectionTitle>Wishlist</SectionTitle>

      {items.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          body="Save products you love by tapping the heart icon while browsing."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item) => (
            <div key={item.id} className="group flex flex-col">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--accent-soft)]/40 rounded-[10px]">
                <Link href={`/products/${item.product.slug}`} className="block w-full h-full">
                  {item.product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.image.optimizedUrl ?? item.product.image.url}
                      alt={item.product.image.altText ?? item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-black/10 text-[9px] tracking-widest uppercase select-none">Image</span>
                    </div>
                  )}
                </Link>

                {item.product.soldOut && (
                  <span className="absolute top-2.5 left-2.5 text-[9px] tracking-[0.15em] uppercase bg-white/90 text-red-500 font-medium px-2 py-0.5">
                    Sold Out
                  </span>
                )}

                <button
                  onClick={() => handleRemove(item.productId)}
                  disabled={removingId === item.productId}
                  aria-label="Remove from wishlist"
                  className="absolute top-2.5 right-2.5 bg-white/80 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center text-[var(--muted)] hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="pt-2.5 flex items-center justify-between gap-2">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="text-[13px] font-medium text-[var(--black)] hover:opacity-60 transition-opacity leading-snug truncate"
                >
                  {item.product.name}
                </Link>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.product.salePrice ? (
                    <>
                      <span className="text-[12px] text-[var(--muted)] line-through">{fp(item.product.basePrice)}</span>
                      <span className="text-[12px] text-[var(--black)]">{fp(item.product.salePrice)}</span>
                    </>
                  ) : (
                    <span className="text-[12px] text-[var(--black)]">{fp(item.product.basePrice)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
