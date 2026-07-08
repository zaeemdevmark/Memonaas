"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { CartDTO } from "@/lib/types/cart";
import type { OrderDTO } from "@/lib/types/order";
import { useCartStore } from "@/store/cartStore";

// ── Utilities ────────────────────────────────────────────────────

function formatPrice(n: number): string {
  return `Rs. ${n.toLocaleString("en-PK")}`;
}

const COUNTRY_MAP: Record<string, string> = {
  PK: "Pakistan",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  GB: "United Kingdom",
  US: "United States",
  CA: "Canada",
  AU: "Australia",
};

// ── Primitives ───────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

interface FieldProps {
  label: string;
  error?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}

function Field({ label, error, type = "text", value, onChange, placeholder, autoComplete, required }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] tracking-[0.2em] uppercase text-[#3D3D3D] font-medium block">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full border px-4 py-3 text-[13px] text-[var(--black)] placeholder-[#8A8A8A] bg-white outline-none transition-colors duration-200 rounded-none ${
          error ? "border-red-300 focus:border-red-400" : "border-[#B0B0B0] focus:border-[var(--black)]"
        }`}
      />
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 shrink-0">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}

function SelectField({ label, error, value, onChange, options, required }: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] tracking-[0.2em] uppercase text-[#3D3D3D] font-medium block">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border px-4 py-3 text-[13px] text-[var(--black)] bg-white outline-none appearance-none transition-colors duration-200 rounded-none cursor-pointer ${
            error ? "border-red-300 focus:border-red-400" : "border-[#B0B0B0] focus:border-[var(--black)]"
          }`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#3D3D3D]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 shrink-0">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-7">
      <span className="text-[10px] tracking-[0.2em] text-[#3D3D3D] font-medium">{number}</span>
      <h2 className="text-[11px] tracking-[0.25em] uppercase text-[var(--black)] font-medium whitespace-nowrap">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[#E8E8E8]" />
    </div>
  );
}

// ── Payment option card ──────────────────────────────────────────

