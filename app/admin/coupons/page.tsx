"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Coupon {
  id:            string;
  code:          string;
  description:   string | null;
  discountType:  "Percentage" | "Fixed";
  discountValue: number;
  minOrderValue: number | null;
  maxDiscount:   number | null;
  usageLimit:    number | null;
  usedCount:     number;
  isActive:      boolean;
  startDate:     string | null;
  endDate:       string | null;
  createdAt:     string;
}

interface Pagination {
  page:        number;
  limit:       number;
  total:       number;
  totalPages:  number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function fmt(v: number): string {
  return v.toLocaleString("en-PK");
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

function CouponStatusBadge({ coupon }: { coupon: Coupon }) {
  const now = new Date();
  const expired = coupon.endDate && new Date(coupon.endDate) < now;
  const notStarted = coupon.startDate && new Date(coupon.startDate) > now;
  const exhausted = coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;

  if (!coupon.isActive) {
    return <span className="inline-block px-2 py-0.5 text-xs rounded bg-stone-100 text-stone-500 font-medium">Inactive</span>;
  }
  if (expired) {
    return <span className="inline-block px-2 py-0.5 text-xs rounded bg-red-50 text-red-600 font-medium">Expired</span>;
  }
  if (notStarted) {
    return <span className="inline-block px-2 py-0.5 text-xs rounded bg-amber-50 text-amber-700 font-medium">Scheduled</span>;
  }
  if (exhausted) {
    return <span className="inline-block px-2 py-0.5 text-xs rounded bg-orange-50 text-orange-600 font-medium">Exhausted</span>;
  }
  return <span className="inline-block px-2 py-0.5 text-xs rounded bg-emerald-50 text-emerald-700 font-medium">Active</span>;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons]       = useState<Coupon[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage]             = useState(1);
  const [filter, setFilter]         = useState<"" | "true" | "false">("");
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (filter) params.set("isActive", filter);
      const res  = await fetch(`/api/coupons?${params}`);
      const json = await res.json();
      if (json.success) {
        setCoupons(json.data);
        setPagination(json.pagination);
      } else {
        setError(json.error ?? "Failed to load coupons");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filter]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Delete coupon "${code}"? Orders that used it will keep their discount, but the coupon code will be removed.`)) return;
    setDeleting(id);
    try {
      const res  = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchCoupons();
      } else {
        alert(json.error ?? "Delete failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setDeleting(null);
    }
  }

  async function handleToggleActive(coupon: Coupon) {
    try {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ isActive: !coupon.isActive }),
      });
      const json = await res.json();
      if (json.success) fetchCoupons();
      else alert(json.error ?? "Update failed");
    } catch {
      alert("Network error");
    }
  }

  const filters: { label: string; value: "" | "true" | "false" }[] = [
    { label: "All",      value: "" },
    { label: "Active",   value: "true" },
    { label: "Inactive", value: "false" },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-stone-400 hover:text-stone-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className={`text-2xl font-semibold text-stone-800`}>
            Coupons & Discounts
          </h1>
        </div>
        <Link
          href="/admin/coupons/new"
          className="flex items-center gap-2 bg-stone-800 text-white text-sm px-4 py-2 hover:bg-stone-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Coupon
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by code or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-stone-200 bg-white text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400"
            />
          </div>
          <div className="flex border border-stone-200 bg-white">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => { setFilter(f.value); setPage(1); }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  filter === f.value
                    ? "bg-stone-800 text-white"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-stone-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
              <p className="mt-3 text-sm text-stone-400">Loading coupons…</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-10 h-10 text-stone-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A1.994 1.994 0 0 1 3 12V7a4 4 0 0 1 4-4z" />
              </svg>
              <p className="text-stone-400 text-sm">No coupons found</p>
              <Link href="/admin/coupons/new" className="mt-3 inline-block text-sm text-stone-600 underline underline-offset-2">
                Create your first coupon
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Code</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Discount</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Min Order</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Usage</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Validity</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-stone-800 tracking-wide">{coupon.code}</span>
                        {coupon.description && (
                          <p className="text-xs text-stone-400 mt-0.5 truncate max-w-[160px]">{coupon.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-stone-700">
                        {coupon.discountType === "Percentage"
                          ? `${coupon.discountValue}%`
                          : `Rs. ${fmt(coupon.discountValue)}`}
                        {coupon.maxDiscount !== null && (
                          <span className="text-xs text-stone-400 ml-1">(max Rs. {fmt(coupon.maxDiscount)})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {coupon.minOrderValue !== null ? `Rs. ${fmt(coupon.minOrderValue)}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-stone-700">
                          {coupon.usedCount}
                          {coupon.usageLimit !== null ? ` / ${coupon.usageLimit}` : " / ∞"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-500 text-xs">
                        <div>{coupon.startDate ? `From ${fmtDate(coupon.startDate)}` : "Any time"}</div>
                        <div>{coupon.endDate ? `Until ${fmtDate(coupon.endDate)}` : "No expiry"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <CouponStatusBadge coupon={coupon} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleActive(coupon)}
                            className="text-xs text-stone-500 hover:text-stone-800 underline underline-offset-2 transition-colors"
                          >
                            {coupon.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <Link
                            href={`/admin/coupons/${coupon.id}/edit`}
                            className="text-xs text-stone-600 hover:text-stone-900 border border-stone-200 px-2 py-1 hover:border-stone-400 transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(coupon.id, coupon.code)}
                            disabled={deleting === coupon.id}
                            className="text-xs text-red-500 hover:text-red-700 border border-red-100 hover:border-red-300 px-2 py-1 transition-colors disabled:opacity-40"
                          >
                            {deleting === coupon.id ? "…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-stone-500">
              Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1.5 text-sm border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1.5 text-sm border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
