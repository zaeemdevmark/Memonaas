"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

function parsePrice(str: string): number {
  return parseInt(str.replace(/[^0-9]/g, ""), 10);
}

function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

function apiRemove(apiId: string) {
  fetch(`/api/cart/${apiId}`, { method: "DELETE" }).catch(() => {});
}

function apiUpdateQty(apiId: string, quantity: number) {
  fetch(`/api/cart/${apiId}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ quantity }),
  }).catch(() => {});
}

export default function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQuantity } = useCartStore();

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const subtotal = items.reduce((sum, item) => {
    const price = parsePrice(item.salePrice ?? item.price);
    return sum + price * item.quantity;
  }, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E8E8]">
          <h2 className="text-[13px] tracking-[0.25em] uppercase font-medium text-[var(--black)]">
            Your Cart {items.length > 0 && <span className="text-[var(--muted)]">({items.length})</span>}
          </h2>
          <button
            onClick={closeCart}
            className="text-[var(--muted)] hover:text-[var(--black)] transition-colors"
            aria-label="Close cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-[#CCCCCC]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
            </svg>
            <div>
              <p className="text-[14px] text-[var(--black)] font-medium mb-1">Your cart is empty</p>
              <p className="text-[12px] text-[var(--muted)]">Add something beautiful to get started.</p>
            </div>
            <button
              onClick={closeCart}
              className="text-[11px] tracking-[0.2em] uppercase border border-[var(--black)] text-[var(--black)] px-8 py-3 hover:bg-black hover:text-white transition-colors duration-300"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-24 rounded-[8px] bg-[#EDE8E1] shrink-0 overflow-hidden">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[8px] text-black/10 tracking-widest uppercase select-none">Image</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[13px] font-medium text-[var(--black)] leading-snug">{item.name}</p>
                        <p className="text-[11px] text-[var(--muted)] mt-0.5">Size: {item.size}</p>
                      </div>
                      {/* Remove */}
                      <button
                        onClick={() => { removeItem(item.id); if (item.apiId) apiRemove(item.apiId); }}
                        className="text-[var(--muted)] hover:text-red-500 transition-colors shrink-0 mt-0.5"
                        aria-label="Remove item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Price */}
                      <div className="flex items-center gap-1.5">
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
                      <div className="flex items-center border border-[#E8E8E8]">
                        <button
                          onClick={() => {
                            const next = item.quantity - 1;
                            updateQuantity(item.id, next);
                            if (item.apiId) { next < 1 ? apiRemove(item.apiId) : apiUpdateQty(item.apiId, next); }
                          }}
                          className="w-7 h-7 flex items-center justify-center text-[var(--muted)] hover:text-[var(--black)] transition-colors text-sm"
                        >
                          −
                        </button>
                        <span className="w-7 h-7 flex items-center justify-center text-[12px] text-[var(--black)] border-x border-[#E8E8E8]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            if (item.stock !== undefined && item.quantity >= item.stock) return;
                            const next = item.quantity + 1;
                            updateQuantity(item.id, next);
                            if (item.apiId) apiUpdateQty(item.apiId, next);
                          }}
                          disabled={item.stock !== undefined && item.quantity >= item.stock}
                          className="w-7 h-7 flex items-center justify-center text-[var(--muted)] hover:text-[var(--black)] transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-[#E8E8E8] px-6 py-6 space-y-3">
              <div className="flex justify-between text-[12px] text-[var(--muted)]">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[13px] font-medium text-[var(--black)]">
                <span>Estimated Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <p className="text-[10px] text-[var(--muted)] tracking-wide">
                Shipping & taxes calculated at checkout.
              </p>

              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full py-3.5 text-center text-[11px] tracking-[0.2em] uppercase border border-[var(--black)] text-[var(--black)] hover:bg-[#F5F5F5] transition-colors duration-200"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full py-3.5 text-center text-[11px] tracking-[0.2em] uppercase bg-[var(--black)] text-white hover:bg-[#333] transition-colors duration-200"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
