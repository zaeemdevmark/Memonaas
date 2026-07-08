"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";

interface Product {
  slug:       string;
  name:       string;
  price:      string;
  salePrice?: string;
  soldOut?:   boolean;
  image?:     string;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] rounded-[10px] bg-[var(--accent-soft)]/40" />
      <div className="mt-3 flex justify-between items-center gap-3">
        <div className="h-2.5 w-1/2 bg-[var(--border)] rounded" />
        <div className="h-2.5 w-1/4 bg-[var(--border)] rounded" />
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0 text-[var(--muted)]">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function SearchPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [query, setQuery]       = useState(initialQ);
  const [results, setResults]   = useState<Product[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();

    const params = new URLSearchParams(window.location.search);
    if (trimmed) params.set("q", trimmed); else params.delete("q");
    router.replace(`/search${params.toString() ? `?${params}` : ""}`, { scroll: false });

    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setSearched(false);
      return;
    }

    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
        .then((r) => r.json())
        .then((data: Product[]) => {
          setResults(data);
          setLoading(false);
          setSearched(true);
        })
        .catch(() => setLoading(false));
    }, 320);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-10 md:py-16">
      <div className="max-w-xl">
        <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--accent)] font-medium mb-3">Search</p>
        <h1 className="font-display text-3xl md:text-4xl text-[var(--ink)] mb-6">
          What are you looking for?
        </h1>
        <div className="flex items-center gap-3 border-b border-[var(--ink)] pb-3">
          <SearchIcon />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products…"
            aria-label="Search products"
            className="flex-1 bg-transparent outline-none text-lg text-[var(--ink)] placeholder:text-[var(--muted)]"
          />
        </div>
      </div>

      <div className="mt-12">
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!isLoading && searched && (
          results.length > 0 ? (
            <>
              <p className="text-sm text-[var(--muted)] mb-6">
                {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query.trim()}&rdquo;
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
                {results.map((p) => (
                  <ProductCard key={p.slug} {...p} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
              <p className="font-display text-xl text-[var(--ink)]">No products found</p>
              <p className="text-sm text-[var(--muted)]">
                Try a different search term, or browse the{" "}
                <a href="/shop" className="underline hover:text-[var(--accent)] transition-colors">
                  full collection
                </a>.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageInner />
    </Suspense>
  );
}
