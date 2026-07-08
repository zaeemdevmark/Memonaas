"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { InventoryStatus, VariantInventoryDTO } from "@/lib/types/inventory";

// ── Types ──────────────────────────────────────────────────────────────────

interface PaginatedResponse {
  success:    boolean;
  data:       VariantInventoryDTO[];
  pagination: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean };
}

// ── Status badge ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<InventoryStatus, { label: string; cls: string; dot: string }> = {
  InStock:    { label: "In Stock",   cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500" },
  LowStock:   { label: "Low Stock",  cls: "bg-amber-50  text-amber-700  ring-1 ring-amber-200",  dot: "bg-amber-500"  },
  OutOfStock: { label: "Out of Stock", cls: "bg-red-50  text-red-600    ring-1 ring-red-200",    dot: "bg-red-500"    },
};

function StatusBadge({ status }: { status: InventoryStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] tracking-[0.08em] uppercase px-2 py-1 rounded-full ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className}`} />;
}

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-50">
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <Sk className={i === 0 ? "h-4 w-32" : "h-4 w-16"} />
        </td>
      ))}
    </tr>
  );
}

// ── Edit modal ─────────────────────────────────────────────────────────────

interface EditModalProps {
  item:    VariantInventoryDTO;
  onClose: () => void;
  onSave:  () => void;
}

function EditModal({ item, onClose, onSave }: EditModalProps) {
  const [action,    setAction]    = useState<"increaseStock" | "decreaseStock" | "setStock" | "setThreshold">("increaseStock");
  const [qty,       setQty]       = useState("");
  const [threshold, setThreshold] = useState(String(item.lowStockThreshold));
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    const isThresholdAction = action === "setThreshold";
    const value = isThresholdAction ? parseInt(threshold, 10) : parseInt(qty, 10);

    if (isNaN(value) || value < 0 || (!isThresholdAction && value <= 0)) {
      setError(isThresholdAction ? "Threshold must be ≥ 0" : "Quantity must be > 0");
      return;
    }

    setSaving(true);
    try {
      const body = isThresholdAction
        ? { action, threshold: value }
        : { action, quantity: value };

      const res = await fetch(`/api/inventory/${item.variantId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      const json = await res.json();
      if (!json.success) { setError(json.error ?? "Update failed"); return; }
      onSave();
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-[14px] font-semibold text-slate-800">{item.productName}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{item.sku} · {item.size} / {item.color}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Current stats */}
        <div className="grid grid-cols-3 gap-3 mb-5 p-3 bg-slate-50 rounded-lg">
          {[
            { label: "Total",     value: item.stock },
            { label: "Reserved",  value: item.reservedStock },
            { label: "Available", value: item.availableStock },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-[18px] font-semibold text-slate-800">{value}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Action selector */}
        <div className="mb-4">
          <label className="text-[10px] tracking-[0.15em] uppercase text-slate-600 block mb-2">Action</label>
          <select
            value={action}
            onChange={(e) => { setAction(e.target.value as typeof action); setError(null); }}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] text-slate-800 focus:outline-none focus:border-slate-400"
          >
            <option value="increaseStock">Add Stock</option>
            <option value="decreaseStock">Remove Stock</option>
            <option value="setStock">Set Total Stock</option>
            <option value="setThreshold">Update Alert Threshold</option>
          </select>
        </div>

        {/* Value input */}
        {action === "setThreshold" ? (
          <div className="mb-5">
            <label className="text-[10px] tracking-[0.15em] uppercase text-slate-600 block mb-2">Low Stock Threshold</label>
            <input
              type="number" min="0"
              value={threshold}
              onChange={(e) => { setThreshold(e.target.value); setError(null); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] text-slate-800 focus:outline-none focus:border-slate-400"
              placeholder="e.g. 5"
            />
          </div>
        ) : (
          <div className="mb-5">
            <label className="text-[10px] tracking-[0.15em] uppercase text-slate-600 block mb-2">
              {action === "setStock" ? "New Total Stock" : "Quantity"}
            </label>
            <input
              type="number" min="1"
              value={qty}
              onChange={(e) => { setQty(e.target.value); setError(null); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] text-slate-800 focus:outline-none focus:border-slate-400"
              placeholder="Enter quantity"
            />
          </div>
        )}

        {error && (
          <p className="text-[12px] text-red-500 mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-slate-900 text-white text-[12px] font-medium py-2.5 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button
            onClick={onClose}
            className="px-4 border border-slate-200 text-slate-600 text-[12px] rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

const STATUS_TABS: { label: string; value: InventoryStatus | "all" }[] = [
  { label: "All",          value: "all" },
  { label: "In Stock",     value: "InStock" },
  { label: "Low Stock",    value: "LowStock" },
  { label: "Out of Stock", value: "OutOfStock" },
];

export default function InventoryPage() {
  const [items,      setItems]      = useState<VariantInventoryDTO[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search,     setSearch]     = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | "all">("all");
  const [editItem,   setEditItem]   = useState<VariantInventoryDTO | null>(null);
  const [error,      setError]      = useState<string | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const LIMIT = 20;

  // Debounce search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sp = new URLSearchParams({
        page:  String(page),
        limit: String(LIMIT),
        ...(debouncedSearch              && { search: debouncedSearch }),
        ...(statusFilter !== "all"       && { status: statusFilter }),
      });
      const res  = await fetch(`/api/inventory?${sp}`);
      const json = (await res.json()) as PaginatedResponse;
      if (!json.success) { setError("Failed to load inventory"); return; }
      setItems(json.data);
      setTotal(json.pagination.total);
      setTotalPages(json.pagination.totalPages);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  // Counts for tabs (derived from ALL items — for badge counts we'd need a separate
  // aggregate endpoint, but for now show totals from current filtered result)
  const lowStockCount  = items.filter((i) => i.status === "LowStock").length;
  const outOfStockCount = items.filter((i) => i.status === "OutOfStock").length;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar placeholder (reuses admin shell) */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-5 py-3.5 flex items-center gap-4">
          <Link href="/admin" className="text-slate-500 hover:text-slate-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div className="flex items-center gap-2 text-[12px] text-slate-500">
            <span>Admin</span><span>/</span>
            <span className="text-slate-700 font-medium">Inventory</span>
          </div>

          {/* Alert chips */}
          {lowStockCount > 0 && (
            <span className="ml-2 text-[10px] font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-200 px-2 py-0.5 rounded-full">
              {lowStockCount} low
            </span>
          )}
          {outOfStockCount > 0 && (
            <span className="text-[10px] font-medium bg-red-50 text-red-600 ring-1 ring-red-200 px-2 py-0.5 rounded-full">
              {outOfStockCount} out
            </span>
          )}
        </header>

        <main className="flex-1 p-5 sm:p-7 space-y-5">

          {/* Page title + total */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[18px] font-semibold text-slate-800">Inventory</h1>
              <p className="text-[12px] text-slate-500 mt-0.5">
                {loading ? "Loading…" : `${total} variant${total !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          {/* Search + status filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product, SKU, color…"
                className="w-full pl-9 pr-4 py-2 text-[13px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 placeholder-slate-400"
              />
            </div>

            {/* Status filter tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => { setStatusFilter(tab.value); setPage(1); }}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150 whitespace-nowrap ${
                    statusFilter === tab.value
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {error ? (
              <div className="px-5 py-10 text-center">
                <p className="text-[13px] text-red-500 mb-3">{error}</p>
                <button onClick={fetchInventory} className="text-[12px] text-slate-600 underline">Retry</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {["Product", "SKU", "Size", "Color", "Total Stock", "Reserved", "Available", "Threshold", "Status", ""].map((h) => (
                        <th key={h} className="text-left text-[10px] tracking-[0.1em] uppercase text-slate-500 font-medium px-4 py-3 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading
                      ? Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
                      : items.length === 0
                      ? (
                        <tr>
                          <td colSpan={10} className="px-5 py-16 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-slate-200 mx-auto mb-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                            </svg>
                            <p className="text-[13px] text-slate-500">No variants found</p>
                          </td>
                        </tr>
                      )
                      : items.map((item) => (
                        <tr key={item.variantId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors duration-100">
                          <td className="px-4 py-3.5">
                            <div>
                              <p className="text-[12px] font-medium text-slate-800 leading-tight">{item.productName}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{item.productSlug}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-[11px] font-mono text-slate-600 whitespace-nowrap">{item.sku}</td>
                          <td className="px-4 py-3.5">
                            <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{item.size}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              {item.colorHex && (
                                <span className="w-3 h-3 rounded-full border border-slate-200 shrink-0" style={{ backgroundColor: item.colorHex }} />
                              )}
                              <span className="text-[12px] text-slate-600">{item.color}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-[13px] font-semibold text-slate-800">{item.stock}</td>
                          <td className="px-4 py-3.5">
                            <span className={`text-[12px] font-medium ${item.reservedStock > 0 ? "text-blue-600" : "text-slate-500"}`}>
                              {item.reservedStock}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-[13px] font-semibold ${
                              item.availableStock <= 0
                                ? "text-red-500"
                                : item.availableStock <= item.lowStockThreshold
                                ? "text-amber-600"
                                : "text-emerald-600"
                            }`}>
                              {item.availableStock}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-[12px] text-slate-600">{item.lowStockThreshold}</td>
                          <td className="px-4 py-3.5">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => setEditItem(item)}
                              className="text-[11px] text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-400 px-2.5 py-1 rounded-lg transition-all duration-150 whitespace-nowrap"
                            >
                              Adjust
                            </button>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-[12px] text-slate-500">
                Page {page} of {totalPages} · {total} total
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-[12px] border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 text-[12px] border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Edit modal */}
      {editItem && (
        <EditModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={fetchInventory}
        />
      )}
    </div>
  );
}
