"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

function parsePrice(str: string): number {
  return parseInt(str.replace(/[^0-9]/g, ""), 10);
}

function formatPrice(n: number): string {
  return `Rs. ${n.toLocaleString("en-PK")}`;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore();

  const subtotal = items.reduce((sum, item) => {
    return sum + parsePrice(item.salePrice ?? item.price) * item.quantity;
  }, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center gap-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
          className="w-14 h-14 text-[var(--border)]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
          />
        </svg>
        <div>
          <h1
            className="text-3xl font-light text-[var(--black)] mb-2"
          >
            Your cart is empty
          </h1>
          <p className="text-[13px] text-[var(--muted)]">
            Looks like you haven&apos;t added anything yet.
          </p>
        </div>
        <Link
          href="/shop"
          className="btn-fill text-[11px] tracking-[0.25em] uppercase border border-[var(--ink)] text-[var(--ink)] px-10 py-3.5"
        >
          <span>Continue Shopping</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-24">

      {/* Page heading */}
      <div className="mb-10 border-b border-[var(--border)] pb-6">
        <h1
          className="text-4xl sm:text-5xl font-light text-[var(--black)]"
        >
          Shopping Cart
        </h1>
        <p className="text-[12px] text-[var(--muted)] mt-2 tracking-wide">
          {items.length} {items.length === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

        {/* ── LEFT: Cart Items ── */}
        <div className="flex-1 min-w-0">

          {/* Column labels */}
          <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 text-[10px] tracking-[0.2em] uppercase text-[var(--muted)] pb-4 border-b border-[var(--border)] mb-2">
            <span>Product</span>
            <span className="text-right">Price</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Total</span>
          </div>

          <div className="divide-y divide-[var(--border)]">
            {items.map((item) => {
              const unitPrice = parsePrice(item.salePrice ?? item.price);
              const lineTotal = unitPrice * item.quantity;

              return (
                <div
                  key={item.id}
                  className="py-7 flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:items-center gap-4 sm:gap-6 group"
                >
                  {/* Product info */}
                  <div className="flex items-start gap-5">
                    {/* Image */}
                    <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-[8px] bg-[var(--accent-soft)]/40 shrink-0 overflow-hidden flex items-end justify-center transition-transform duration-500 group-hover:scale-[1.02]">
                      <span className="text-[7px] text-black/10 tracking-widest uppercase mb-2 select-none">Image</span>
                    </div>

                    {/* Name / size / remove */}
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <Link
                        href={`/products/${item.slug}`}
                        className="text-[14px] font-medium text-[var(--black)] hover:opacity-60 transition-opacity leading-snug line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <p className="text-[11px] text-[var(--muted)] tracking-wide">
                        Size: {item.size}
                      </p>

                      {/* Mobile-only price */}
                      <div className="flex items-center gap-2 sm:hidden mt-1">
                        {item.salePrice ? (
                          <>
                            <span className="text-[13px] text-[var(--black)]">{item.salePrice}</span>
                            <span className="text-[11px] text-[var(--muted)] line-through">{item.price}</span>
                          </>
                        ) : (
                          <span className="text-[13px] text-[var(--black)]">{item.price}</span>
                        )}
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex items-center gap-1 text-[10px] tracking-[0.15em] uppercase text-[var(--muted)] hover:text-red-500 transition-colors duration-200 mt-1 w-fit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Unit price — desktop */}
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    {item.salePrice ? (
                      <>
                        <span className="text-[13px] text-[var(--black)]">{item.salePrice}</span>
                        <span className="text-[11px] text-[var(--muted)] line-through">{item.price}</span>
                      </>
                    ) : (
                      <span className="text-[13px] text-[var(--black)]">{item.price}</span>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="flex sm:justify-center">
                    <div className="flex items-center border border-[var(--border)]">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--bg)] transition-all duration-200 text-sm"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-9 h-9 flex items-center justify-center text-[13px] text-[var(--black)] border-x border-[var(--border)]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          if (item.stock !== undefined && item.quantity >= item.stock) return;
                          updateQuantity(item.id, item.quantity + 1);
                        }}
                        disabled={item.stock !== undefined && item.quantity >= item.stock}
                        className="w-9 h-9 flex items-center justify-center text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--bg)] transition-all duration-200 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Line total — desktop */}
                  <div className="hidden sm:block text-right">
                    <span className="text-[13px] font-medium text-[var(--black)]">
                      {formatPrice(lineTotal)}
                    </span>
                  </div>

                  {/* Mobile: qty + total row */}
                  <div className="flex items-center justify-between sm:hidden">
                    <span className="text-[12px] text-[var(--muted)] tracking-wide">
                      Total
                    </span>
                    <span className="text-[13px] font-medium text-[var(--black)]">
                      {formatPrice(lineTotal)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue shopping */}
          <div className="mt-8">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[var(--muted)] hover:text-[var(--accent)] transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* ── RIGHT: Order Summary ── */}
        <div className="w-full lg:w-[360px] shrink-0">
          <div className="border border-[var(--border)] p-7 sticky top-24">
            <h2
              className="text-2xl font-light text-[var(--black)] mb-7"
            >
              Order Summary
            </h2>

            {/* Line items summary */}
            <div className="space-y-3 mb-6">
              {items.map((item) => {
                const unitPrice = parsePrice(item.salePrice ?? item.price);
                return (
                  <div key={item.id} className="flex justify-between items-start gap-3">
                    <span className="text-[12px] text-[var(--muted)] leading-snug">
                      {item.name}
                      <span className="text-[10px] ml-1 opacity-70">× {item.quantity}</span>
                    </span>
                    <span className="text-[12px] text-[var(--black)] shrink-0">
                      {formatPrice(unitPrice * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[var(--border)] pt-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-[var(--muted)]">Subtotal</span>
                <span className="text-[13px] text-[var(--black)]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-[var(--muted)]">Shipping</span>
                <span className="text-[12px] text-[var(--muted)] italic">Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-[var(--border)] mt-5 pt-5 flex justify-between items-center mb-8">
              <span className="text-[13px] font-medium text-[var(--black)] tracking-wide">
                Estimated Total
              </span>
              <span className="text-[15px] font-medium text-[var(--black)]">
                {formatPrice(subtotal)}
              </span>
            </div>

            <p className="text-[10px] text-[var(--muted)] tracking-wide mb-6">
              Tax and shipping will be calculated at checkout. Free shipping on orders above Rs. 5,000.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href="/shop"
                className="w-full py-3.5 text-center text-[11px] tracking-[0.2em] uppercase border border-[var(--black)] text-[var(--black)] hover:bg-[var(--bg)] transition-colors duration-200"
              >
                Continue Shopping
              </Link>
              <Link
                href="/checkout"
                className="w-full py-3.5 text-center text-[11px] tracking-[0.2em] uppercase bg-[var(--ink)] text-[var(--surface)] hover:bg-[var(--accent-ink)] transition-colors duration-200"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
