"use client";

import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants/shipping";

function formatPrice(n: number): string {
  return `Rs. ${Math.round(n).toLocaleString("en-PK")}`;
}

export default function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const percent   = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const unlocked  = remaining === 0;

  return (
    <div className="py-1">
      <p className={`text-[11px] tracking-wide mb-2 transition-colors duration-300 ${unlocked ? "text-[var(--sage)] font-medium" : "text-[var(--muted)]"}`}>
        {unlocked ? (
          <>
            <span aria-hidden="true">&#10003;</span>{" "}
            Congratulations! You&apos;ve unlocked <span className="font-medium">FREE Shipping</span>.
          </>
        ) : (
          <>
            You&apos;re only <span className="text-[var(--black)] font-medium">{formatPrice(remaining)}</span> away from{" "}
            <span className="font-medium">FREE Shipping</span>.
          </>
        )}
      </p>
      <div className="h-1.5 w-full rounded-full bg-[var(--border)] overflow-hidden">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${unlocked ? "bg-[var(--sage)]" : "bg-[var(--accent)]"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
