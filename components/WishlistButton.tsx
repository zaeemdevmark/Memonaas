"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useWishlistStore } from "@/store/wishlistStore";

interface Props {
  productId: string;
  className?: string;
}

export default function WishlistButton({ productId, className = "" }: Props) {
  const { productIds, add, remove } = useWishlistStore();
  const [pending, setPending]       = useState(false);
  const router   = useRouter();
  const pathname = usePathname();

  const inWishlist = productIds.has(productId);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    setPending(true);

    const wasInWishlist = inWishlist;
    // Optimistic update
    if (wasInWishlist) remove(productId);
    else               add(productId);

    try {
      const res = wasInWishlist
        ? await fetch(`/api/wishlist/${productId}`, { method: "DELETE" })
        : await fetch("/api/wishlist", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ productId }),
          });

      if (res.status === 401) {
        // Not logged in as a customer — revert and send to login
        if (wasInWishlist) add(productId);
        else               remove(productId);
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }

      if (!res.ok) {
        // Revert on failure
        if (wasInWishlist) add(productId);
        else               remove(productId);
      }
    } catch {
      if (wasInWishlist) add(productId);
      else               remove(productId);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={inWishlist}
      className={`transition-transform duration-150 active:scale-90 ${inWishlist ? "text-red-500" : "text-[var(--black)]"} ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={inWishlist ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-5 h-5 drop-shadow-sm"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
    </button>
  );
}
