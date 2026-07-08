"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface FormState {
  code:          string;
  description:   string;
  discountType:  "Percentage" | "Fixed";
  discountValue: string;
  minOrderValue: string;
  maxDiscount:   string;
  usageLimit:    string;
  isActive:      boolean;
  startDate:     string;
  endDate:       string;
}

const INITIAL: FormState = {
  code:          "",
  description:   "",
  discountType:  "Percentage",
  discountValue: "",
  minOrderValue: "",
  maxDiscount:   "",
  usageLimit:    "",
  isActive:      true,
  startDate:     "",
  endDate:       "",
};

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-stone-600 uppercase tracking-wider mb-1.5">{children}</label>;
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-stone-400">{children}</p>;
}

export default function NewCouponPage() {
  const router = useRouter();
  const [form, setForm]       = useState<FormState>(INITIAL);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  function set(key: keyof FormState, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const body: Record<string, unknown> = {
      code:         form.code.trim().toUpperCase(),
      description:  form.description.trim() || null,
      discountType: form.discountType,
      discountValue: parseFloat(form.discountValue),
      isActive:     form.isActive,
    };
    if (form.minOrderValue) body.minOrderValue = parseFloat(form.minOrderValue);
    if (form.maxDiscount)   body.maxDiscount   = parseFloat(form.maxDiscount);
    if (form.usageLimit)    body.usageLimit    = parseInt(form.usageLimit, 10);
    if (form.startDate)     body.startDate     = form.startDate;
    if (form.endDate)       body.endDate       = form.endDate;

    try {
      const res  = await fetch("/api/coupons", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/admin/coupons");
      } else {
        setError(json.error ?? "Failed to create coupon");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center gap-4">
        <Link href="/admin/coupons" className="text-stone-400 hover:text-stone-700 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className={`text-2xl font-semibold text-stone-800`}>New Coupon</h1>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-stone-200 p-6 space-y-6">
          {/* Code */}
          <div>
            <Label>Coupon Code <span className="text-red-500">*</span></Label>
            <input
              type="text"
              required
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              placeholder="e.g. SUMMER20"
              className="w-full border border-stone-200 px-3 py-2 text-sm font-mono text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400"
            />
            <Hint>Letters, numbers, underscores, hyphens only.</Hint>
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="e.g. Summer sale – 20% off everything"
              className="w-full border border-stone-200 px-3 py-2 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400"
            />
          </div>

          {/* Discount type + value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Discount Type <span className="text-red-500">*</span></Label>
              <select
                value={form.discountType}
                onChange={(e) => set("discountType", e.target.value as "Percentage" | "Fixed")}
                className="w-full border border-stone-200 px-3 py-2 text-sm text-stone-800 bg-white focus:outline-none focus:border-stone-400"
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed">Fixed Amount (Rs.)</option>
              </select>
            </div>
            <div>
              <Label>Discount Value <span className="text-red-500">*</span></Label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                max={form.discountType === "Percentage" ? 100 : undefined}
                value={form.discountValue}
                onChange={(e) => set("discountValue", e.target.value)}
                placeholder={form.discountType === "Percentage" ? "e.g. 20" : "e.g. 500"}
                className="w-full border border-stone-200 px-3 py-2 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400"
              />
              <Hint>{form.discountType === "Percentage" ? "1–100" : "Fixed Rs. amount"}</Hint>
            </div>
          </div>

          {/* Min order + max discount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Minimum Order (Rs.)</Label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.minOrderValue}
                onChange={(e) => set("minOrderValue", e.target.value)}
                placeholder="e.g. 2000"
                className="w-full border border-stone-200 px-3 py-2 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400"
              />
              <Hint>Leave empty for no minimum.</Hint>
            </div>
            <div>
              <Label>Max Discount (Rs.)</Label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.maxDiscount}
                onChange={(e) => set("maxDiscount", e.target.value)}
                placeholder="e.g. 1000"
                disabled={form.discountType === "Fixed"}
                className="w-full border border-stone-200 px-3 py-2 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400 disabled:bg-stone-50 disabled:text-stone-300"
              />
              <Hint>{form.discountType === "Fixed" ? "N/A for fixed discounts." : "Cap for percentage discounts."}</Hint>
            </div>
          </div>

          {/* Usage limit */}
          <div>
            <Label>Usage Limit</Label>
            <input
              type="number"
              min="1"
              step="1"
              value={form.usageLimit}
              onChange={(e) => set("usageLimit", e.target.value)}
              placeholder="e.g. 100"
              className="w-full border border-stone-200 px-3 py-2 text-sm text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400"
            />
            <Hint>Leave empty for unlimited uses.</Hint>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className="w-full border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-400"
              />
              <Hint>Leave empty to activate immediately.</Hint>
            </div>
            <div>
              <Label>End Date</Label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className="w-full border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-400"
              />
              <Hint>Leave empty for no expiry.</Hint>
            </div>
          </div>

          {/* Active */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              role="switch"
              aria-checked={form.isActive}
              onClick={() => set("isActive", !form.isActive)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.isActive ? "bg-stone-800" : "bg-stone-300"}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${form.isActive ? "translate-x-4.5" : "translate-x-0.5"}`} />
            </button>
            <span className="text-sm text-stone-700">{form.isActive ? "Active — coupon can be used immediately" : "Inactive — coupon will not be accepted"}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-stone-100">
            <button
              type="submit"
              disabled={saving}
              className="bg-stone-800 text-white text-sm px-6 py-2.5 hover:bg-stone-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Creating…" : "Create Coupon"}
            </button>
            <Link
              href="/admin/coupons"
              className="border border-stone-200 text-stone-600 text-sm px-6 py-2.5 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
