"use client";

import { useState, useEffect, useCallback } from "react";
import type { CustomerSummaryDTO, CustomerDetailDTO } from "@/lib/types/customer";

// ── Helpers ───────────────────────────────────────────────────────

function fp(n: number) {
  return `Rs. ${Math.round(n).toLocaleString("en-PK")}`;
}

function fdate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

function inits(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

// ── Skeleton ──────────────────────────────────────────────────────

function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />;
}

// ── Status badge ──────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending:    "bg-amber-50 text-amber-600 ring-1 ring-amber-200",
    Processing: "bg-blue-50 text-blue-600 ring-1 ring-blue-200",
    Shipped:    "bg-violet-50 text-violet-600 ring-1 ring-violet-200",
    Delivered:  "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200",
    Cancelled:  "bg-red-50 text-red-500 ring-1 ring-red-200",
  };
  return (
    <span className={`text-[10px] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full ${styles[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

// ── Customer Detail Modal ─────────────────────────────────────────

function CustomerDetailModal({ id, onClose }: { id: string; onClose: () => void }) {
  const [detail,  setDetail]  = useState<CustomerDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetch(`/api/admin/customers/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setDetail(d.data); else setError(d.error); })
      .catch(() => setError("Failed to load customer"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-[14px] font-semibold text-slate-800">Customer Details</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading && (
            <div className="space-y-3">
              <Sk className="h-6 w-48" /><Sk className="h-4 w-64" /><Sk className="h-4 w-40" />
              <div className="grid grid-cols-3 gap-4 pt-2">
                {[0,1,2].map(i => <Sk key={i} className="h-16" />)}
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-[13px]">{error}</p>}

          {detail && (
            <>
              {/* Profile */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <span className="text-[16px] font-semibold text-slate-600">{inits(detail.name)}</span>
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-slate-800">{detail.name}</p>
                  <p className="text-[12px] text-slate-600">{detail.email}</p>
                  {detail.phone && <p className="text-[12px] text-slate-600">{detail.phone}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    {detail.isRegistered ? (
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 px-2 py-0.5 rounded-full">Registered</span>
                    ) : (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Guest</span>
                    )}
                    <span className="text-[11px] text-slate-500">Since {fdate(detail.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total Orders", value: detail.totalOrders },
                  { label: "Total Spent",  value: fp(detail.totalSpent) },
                  { label: "Avg. Order",   value: detail.avgOrderValue != null ? fp(detail.avgOrderValue) : "—" },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-[16px] font-semibold text-slate-800">{s.value}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Orders */}
              {detail.orders.length > 0 && (
                <div>
                  <h3 className="text-[12px] font-semibold text-slate-800 mb-3">Order History</h3>
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    {detail.orders.map((o, i) => (
                      <div key={o.id} className={`flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors ${i > 0 ? "border-t border-slate-50" : ""}`}>
                        <div>
                          <p className="text-[12px] font-medium text-slate-700">#{o.orderNumber}</p>
                          <p className="text-[10px] text-slate-500">{fdate(o.createdAt)} · {o.totalItems} item{o.totalItems !== 1 ? "s" : ""}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={o.status} />
                          <span className="text-[12px] font-medium text-slate-700">{fp(o.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Addresses */}
              {detail.addresses.length > 0 && (
                <div>
                  <h3 className="text-[12px] font-semibold text-slate-800 mb-3">Saved Addresses</h3>
                  <div className="space-y-2">
                    {detail.addresses.map((a) => (
                      <div key={a.id} className="bg-slate-50 rounded-xl px-4 py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[12px] font-medium text-slate-700">{a.fullName}</p>
                            <p className="text-[11px] text-slate-600">{a.street}, {a.city}, {a.province} {a.postalCode}</p>
                            <p className="text-[11px] text-slate-500">{a.phone}</p>
                          </div>
                          {a.isDefault && (
                            <span className="text-[9px] bg-blue-50 text-blue-600 ring-1 ring-blue-200 px-1.5 py-0.5 rounded-full shrink-0">Default</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Section ──────────────────────────────────────────────────

export default function CustomersSection() {
  const [customers, setCustomers] = useState<CustomerSummaryDTO[]>([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState("");
  const [query,     setQuery]     = useState("");
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState<string | null>(null);

  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sp  = new URLSearchParams({ page: String(page), limit: String(LIMIT), search: query });
      const res = await fetch(`/api/admin/customers?${sp}`);
      const d   = await res.json();
      if (d.success) {
        setCustomers(d.data);
        setTotal(d.pagination?.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => { load(); }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="space-y-5">
      {selected && <CustomerDetailModal id={selected} onClose={() => setSelected(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-800">Customers</h2>
          <p className="text-[12px] text-slate-600 mt-0.5">{total.toLocaleString()} total</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone…"
            className="border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-slate-700 placeholder-slate-400 outline-none focus:border-slate-400 min-w-[220px]"
          />
          <button type="submit" className="bg-slate-800 text-white text-[12px] font-medium px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
            Search
          </button>
          {query && (
            <button type="button" onClick={() => { setSearch(""); setQuery(""); setPage(1); }}
              className="text-slate-500 hover:text-slate-700 text-[12px] px-2 transition-colors">
              Clear
            </button>
          )}
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Sk key={i} className="h-12 w-full" />)}
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
            <p className="text-[13px] font-medium text-slate-700">{query ? "No customers found" : "No customers yet"}</p>
            <p className="text-[12px] text-slate-500 mt-1">{query ? "Try a different search term" : "Customers appear here after their first order"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Customer", "Email", "Phone", "Orders", "Total Spent", "Status", "Joined", ""].map((h) => (
                    <th key={h} className="text-left text-[10px] tracking-[0.1em] uppercase text-slate-500 font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={c.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i === customers.length - 1 ? "border-0" : ""}`}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-semibold text-slate-600">{inits(c.name)}</span>
                        </div>
                        <span className="text-[12px] font-medium text-slate-700 whitespace-nowrap">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[12px] text-slate-600 whitespace-nowrap">{c.email}</td>
                    <td className="px-4 py-3.5 text-[12px] text-slate-600 whitespace-nowrap">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3.5 text-[12px] font-medium text-slate-700 text-center">{c.totalOrders}</td>
                    <td className="px-4 py-3.5 text-[12px] font-medium text-slate-700 whitespace-nowrap">{fp(c.totalSpent)}</td>
                    <td className="px-4 py-3.5">
                      {c.isRegistered ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 px-2 py-0.5 rounded-full">Registered</span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Guest</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-[12px] text-slate-500 whitespace-nowrap">{fdate(c.createdAt)}</td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => setSelected(c.id)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-medium transition-colors whitespace-nowrap">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-slate-600">Page {page} of {totalPages} · {total} customers</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Previous
            </button>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
