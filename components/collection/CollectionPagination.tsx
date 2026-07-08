"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface CollectionPaginationProps {
  currentPage: number;
  totalPages:  number;
}

export default function CollectionPagination({
  currentPage,
  totalPages,
}: CollectionPaginationProps) {
  const router      = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    router.push(qs ? `?${qs}` : "?", { scroll: true });
  }

  // Build page number sequence with ellipsis
  function pageNumbers(): (number | "…")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "…")[] = [];
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    const start = Math.max(2, currentPage - 1);
    const end   = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  }

  const chevronCls = "w-4 h-4";

  return (
    <div className="flex items-center justify-center gap-1">

      {/* Prev */}
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="w-9 h-9 flex items-center justify-center text-[var(--muted)] hover:text-[var(--accent)] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={chevronCls}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Page numbers */}
      {pageNumbers().map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="w-9 h-9 flex items-center justify-center text-[12px] text-[var(--muted)] select-none"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p)}
            aria-label={`Page ${p}`}
            aria-current={p === currentPage ? "page" : undefined}
            className={`w-9 h-9 flex items-center justify-center text-[12px] tracking-[0.08em] transition-colors ${
              p === currentPage
                ? "bg-[var(--black)] text-white"
                : "text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--bg)]"
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="w-9 h-9 flex items-center justify-center text-[var(--muted)] hover:text-[var(--accent)] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={chevronCls}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>

    </div>
  );
}
