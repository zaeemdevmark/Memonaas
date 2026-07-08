"use client";

import { useState, useEffect, useCallback } from "react";
import type { AdminReviewDTO }              from "@/lib/types/review";

// ── Types ─────────────────────────────────────────────────────────

type StatusFilter = "all" | "pending" | "approved";

interface ApiResponse<T> {
  success: boolean;
  data?:   T;
  error?:  string;
}

interface ReviewsPayload {
  reviews:    AdminReviewDTO[];
  pagination: { total: number; totalPages: number; page: number; limit: number };
  totalPages: number;
}

// ── Helpers ───────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 24 24" className="w-3 h-3" aria-hidden>
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={rating >= n ? "#0f172a" : "transparent"} stroke="#0f172a" strokeWidth="1.5"
          />
        </svg>
      ))}
    </span>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────

function Sk({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className}`} />;
}

function ReviewSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-4">
          <Sk className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Sk className="h-3.5 w-40" />
            <Sk className="h-3 w-28" />
            <Sk className="h-3 w-full" />
          </div>
          <div className="shrink-0 flex gap-2">
            <Sk className="h-7 w-16 rounded-lg" />
            <Sk className="h-7 w-16 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Review Row ─────────────────────────────────────────────────────

function ReviewRow({
  review,
  onApprove,
  onHide,
  onDelete,
}: {
  review:    AdminReviewDTO;
  onApprove: () => void;
  onHide:    () => void;
  onDelete:  () => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow duration-150">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
          <span className="text-[11px] font-medium text-slate-600">
            {review.user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[13px] font-medium text-slate-800">{review.user.name}</span>
            <span className="text-[11px] text-slate-500">→</span>
            <span className="text-[12px] text-blue-600 truncate max-w-[180px]">{review.product.name}</span>
            {review.isVerified && (
              <span className="text-[9px] tracking-[0.08em] uppercase text-emerald-600 border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 rounded">
                Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mb-2">
            <Stars rating={review.rating} />
            <span className="text-[11px] text-slate-500">
              {new Date(review.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span className={`text-[9px] tracking-[0.08em] uppercase px-1.5 py-0.5 rounded ${
              review.isApproved
                ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                : "bg-amber-50 text-amber-600 ring-1 ring-amber-200"
            }`}>
              {review.isApproved ? "Approved" : "Pending"}
            </span>
          </div>

          {review.title && (
            <p className="text-[12px] font-medium text-slate-700 mb-0.5">{review.title}</p>
          )}
          {review.body && (
            <p className="text-[12px] text-slate-600 leading-relaxed line-clamp-3">{review.body}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {!review.isApproved ? (
            <button
              onClick={onApprove}
              className="px-3 py-1.5 text-[11px] tracking-[0.05em] font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              Approve
            </button>
          ) : (
            <button
              onClick={onHide}
              className="px-3 py-1.5 text-[11px] tracking-[0.05em] font-medium bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
            >
              Hide
            </button>
          )}
          <button
            onClick={onDelete}
            className="px-3 py-1.5 text-[11px] tracking-[0.05em] font-medium bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Modal ───────────────────────────────────────────────────

function DeleteModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => Promise<void>;
  onCancel:  () => void;
}) {
  const [working, setWorking] = useState(false);
  const [error,   setError]   = useState("");

  async function go() {
    setWorking(true);
    setError("");
    try { await onConfirm(); } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete review");
    } finally { setWorking(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
        <h3 className="text-[15px] font-semibold text-slate-800 mb-1">Delete Review?</h3>
        <p className="text-[13px] text-slate-600 mb-4">This action cannot be undone.</p>
        {error && <p className="text-[12px] text-red-500 mb-4">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={go} disabled={working}
            className="flex-1 py-2.5 text-[12px] tracking-wider uppercase font-medium bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
          >
            {working ? "Deleting…" : "Delete"}
          </button>
          <button
            onClick={onCancel} disabled={working}
            className="flex-1 py-2.5 text-[12px] tracking-wider uppercase text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Section ──────────────────────────────────────────────────

export default function ReviewsSection() {
  const [reviews,    setReviews]    = useState<AdminReviewDTO[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [status,     setStatus]     = useState<StatusFilter>("pending");
  const [search,     setSearch]     = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);
  const [deleteId,   setDeleteId]   = useState<string | null>(null);
  const [toasting,   setToasting]   = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchReviews = useCallback(async (p = 1) => {
    setLoading(true);
    setError("");
    try {
      const q   = new URLSearchParams({ status, page: String(p), limit: "20" });
      if (debouncedQ.trim()) q.set("search", debouncedQ.trim());
      const res  = await fetch(`/api/reviews?${q}`);
      const json = await res.json() as ApiResponse<ReviewsPayload>;
      if (!json.success || !json.data) throw new Error(json.error ?? "Failed to load reviews");
      setReviews(json.data.reviews);
      setTotal(json.data.pagination.total);
      setTotalPages(json.data.totalPages);
      setPage(p);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [status, debouncedQ]);

  useEffect(() => { fetchReviews(1); }, [fetchReviews]);

  function showToast(msg: string) {
    setToasting(msg);
    setTimeout(() => setToasting(""), 2500);
  }

  async function handleModerate(id: string, isApproved: boolean) {
    const res  = await fetch(`/api/reviews/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ isApproved }),
    });
    const json = await res.json() as ApiResponse<unknown>;
    if (!json.success) throw new Error(json.error ?? "Failed to moderate review");
    showToast(isApproved ? "Review approved" : "Review hidden");
    await fetchReviews(page);
  }

  async function handleDelete() {
    if (!deleteId) return;
    const res  = await fetch(`/api/reviews/${deleteId}`, { method: "DELETE" });
    const json = await res.json() as ApiResponse<unknown>;
    if (!json.success) throw new Error(json.error ?? "Failed to delete review");
    showToast("Review deleted");
    setDeleteId(null);
    await fetchReviews(page === 1 ? 1 : reviews.length === 1 ? page - 1 : page);
  }

  const TABS: { id: StatusFilter; label: string }[] = [
    { id: "pending",  label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "all",      label: "All" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Reviews</h1>
        <p className="text-[13px] text-slate-600 mt-0.5">Moderate customer reviews before they appear on product pages.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setStatus(t.id); setPage(1); }}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-all ${
                status === t.id
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
            className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text" placeholder="Search reviews…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-8 pr-3 py-2 text-[12px] border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors bg-white"
          />
        </div>

        {total > 0 && (
          <span className="text-[12px] text-slate-500 ml-auto shrink-0">{total} review{total !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[13px] text-red-600">
          {error}
          <button onClick={() => fetchReviews(page)} className="ml-auto underline text-[12px]">Retry</button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <ReviewSkeleton />
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>
          </div>
          <p className="text-[13px] text-slate-600">No {status !== "all" ? status : ""} reviews found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <ReviewRow
              key={r.id}
              review={r}
              onApprove={() => handleModerate(r.id, true).catch(() => {})}
              onHide={() => handleModerate(r.id, false).catch(() => {})}
              onDelete={() => setDeleteId(r.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={page <= 1 || loading}
            onClick={() => fetchReviews(page - 1)}
            className="px-3 py-1.5 text-[12px] border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-[12px] text-slate-600">{page} / {totalPages}</span>
          <button
            disabled={page >= totalPages || loading}
            onClick={() => fetchReviews(page + 1)}
            className="px-3 py-1.5 text-[12px] border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* Toast */}
      {toasting && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white text-[13px] px-5 py-2.5 rounded-full shadow-lg animate-[fadeIn_0.2s_ease-out]">
          {toasting}
        </div>
      )}
    </div>
  );
}
