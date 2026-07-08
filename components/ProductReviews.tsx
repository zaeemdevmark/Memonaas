"use client";

import { useState, useEffect, useCallback } from "react";
import type { ReviewDTO, ReviewSummary, ProductReviewsResult } from "@/lib/types/review";

// ── Star helpers ───────────────────────────────────────────────────

function StarIcon({ filled, half = false }: { filled: boolean; half?: boolean }) {
  if (half) {
    return (
      <svg viewBox="0 0 24 24" className="w-4 h-4 inline-block" aria-hidden>
        <defs>
          <linearGradient id="half">
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="url(#half)" stroke="#0f172a" strokeWidth="1.5"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 inline-block" aria-hidden>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? "#0f172a" : "transparent"} stroke="#0f172a" strokeWidth="1.5"
      />
    </svg>
  );
}

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "w-6 h-6" : "w-4 h-4";
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 24 24" className={`${cls} inline-block`} aria-hidden>
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={rating >= n ? "#0f172a" : rating >= n - 0.5 ? "#666" : "transparent"}
            stroke="#0f172a" strokeWidth="1.5"
          />
        </svg>
      ))}
    </span>
  );
}

function ClickableStars({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n} type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5 focus:outline-none"
          aria-label={`${n} star${n !== 1 ? "s" : ""}`}
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7" aria-hidden>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={(hover || value) >= n ? "#0f172a" : "transparent"}
              stroke="#0f172a" strokeWidth="1.5"
            />
          </svg>
        </button>
      ))}
    </span>
  );
}

// ── Rating Summary ─────────────────────────────────────────────────