interface PaymentOptionProps {
  value: "cod" | "card";
  selected: boolean;
  onSelect: () => void;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

function PaymentOption({ selected, onSelect, label, sublabel, icon, disabled }: PaymentOptionProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      className={`relative flex items-center gap-4 border px-5 py-4 text-left transition-all duration-200 w-full ${
        disabled
          ? "border-[#E8E8E8] opacity-50 cursor-not-allowed"
          : selected
          ? "border-[var(--black)] bg-[#FAFAFA]"
          : "border-[#E8E8E8] hover:border-[#AAAAAA]"
      }`}
    >
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
        selected ? "border-[var(--black)]" : "border-[#D0D0D0]"
      }`}>
        {selected && <div className="w-2 h-2 rounded-full bg-[var(--black)]" />}
      </div>
      <div className="text-[#3D3D3D] shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-[var(--black)]">{label}</p>
        {sublabel && <p className="text-[10px] text-[#3D3D3D] mt-0.5">{sublabel}</p>}
      </div>
      {disabled && (
        <span className="ml-auto text-[9px] tracking-[0.15em] uppercase bg-[#F0F0F0] text-[#3D3D3D] px-2 py-0.5 shrink-0">
          Coming soon
        </span>
      )}
    </button>
  );
}

// ── Countries / provinces ────────────────────────────────────────

const COUNTRIES = [
  { value: "PK", label: "Pakistan" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
];

// ── Main Page ────────────────────────────────────────────────────

interface FormData {
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string;
  country:   string;
  province:  string;
  city:      string;
  address:   string;
  postalCode: string;
  notes:     string;
  payment:   "cod" | "card";
}

type Errors = Partial<Record<keyof FormData | "general", string>>;

export default function CheckoutPage() {
  const { clearCart, items: storeItems, removeItem: removeFromStore } = useCartStore();
  const [cart,         setCart]         = useState<CartDTO | null>(null);
  const [cartLoading,  setCartLoading]  = useState(true);
  const [placedOrder,  setPlacedOrder]  = useState<OrderDTO | null>(null);
  const [removingId,   setRemovingId]   = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    firstName: "", lastName: "", email: "", phone: "",
    country: "PK", province: "", city: "", address: "", postalCode: "",
    notes: "", payment: "cod",
  });
  const [errors,  setErrors]  = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  // Fetch DB cart on mount
  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCart(json.data as CartDTO);
      })
      .catch(() => {})
      .finally(() => setCartLoading(false));
  }, []);

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined, general: undefined }));
  }

  async function handleRemoveItem(itemId: string) {
    setRemovingId(itemId);

    // Keep the Header/CartDrawer's cart in sync too
    const matching = storeItems.find((i) => i.apiId === itemId);
    if (matching) removeFromStore(matching.id);

    try {
      const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) setCart(json.data as CartDTO);
    } catch {
      // leave cart state as-is on network failure
    } finally {
      setRemovingId(null);
    }
  }

  const shipping = (cart?.subtotal ?? 0) >= 5000 ? 0 : 200;
  const total    = (cart?.subtotal ?? 0) + shipping;

  function validate(): Errors {
    const e: Errors = {};
    if (!form.firstName.trim() || form.firstName.trim().length < 2) e.firstName = "First name is required.";
    if (!form.lastName.trim()  || form.lastName.trim().length  < 2) e.lastName  = "Last name is required.";
    if (!form.email.trim()) {
      e.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Please enter a valid email address.";
    }
    if (!form.phone.trim()) {
      e.phone = "Phone number is required.";
    } else if (form.phone.replace(/\D/g, "").length < 10) {
      e.phone = "Please enter a valid phone number.";
    }
    if (!form.province.trim()) e.province = "Province / State is required.";
    if (!form.city.trim())     e.city     = "City is required.";
    if (!form.address.trim() || form.address.trim().length < 5) e.address = "Please enter your full address.";
    if (form.postalCode && !/^\d+$/.test(form.postalCode)) e.postalCode = "Postal code must be numeric.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors({ ...errs, general: "Please fix the errors below before placing your order." });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: "COD",
          name:          `${form.firstName.trim()} ${form.lastName.trim()}`,
          email:         form.email.trim(),
          phone:         form.phone.trim(),
          street:        form.address.trim(),
          city:          form.city.trim(),
          province:      form.province.trim(),
          postalCode:    form.postalCode.trim() || "00000",
          country:       COUNTRY_MAP[form.country] ?? form.country,
          notes:         form.notes.trim() || null,
          couponCode:    null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrors({ general: json.error ?? "Failed to place order. Please try again." });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      clearCart();
      setPlacedOrder(json.data as OrderDTO);
    } catch {
      setErrors({ general: "A network error occurred. Please try again." });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  }

  // ── Cart loading skeleton ─────────────────────────────────────
  if (cartLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#3D3D3D]">
          <Spinner />
          <span className="text-[13px]">Loading your cart…</span>
        </div>
      </div>
    );
  }

  // ── Empty cart ────────────────────────────────────────────────
  if ((!cart || cart.items.length === 0) && !placedOrder) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center gap-6">
        <h1 className="text-3xl font-light text-[var(--black)]">
          Your cart is empty
        </h1>
        <p className="text-[12px] text-[#3D3D3D]">Add items before proceeding to checkout.</p>
        <Link href="/shop" className="text-[11px] tracking-[0.25em] uppercase border border-[var(--black)] text-[var(--black)] px-10 py-3.5 hover:bg-black hover:text-white transition-colors duration-300">
          Shop Now
        </Link>
      </div>
    );
  }

  // ── Success state ─────────────────────────────────────────────
  if (placedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mx-auto mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>

        <p className="text-[10px] tracking-[0.35em] uppercase text-[#3D3D3D] mb-3">Order Confirmed</p>
        <h1 className="text-4xl sm:text-5xl font-light text-[var(--black)] mb-4">
          Thank you, {form.firstName || "dear customer"}
        </h1>
        <p className="text-[13px] text-[#3D3D3D] mb-10">
          Your order has been placed successfully. Our team will contact you shortly to confirm delivery.
        </p>

        <div className="border border-[#E8E8E8] inline-block px-10 py-5 mb-10">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#3D3D3D] mb-1">Order Number</p>
          <p className="text-[18px] font-medium text-[var(--black)]">
            {placedOrder.orderNumber}
          </p>
        </div>

        <div className="border-t border-[#E8E8E8] pt-8 mb-10 space-y-3 text-left max-w-sm mx-auto">
          {placedOrder.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-[12px]">
              <span className="text-[var(--black)]">
                {item.productName}
                <span className="text-[#3D3D3D] ml-1">× {item.quantity}</span>
                <span className="text-[#3D3D3D] ml-1">/ {item.size}</span>
              </span>
              <span className="text-[var(--black)]">{formatPrice(item.lineTotal)}</span>
            </div>
          ))}
          <div className="border-t border-[#E8E8E8] pt-3 flex justify-between font-medium text-[13px]">
            <span>Total</span>
            <span>{formatPrice(placedOrder.total)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/shop" className="px-10 py-3.5 border border-[var(--black)] text-[var(--black)] text-[11px] tracking-[0.25em] uppercase hover:bg-[#F5F5F5] transition-colors duration-200">
            Continue Shopping
          </Link>
          <Link href="/" className="px-10 py-3.5 bg-[var(--black)] text-white text-[11px] tracking-[0.25em] uppercase hover:bg-[#2a2a2a] transition-colors duration-200">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // ── Checkout form ─────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-24">

      <div className="mb-10 border-b border-[#E8E8E8] pb-6">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#3D3D3D] mb-1">Nayab Posh</p>
        <h1 className="text-4xl sm:text-5xl font-light text-[var(--black)]">
          Checkout
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

          {/* ── LEFT ── */}
          <div className="flex-1 min-w-0 space-y-12">

            {errors.general && (
              <div className="border border-red-200 bg-red-50 text-red-600 text-[12px] px-5 py-4 flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 mt-0.5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                </svg>
                {errors.general}
              </div>
            )}

            {/* 01 — Shipping Information */}
            <section>
              <SectionHeading number="01" title="Shipping Information" />
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First Name" value={form.firstName} onChange={(v) => set("firstName", v)}
                    placeholder="Sara" autoComplete="given-name" required error={errors.firstName} />
                  <Field label="Last Name" value={form.lastName} onChange={(v) => set("lastName", v)}
                    placeholder="Khan" autoComplete="family-name" required error={errors.lastName} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Email Address" type="email" value={form.email} onChange={(v) => set("email", v)}
                    placeholder="sara@example.com" autoComplete="email" required error={errors.email} />
                  <Field label="Phone Number" type="tel" value={form.phone} onChange={(v) => set("phone", v)}
                    placeholder="+92 300 0000000" autoComplete="tel" required error={errors.phone} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField label="Country" value={form.country} onChange={(v) => set("country", v)}
                    options={COUNTRIES} required error={errors.country} />
                  <Field label="Province / State" value={form.province} onChange={(v) => set("province", v)}
                    placeholder="Punjab" autoComplete="address-level1" required error={errors.province} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="City" value={form.city} onChange={(v) => set("city", v)}
                    placeholder="Lahore" autoComplete="address-level2" required error={errors.city} />
                  <div className="max-w-full">
                    <Field label="Postal Code" value={form.postalCode} onChange={(v) => set("postalCode", v)}
                      placeholder="54000" autoComplete="postal-code" error={errors.postalCode} />
                  </div>
                </div>
                <Field label="Street Address" value={form.address} onChange={(v) => set("address", v)}
                  placeholder="House no., street, area" autoComplete="street-address" required error={errors.address} />
              </div>
            </section>

            {/* 02 — Payment Method */}
            <section>
              <SectionHeading number="02" title="Payment Method" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PaymentOption
                  value="cod"
                  selected={form.payment === "cod"}
                  onSelect={() => set("payment", "cod")}
                  label="Cash on Delivery"
                  sublabel="Pay when your order arrives"
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                    </svg>
                  }
                />
                <PaymentOption
                  value="card"
                  selected={form.payment === "card"}
                  onSelect={() => set("payment", "card")}
                  label="Credit / Debit Card"
                  sublabel="Visa, Mastercard, AMEX"
                  disabled
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                    </svg>
                  }
                />
              </div>

              {form.payment === "cod" && (
                <div className="mt-4 bg-[#FAFAFA] border border-[#E8E8E8] px-5 py-4 flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#3D3D3D] shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                  </svg>
                  <p className="text-[11px] text-[#3D3D3D] leading-relaxed">
                    Please have the exact amount ready at the time of delivery. Our courier will collect payment upon arrival.
                  </p>
                </div>
              )}
            </section>

            {/* 03 — Order Notes */}
            <section>
              <SectionHeading number="03" title="Order Notes" />
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-[0.2em] uppercase text-[#3D3D3D] font-medium block">
                  Special Instructions <span className="normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Gift wrapping requests, delivery instructions, or anything else we should know…"
                  rows={4}
                  className="w-full border border-[#B0B0B0] focus:border-[var(--black)] px-4 py-3 text-[13px] text-[var(--black)] placeholder-[#8A8A8A] bg-white outline-none transition-colors duration-200 resize-none rounded-none"
                />
              </div>
            </section>

            <div className="lg:hidden">
              <Link href="/cart" className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[#3D3D3D] hover:text-[var(--black)] transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Return to Cart
              </Link>
            </div>
          </div>

          {/* ── RIGHT — Order Summary ── */}
          <div className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-[108px]">
            <div className="border border-[#E8E8E8] p-7">
              <h2 className="text-[11px] tracking-[0.25em] uppercase text-[var(--black)] mb-7 font-medium">
                Order Summary
              </h2>

              <div className="space-y-5 mb-7">
                {cart?.items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="w-16 h-20 rounded-[6px] bg-[#EDE8E1] shrink-0 overflow-hidden">
                      {item.product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.product.image.url} alt={item.product.image.altText ?? item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-end justify-center">
                          <span className="text-[6px] text-black/10 tracking-widest uppercase mb-1.5 select-none">Img</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[var(--black)] leading-snug truncate">{item.product.name}</p>
                      <p className="text-[10px] text-[#3D3D3D] mt-1">
                        {item.variant.size} &nbsp;·&nbsp; {item.variant.color} &nbsp;·&nbsp; Qty: {item.quantity}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {item.variant.salePrice ? (
                          <>
                            <span className="text-[12px] text-[var(--black)]">{formatPrice(item.variant.salePrice)}</span>
                            <span className="text-[10px] text-[#3D3D3D] line-through">{formatPrice(item.variant.price)}</span>
                          </>
                        ) : (
                          <span className="text-[12px] text-[var(--black)]">{formatPrice(item.variant.price)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className="text-[12px] text-[var(--black)] font-medium">
                        {formatPrice(item.lineTotal)}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removingId === item.id}
                        aria-label="Remove item"
                        className="text-[#3D3D3D] hover:text-red-500 transition-colors disabled:opacity-40"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#E8E8E8] pt-5 space-y-3">
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#3D3D3D]">Subtotal</span>
                  <span className="text-[var(--black)]">{formatPrice(cart?.subtotal ?? 0)}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#3D3D3D]">Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 text-[11px] tracking-wide">Free</span>
                  ) : (
                    <span className="text-[var(--black)]">{formatPrice(shipping)}</span>
                  )}
                </div>
              </div>

              <div className="border-t border-[#E8E8E8] mt-4 pt-5 flex justify-between items-center mb-8">
                <span className="text-[12px] font-medium text-[var(--black)] tracking-wide">Estimated Total</span>
                <span className="text-[16px] font-medium text-[var(--black)]">
                  {formatPrice(total)}
                </span>
              </div>

              {shipping === 0 && (cart?.subtotal ?? 0) > 0 && (
                <p className="text-[10px] text-green-600 text-center mb-5 tracking-wide">
                  You qualify for free shipping
                </p>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[var(--black)] text-white text-[11px] tracking-[0.25em] uppercase hover:bg-[#2a2a2a] active:bg-[#444] transition-colors duration-200 disabled:opacity-60 flex items-center justify-center gap-2.5"
                >
                  {loading ? (
                    <><Spinner /><span>Placing Order…</span></>
                  ) : (
                    "Place Order"
                  )}
                </button>
                <Link
                  href="/cart"
                  className="w-full py-3.5 border border-[#E8E8E8] text-[#3D3D3D] text-[11px] tracking-[0.2em] uppercase hover:border-[var(--black)] hover:text-[var(--black)] transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
                  Return to Cart
                </Link>
              </div>

              <p className="text-[10px] text-[#3D3D3D] text-center mt-5 leading-relaxed">
                Your personal data is protected. We do not store payment details.
              </p>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
