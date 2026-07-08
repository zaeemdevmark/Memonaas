"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ── Mock order data ───────────────────────────────────────────────

const ORDER = {
  id:                "NP-2026201847",
  date:              "June 20, 2026",
  estimatedDelivery: "June 26 – July 2, 2026",
  items: [
    { name: "Pearl Treasure", size: "M", qty: 1, price: "Rs. 19,700" },
    { name: "Scarlet",        size: "S", qty: 2, price: "Rs. 13,400", originalPrice: "Rs. 19,100" },
  ],
  itemCount: 3,
  subtotal:  46500,
  shipping:  0,
  total:     46500,
};

function formatPrice(n: number) {
  return `Rs. ${n.toLocaleString("en-PK")}`;
}

// ── Loading state ─────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-8 px-4">
      {/* Pulsing ring */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border border-[#E8E8E8] animate-ping opacity-30" />
        <div className="absolute inset-2 rounded-full border border-[#D0D0D0] animate-ping opacity-20" style={{ animationDelay: "300ms" }} />
        <div className="w-20 h-20 rounded-full border border-[#E0E0E0] flex items-center justify-center">
          <svg className="animate-spin w-6 h-6 text-[var(--muted)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-[11px] tracking-[0.3em] uppercase text-[var(--muted)] animate-pulse">
          Confirming your order
        </p>
        <p className="text-[12px] text-[#C0C0C0]">Please wait a moment…</p>
      </div>
    </div>
  );
}

// ── Animated check icon ───────────────────────────────────────────