function RatingSummary({ summary }: { summary: ReviewSummary }) {
  const { averageRating, approvedReviews, distribution } = summary;
  const max = Math.max(...Object.values(distribution), 1);

  return (
    <div className="flex flex-col sm:flex-row gap-8 py-8 border-b border-[var(--border)]">
      {/* Big average */}
      <div className="flex flex-col items-center justify-center shrink-0 min-w-[120px]">
        <p className="text-5xl font-light text-[var(--black)] leading-none mb-2">
          {averageRating != null ? averageRating.toFixed(1) : "–"}
        </p>
        <Stars rating={averageRating ?? 0} size="sm" />
        <p className="text-[11px] text-[var(--muted)] tracking-[0.1em] uppercase mt-2">
          {approvedReviews} {approvedReviews === 1 ? "review" : "reviews"}
        </p>
      </div>

      {/* Distribution bars */}
      <div className="flex-1 space-y-1.5">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = distribution[star];
          const pct   = max > 0 ? (count / max) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-3">
              <span className="text-[12px] text-[var(--muted)] w-4 text-right shrink-0">{star}</span>
              <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0" aria-hidden>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="#0f172a" stroke="#0f172a" strokeWidth="1.5" />
              </svg>
              <div className="flex-1 bg-[#F0F0F0] h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--black)] rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[11px] text-[var(--muted)] w-5 shrink-0">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Review Card ────────────────────────────────────────────────────

function ReviewCard({
  review,
  onEdit,
  onDelete,
  isOwner,
}: {
  review:    ReviewDTO;
  onEdit?:   () => void;
  onDelete?: () => void;
  isOwner:   boolean;
}) {
  return (
    <div className="py-6 border-b border-[var(--border)]">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          {/* Avatar initials */}
          <div className="w-9 h-9 rounded-full bg-[#E8E8E8] flex items-center justify-center shrink-0">
            <span className="text-[11px] font-medium text-[var(--black)]">
              {review.user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
            </span>
          </div>
          <div>
            <p className="text-[13px] font-medium text-[var(--black)]">{review.user.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Stars rating={review.rating} size="sm" />
              {review.isVerified && (
                <span className="text-[10px] tracking-[0.08em] uppercase text-emerald-600 border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Verified Purchase
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] text-[var(--muted)]">
            {new Date(review.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          {isOwner && (
            <>
              {onEdit && (
                <button onClick={onEdit} className="text-[11px] text-[var(--muted)] hover:text-[var(--accent)] underline transition-colors">
                  Edit
                </button>
              )}
              {onDelete && (
                <button onClick={onDelete} className="text-[11px] text-red-400 hover:text-red-600 underline transition-colors">
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {review.title && (
        <p className="text-[13px] font-medium text-[var(--black)] mb-1">{review.title}</p>
      )}
      {review.body && (
        <p className="text-[13px] text-[var(--muted)] leading-relaxed">{review.body}</p>
      )}
      {!review.isApproved && (
        <p className="mt-2 text-[11px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded inline-block">
          Pending approval
        </p>
      )}
    </div>
  );
}

// ── Write / Edit Review Form ───────────────────────────────────────

interface ReviewFormProps {
  initial?: { rating: number; title: string; body: string };
  onSubmit: (data: { rating: number; title: string; body: string }) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

function ReviewForm({ initial, onSubmit, onCancel, submitLabel = "Submit Review" }: ReviewFormProps) {
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [title,  setTitle]  = useState(initial?.title  ?? "");
  const [body,   setBody]   = useState(initial?.body   ?? "");
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1 || rating > 5) { setError("Please select a rating"); return; }
    setError("");
    setSaving(true);
    try {
      await onSubmit({ rating, title: title.trim(), body: body.trim() });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-[11px] tracking-[0.15em] uppercase text-[var(--muted)] mb-2">Your Rating *</p>
        <ClickableStars value={rating} onChange={setRating} />
      </div>
      <div>
        <label className="text-[11px] tracking-[0.15em] uppercase text-[var(--muted)] block mb-1">
          Title (optional)
        </label>
        <input
          type="text" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarise your experience"
          className="w-full border border-[var(--border)] px-3 py-2.5 text-[13px] text-[var(--black)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--black)] transition-colors bg-white"
        />
      </div>
      <div>
        <label className="text-[11px] tracking-[0.15em] uppercase text-[var(--muted)] block mb-1">
          Review (optional)
        </label>
        <textarea
          rows={4} maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)}
          placeholder="Tell us about your experience with this product..."
          className="w-full border border-[var(--border)] px-3 py-2.5 text-[13px] text-[var(--black)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--black)] transition-colors bg-white resize-none"
        />
      </div>
      {error && <p className="text-[12px] text-red-500">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit" disabled={saving}
          className="px-6 py-2.5 text-[12px] tracking-[0.2em] uppercase font-medium bg-[var(--black)] text-white hover:bg-[#333] transition-colors duration-200 disabled:opacity-50"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
        <button
          type="button" onClick={onCancel}
          className="px-4 py-2.5 text-[12px] tracking-[0.15em] uppercase text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Main component ─────────────────────────────────────────────────

export default function ProductReviews({ productSlug }: { productSlug: string }) {
  const [data,         setData]         = useState<ProductReviewsResult | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [fetchError,   setFetchError]   = useState("");
  const [showForm,     setShowForm]     = useState(false);
  const [editingId,    setEditingId]    = useState<string | null>(null);
  const [page,         setPage]         = useState(1);
  const [deleteId,     setDeleteId]     = useState<string | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  const fetchReviews = useCallback(async (p = 1) => {
    setLoading(true);
    setFetchError("");
    try {
      const res  = await fetch(`/api/products/${productSlug}/reviews?page=${p}&limit=10`);
      const json = await res.json() as { success: boolean; data?: ProductReviewsResult; error?: string };
      if (!json.success || !json.data) throw new Error(json.error ?? "Failed to load reviews");
      setData(json.data);
      setPage(p);
    } catch (e: unknown) {
      setFetchError(e instanceof Error ? e.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [productSlug]);

  useEffect(() => { fetchReviews(1); }, [fetchReviews]);

  async function handleCreate(values: { rating: number; title: string; body: string }) {
    const res  = await fetch(`/api/products/${productSlug}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json() as { success: boolean; error?: string };
    if (!json.success) throw new Error(json.error ?? "Failed to submit review");
    setShowForm(false);
    await fetchReviews(1);
  }

  async function handleUpdate(values: { rating: number; title: string; body: string }) {
    if (!editingId) return;
    const res  = await fetch(`/api/reviews/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json() as { success: boolean; error?: string };
    if (!json.success) throw new Error(json.error ?? "Failed to update review");
    setEditingId(null);
    await fetchReviews(page);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res  = await fetch(`/api/reviews/${deleteId}`, { method: "DELETE" });
      const json = await res.json() as { success: boolean; error?: string };
      if (!json.success) throw new Error(json.error ?? "Failed to delete review");
      setDeleteId(null);
      await fetchReviews(1);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="border-t border-[var(--border)] pt-14 pb-10">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 bg-[#E8E8E8] rounded" />
          <div className="h-24 bg-[#F5F5F5] rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-[#F5F5F5] rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="border-t border-[var(--border)] pt-14 pb-10">
        <p className="text-[13px] text-red-500">{fetchError}</p>
      </div>
    );
  }

  if (!data) return null;

  const { reviews, summary, userReview, isAuthenticated, totalPages } = data;
  const editTarget = editingId ? (userReview?.id === editingId ? userReview : null) : null;

  return (
    <div className="border-t border-[var(--border)] pt-14 pb-10">

      {/* Section header */}
      <div className="flex items-center justify-between mb-2">
        <h2
          className="text-2xl sm:text-3xl font-light text-[var(--black)]"
        >
          Customer Reviews
        </h2>
        {isAuthenticated && !userReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-[12px] tracking-[0.15em] uppercase border border-[var(--black)] px-4 py-2 hover:bg-[var(--black)] hover:text-white transition-colors duration-200"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Rating summary */}
      {summary.approvedReviews > 0 || summary.totalReviews > 0 ? (
        <RatingSummary summary={summary} />
      ) : (
        <div className="py-6 border-b border-[var(--border)]">
          <p className="text-[13px] text-[var(--muted)]">No reviews yet. Be the first to review this product.</p>
        </div>
      )}

      {/* Write review form */}
      {showForm && isAuthenticated && !userReview && (
        <div className="py-8 border-b border-[var(--border)]">
          <h3 className="text-[13px] tracking-[0.15em] uppercase text-[var(--black)] mb-5">Write a Review</h3>
          <ReviewForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Not authenticated prompt */}
      {!isAuthenticated && (
        <div className="py-6 border-b border-[var(--border)]">
          <p className="text-[13px] text-[var(--muted)]">
            <a href="/login" className="text-[var(--black)] underline">Sign in</a> to write a review.
          </p>
        </div>
      )}

      {/* User's own review (pending approval) */}
      {userReview && (
        <div className="py-4 bg-[#FAFAFA] border border-[var(--border)] px-4 my-6 rounded-sm">
          <p className="text-[11px] tracking-[0.15em] uppercase text-[var(--muted)] mb-3">Your Review</p>
          {editingId === userReview.id && editTarget ? (
            <ReviewForm
              initial={{ rating: userReview.rating, title: userReview.title ?? "", body: userReview.body ?? "" }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingId(null)}
              submitLabel="Update Review"
            />
          ) : (
            <ReviewCard
              review={userReview}
              isOwner={true}
              onEdit={() => setEditingId(userReview.id)}
              onDelete={() => setDeleteId(userReview.id)}
            />
          )}
        </div>
      )}

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <div>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwner={review.id === userReview?.id}
              onEdit={review.id === userReview?.id ? () => setEditingId(review.id) : undefined}
              onDelete={review.id === userReview?.id ? () => setDeleteId(review.id) : undefined}
            />
          ))}
        </div>
      ) : (
        summary.approvedReviews === 0 && (
          <p className="py-6 text-[13px] text-[var(--muted)]">
            {summary.totalReviews > 0
              ? "Reviews are pending approval."
              : "No reviews yet."}
          </p>
        )
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            disabled={page <= 1}
            onClick={() => fetchReviews(page - 1)}
            className="text-[12px] tracking-[0.1em] uppercase text-[var(--muted)] hover:text-[var(--accent)] disabled:opacity-30 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-[12px] text-[var(--muted)] px-4">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => fetchReviews(page + 1)}
            className="text-[12px] tracking-[0.1em] uppercase text-[var(--muted)] hover:text-[var(--accent)] disabled:opacity-30 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-[15px] font-medium text-[var(--black)] mb-2">Delete Review?</h3>
            <p className="text-[13px] text-[var(--muted)] mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 text-[12px] tracking-[0.15em] uppercase bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button
                onClick={() => setDeleteId(null)} disabled={deleting}
                className="flex-1 py-2.5 text-[12px] tracking-[0.15em] uppercase border border-[var(--border)] text-[var(--black)] hover:bg-[#F5F5F5] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
