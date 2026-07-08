"use client";

import { useState } from "react";
import type { TrackOrderDTO } from "@/app/api/orders/track/route";

// ── Status helpers ─────────────────────────────────────────────────

const STATUS_ORDER = ["Pending", "Processing", "Shipped", "Delivered"] as const;
type ActiveStatus = (typeof STATUS_ORDER)[number] | "Cancelled";

function getStatusIndex(status: string): number {
  return STATUS_ORDER.indexOf(status as (typeof STATUS_ORDER)[number]);
}

function fp(n: number) {
  return `Rs. ${Math.round(n).toLocaleString("en-PK")}`;
}

function fdate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function ftime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-PK", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

// ── Status badge ──────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  Pending:    "bg-amber-50 text-amber-600 ring-1 ring-amber-200",
  Processing: "bg-blue-50 text-blue-600 ring-1 ring-blue-200",
  Shipped:    "bg-violet-50 text-violet-600 ring-1 ring-violet-200",
  Delivered:  "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200",
  Cancelled:  "bg-red-50 text-red-500 ring-1 ring-red-200",
};

// ── Timeline step icons ────────────────────────────────────────────

const STEP_ICONS: Record<string, React.ReactNode> = {
  Pending: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  Processing: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  ),
  Shipped: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  Delivered: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  ),
};

// ── Order Timeline ─────────────────────────────────────────────────