function CheckIcon({ visible }: { visible: boolean }) {
  return (
    <div
      className={`relative w-24 h-24 mx-auto mb-8 transition-all duration-700 ease-out ${
        visible ? "scale-100 opacity-100" : "scale-50 opacity-0"
      }`}
    >
      {/* Outer ring */}
      <div
        className={`absolute inset-0 rounded-full border border-[#E8E8E8] transition-all duration-1000 ${
          visible ? "scale-110 opacity-0" : "scale-100 opacity-100"
        }`}
        style={{ transitionDelay: "400ms" }}
      />
      {/* Circle */}
      <div className="w-24 h-24 rounded-full bg-[var(--black)] flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="white"
          className={`w-10 h-10 transition-all duration-500 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
          style={{ transitionDelay: "200ms" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
    </div>
  );
}

// ── Info card ─────────────────────────────────────────────────────

function InfoCard({
  icon,
  title,
  body,
  delay,
  visible,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  delay: number;
  visible: boolean;
}) {
  return (
    <div
      className={`border border-[#E8E8E8] p-6 transition-all duration-500 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="text-[var(--muted)] mb-4">{icon}</div>
      <h3 className="text-[11px] tracking-[0.2em] uppercase text-[var(--black)] font-medium mb-2">{title}</h3>
      <p className="text-[12px] text-[var(--muted)] leading-relaxed">{body}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export default function OrderSuccessPage() {
  const [phase,   setPhase]   = useState<"loading" | "success">("loading");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("success"), 2000);
    const t2 = setTimeout(() => setVisible(true),   2080);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === "loading") return <LoadingState />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 pb-28">

      {/* ── Success hero ── */}
      <div className="text-center mb-14">
        <CheckIcon visible={visible} />

        <div
          className={`transition-all duration-500 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          style={{ transitionDelay: "250ms" }}
        >
          <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--muted)] mb-4">
            Order Confirmed
          </p>
          <h1
            className="text-4xl sm:text-5xl font-light text-[var(--black)] mb-4 leading-snug"
          >
            Thank you for<br className="hidden sm:block" /> your order
          </h1>
          <p className="text-[13px] text-[var(--muted)] leading-relaxed max-w-md mx-auto">
            We&apos;ve received your order and our team will begin preparing it shortly.
            A confirmation email is on its way to you.
          </p>
        </div>

        {/* Order number */}
        <div
          className={`inline-block mt-8 border border-[#E8E8E8] px-10 py-5 transition-all duration-500 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
          style={{ transitionDelay: "380ms" }}
        >
          <p className="text-[9px] tracking-[0.35em] uppercase text-[var(--muted)] mb-1.5">Order Number</p>
          <p
            className="text-2xl font-light text-[var(--black)]"
          >
            #{ORDER.id}
          </p>
          <p className="text-[10px] text-[var(--muted)] mt-1">{ORDER.date}</p>
        </div>
      </div>

      {/* ── Order Summary card ── */}
      <div
        className={`border border-[#E8E8E8] mb-8 transition-all duration-500 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
        style={{ transitionDelay: "480ms" }}
      >
        {/* Card header */}
        <div className="px-7 py-5 border-b border-[#E8E8E8] flex items-center justify-between">
          <h2 className="text-[11px] tracking-[0.25em] uppercase text-[var(--black)] font-medium">
            Order Summary
          </h2>
          <span className="text-[11px] text-[var(--muted)]">
            {ORDER.itemCount} {ORDER.itemCount === 1 ? "item" : "items"}
          </span>
        </div>

        {/* Items */}
        <div className="px-7 py-5 space-y-4 border-b border-[#E8E8E8]">
          {ORDER.items.map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              {/* Image placeholder */}
              <div className="w-14 h-16 rounded-[6px] bg-[#EDE8E1] shrink-0 flex items-end justify-center overflow-hidden">
                <span className="text-[6px] text-black/10 tracking-widest uppercase mb-1 select-none">img</span>
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-[var(--black)]">{item.name}</p>
                <p className="text-[10px] text-[var(--muted)] mt-0.5">
                  Size: {item.size} &nbsp;·&nbsp; Qty: {item.qty}
                </p>
              </div>
              {/* Price */}
              <div className="text-right shrink-0">
                <p className="text-[12px] text-[var(--black)]">{item.price}</p>
                {item.originalPrice && (
                  <p className="text-[10px] text-[var(--muted)] line-through">{item.originalPrice}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="px-7 py-5 space-y-3">
          <div className="flex justify-between text-[12px]">
            <span className="text-[var(--muted)]">Subtotal</span>
            <span className="text-[var(--black)]">{formatPrice(ORDER.subtotal)}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-[var(--muted)]">Shipping</span>
            {ORDER.shipping === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              <span className="text-[var(--black)]">{formatPrice(ORDER.shipping)}</span>
            )}
          </div>
          <div className="flex justify-between items-center border-t border-[#E8E8E8] pt-4 mt-1">
            <span className="text-[12px] font-medium text-[var(--black)]">Total</span>
            <span
              className="text-[20px] font-light text-[var(--black)]"
            >
              {formatPrice(ORDER.total)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div
        className={`flex flex-col sm:flex-row gap-3 mb-14 transition-all duration-500 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
        style={{ transitionDelay: "580ms" }}
      >
        <Link
          href="#"
          className="flex-1 py-4 border border-[var(--black)] text-[var(--black)] text-[11px] tracking-[0.25em] uppercase text-center hover:bg-[var(--black)] hover:text-white transition-colors duration-300 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
          </svg>
          Track Order
        </Link>
        <Link
          href="/shop"
          className="flex-1 py-4 bg-[var(--black)] text-white text-[11px] tracking-[0.25em] uppercase text-center hover:bg-[#2a2a2a] transition-colors duration-300 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
          </svg>
          Continue Shopping
        </Link>
      </div>

      {/* ── Info cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard
          visible={visible}
          delay={680}
          title="Delivery Information"
          body={`Your order is estimated to arrive between ${ORDER.estimatedDelivery}. You will receive an SMS notification once your order is dispatched.`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          }
        />
        <InfoCard
          visible={visible}
          delay={780}
          title="Need Help?"
          body="Our customer support team is available 7 days a week. Contact us at support@nayabposh.com or WhatsApp +92 300 0000000 for any queries."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
          }
        />
      </div>

      {/* ── Bottom divider + note ── */}
      <div
        className={`mt-12 text-center transition-all duration-500 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDelay: "880ms" }}
      >
        <div className="w-10 h-px bg-[#E8E8E8] mx-auto mb-6" />
        <p className="text-[11px] text-[var(--muted)] leading-relaxed">
          Thank you for choosing <span className="text-[var(--black)]">Nayab Posh</span>. We hope you love your new pieces.
        </p>
      </div>

    </div>
  );
}