function OrderTimeline({ order }: { order: TrackOrderDTO }) {
  const isCancelled  = order.status === "Cancelled";
  const currentIndex = isCancelled ? -1 : getStatusIndex(order.status);

  const historyMap = new Map<string, string>(
    order.statusHistory.map((h) => [h.status, h.createdAt])
  );

  if (isCancelled) {
    return (
      <div className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-red-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <p className="text-[13px] font-medium text-red-600">Order Cancelled</p>
          <p className="text-[12px] text-red-400 mt-0.5">
            This order was cancelled.
            {historyMap.get("Cancelled") && ` on ${fdate(historyMap.get("Cancelled")!)}`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Connector line */}
      <div className="absolute top-5 left-5 right-5 h-px bg-[var(--border)] hidden sm:block" aria-hidden />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-0 relative">
        {STATUS_ORDER.map((step, i) => {
          const isCompleted = i <= currentIndex;
          const isCurrent   = i === currentIndex;
          const stepDate    = historyMap.get(step);

          return (
            <div key={step} className="flex sm:flex-col items-start sm:items-center gap-4 sm:gap-3 relative">
              {/* Vertical connector on mobile */}
              {i < STATUS_ORDER.length - 1 && (
                <div
                  className={`absolute left-5 top-10 w-px h-full sm:hidden ${isCompleted ? "bg-[var(--black)]" : "bg-[var(--border)]"}`}
                  aria-hidden
                />
              )}

              {/* Step circle */}
              <div
                className={`relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isCompleted
                    ? "bg-[var(--black)] border-[var(--black)] text-white"
                    : "bg-white border-[var(--border)] text-[var(--muted)]"
                }`}
              >
                {isCompleted ? STEP_ICONS[step] : (
                  <span className="text-[10px] font-medium">{i + 1}</span>
                )}
                {isCurrent && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--black)] border-2 border-white animate-pulse" />
                )}
              </div>

              {/* Step label */}
              <div className="sm:text-center pb-6 sm:pb-0">
                <p className={`text-[12px] font-medium ${isCompleted ? "text-[var(--black)]" : "text-[var(--muted)]"}`}>
                  {step}
                </p>
                {stepDate ? (
                  <p className="text-[10px] text-[var(--muted)] mt-0.5">{fdate(stepDate)}</p>
                ) : (
                  <p className="text-[10px] text-[var(--border)] mt-0.5">—</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Order Result Card ─────────────────────────────────────────────

function OrderCard({ order, onReset }: { order: TrackOrderDTO; onReset: () => void }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)] mb-1">Order Number</p>
          <p className="text-2xl font-light text-[var(--black)]">
            #{order.orderNumber}
          </p>
          <p className="text-[12px] text-[var(--muted)] mt-1">Placed on {fdate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] tracking-[0.08em] uppercase px-3 py-1.5 rounded-full ${STATUS_BADGE[order.status] ?? "bg-slate-100 text-slate-600"}`}>
            {order.status}
          </span>
          <button
            onClick={onReset}
            className="text-[11px] tracking-[0.1em] uppercase text-[var(--muted)] hover:text-[var(--accent)] transition-colors underline underline-offset-2"
          >
            Track another
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-5 sm:p-6">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)] mb-5">Order Progress</p>
        <OrderTimeline order={order} />
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Shipping */}
        <div className="border border-[var(--border)] rounded-xl p-5">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)] mb-3">Shipping To</p>
          <p className="text-[13px] font-medium text-[var(--black)] mb-1">{order.shipName}</p>
          <p className="text-[12px] text-[var(--muted)] leading-relaxed">
            {order.shipStreet}<br />
            {order.shipCity}, {order.shipProvince} {order.shipPostalCode}<br />
            {order.shipCountry}
          </p>
        </div>

        {/* Order info */}
        <div className="border border-[var(--border)] rounded-xl p-5 space-y-3">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)]">Order Details</p>
          <div className="space-y-2">
            {[
              { label: "Items",          value: `${order.totalItems} item${order.totalItems !== 1 ? "s" : ""}` },
              { label: "Order Total",    value: fp(order.total) },
              { label: "Payment Method", value: order.paymentMethod ?? "—" },
              { label: "Payment Status", value: order.paymentStatus ?? "—" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between text-[12px]">
                <span className="text-[var(--muted)]">{row.label}</span>
                <span className="text-[var(--black)] font-medium">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status history */}
      {order.statusHistory.length > 0 && (
        <div className="border border-[var(--border)] rounded-xl p-5">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--muted)] mb-4">Status History</p>
          <div className="space-y-3">
            {[...order.statusHistory].reverse().map((h, i) => (
              <div key={i} className="flex items-start gap-3 text-[12px]">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--black)] mt-1.5 shrink-0" />
                <div className="flex-1">
                  <span className="font-medium text-[var(--black)]">{h.status}</span>
                  {h.note && <span className="text-[var(--muted)] ml-2">— {h.note}</span>}
                </div>
                <div className="text-[var(--muted)] text-right shrink-0">
                  <div>{fdate(h.createdAt)}</div>
                  <div className="text-[10px]">{ftime(h.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help */}
      <p className="text-[12px] text-[var(--muted)] text-center">
        Need help with your order?{" "}
        <a href="/contact-us" className="text-[var(--black)] underline underline-offset-2 hover:opacity-60 transition-opacity">
          Contact Support
        </a>
      </p>
    </div>
  );
}

// ── Not Found State ───────────────────────────────────────────────

function NotFound({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <div className="w-14 h-14 rounded-full border border-[var(--border)] flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[var(--muted)]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
        </svg>
      </div>
      <div>
        <h3
          className="text-2xl font-light text-[var(--black)] mb-2"
        >
          Order Not Found
        </h3>
        <p className="text-[13px] text-[var(--muted)] leading-relaxed max-w-xs mx-auto">
          We couldn&apos;t find an order matching those details. Please check your order number and email address and try again.
        </p>
      </div>
      <div className="space-y-2 w-full max-w-xs">
        <button
          onClick={onReset}
          className="w-full py-3.5 bg-[var(--black)] text-white text-[11px] tracking-[0.2em] uppercase hover:bg-[#2a2a2a] transition-colors"
        >
          Try Again
        </button>
        <a
          href="/contact-us"
          className="block w-full py-3.5 border border-[var(--black)] text-[var(--black)] text-[11px] tracking-[0.2em] uppercase text-center hover:bg-[var(--black)] hover:text-white transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}

// ── Spinner ────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

// ── Main Client Component ─────────────────────────────────────────

type State = "idle" | "loading" | "found" | "not-found" | "error";

export default function TrackOrderClient() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email,       setEmail]       = useState("");
  const [state,       setState]       = useState<State>("idle");
  const [result,      setResult]      = useState<TrackOrderDTO | null>(null);
  const [errorMsg,    setErrorMsg]    = useState("");

  const [errors, setErrors] = useState<{ orderNumber?: string; email?: string }>({});

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate() {
    const e: typeof errors = {};
    if (!orderNumber.trim()) e.orderNumber = "Order number is required.";
    if (!email.trim())       e.email       = "Email address is required.";
    else if (!EMAIL_RE.test(email.trim())) e.email = "Please enter a valid email address.";
    return e;
  }

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setState("loading");
    setErrors({});

    try {
      const res  = await fetch("/api/orders/track", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ orderNumber: orderNumber.trim(), email: email.trim() }),
      });
      const data = await res.json();

      if (res.status === 404 || !data.success) {
        setState("not-found");
        return;
      }

      setResult(data.data);
      setState("found");
    } catch {
      setState("error");
      setErrorMsg("Unable to connect. Please check your connection and try again.");
    }
  }

  function reset() {
    setState("idle");
    setResult(null);
    setErrorMsg("");
    setErrors({});
    setOrderNumber("");
    setEmail("");
  }

  if (state === "found" && result) {
    return <OrderCard order={result} onReset={reset} />;
  }

  if (state === "not-found") {
    return <NotFound onReset={reset} />;
  }

  return (
    <div className="space-y-6">
      {state === "error" && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-600">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleTrack} noValidate className="space-y-4">
        {/* Order Number */}
        <div className="space-y-1.5">
          <label className="block text-[10px] tracking-[0.2em] uppercase text-[var(--muted)]">
            Order Number
          </label>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => { setOrderNumber(e.target.value); setErrors((p) => ({ ...p, orderNumber: undefined })); }}
            placeholder="e.g. NP-20260620-ABC123"
            className={`w-full border px-4 py-3.5 text-[13px] text-[var(--black)] placeholder-[#C8C8C8] bg-white outline-none transition-colors duration-200 rounded-none ${
              errors.orderNumber ? "border-red-300 focus:border-red-400" : "border-[var(--border)] focus:border-[var(--black)]"
            }`}
          />
          {errors.orderNumber && <p className="text-[11px] text-red-500">{errors.orderNumber}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-[10px] tracking-[0.2em] uppercase text-[var(--muted)]">
            Email Address Used at Checkout
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
            placeholder="your@email.com"
            autoComplete="email"
            className={`w-full border px-4 py-3.5 text-[13px] text-[var(--black)] placeholder-[#C8C8C8] bg-white outline-none transition-colors duration-200 rounded-none ${
              errors.email ? "border-red-300 focus:border-red-400" : "border-[var(--border)] focus:border-[var(--black)]"
            }`}
          />
          {errors.email && <p className="text-[11px] text-red-500">{errors.email}</p>}
        </div>

        <button
          type="submit"
          disabled={state === "loading"}
          className="w-full py-4 bg-[var(--black)] text-white text-[11px] tracking-[0.25em] uppercase hover:bg-[#2a2a2a] transition-colors duration-200 disabled:opacity-60 flex items-center justify-center gap-2.5"
        >
          {state === "loading" ? <><Spinner /><span>Searching…</span></> : "Track Order"}
        </button>
      </form>

      <p className="text-[11px] text-[var(--muted)] text-center leading-relaxed">
        Your order number can be found in your order confirmation email or SMS.<br />
        Can&apos;t find your order?{" "}
        <a href="/contact-us" className="text-[var(--black)] underline underline-offset-2 hover:opacity-60 transition-opacity">
          Contact Support
        </a>
      </p>
    </div>
  );
}
