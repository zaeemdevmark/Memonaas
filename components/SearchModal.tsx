"use client";

import { useEffect, useState, useRef } from "react";
import { useUIStore } from "@/store/uiStore";
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
      <div className="aspect-[3/4] rounded-[10px] bg-[#EFEFEF]" />
      <div className="mt-3 flex justify-between items-center gap-3">
        <div className="h-2.5 w-1/2 bg-[#EFEFEF] rounded" />
        <div className="h-2.5 w-1/4 bg-[#EFEFEF] rounded" />
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[23px] font-medium text-[var(--black)] mb-[20px]">
      {children}
    </h3>
  );
}

export default function SearchModal() {
  const { isSearchOpen, closeSearch } = useUIStore();
  const [query, setQuery]             = useState("");
  const [results, setResults]         = useState<Product[]>([]);
  const [featured, setFeatured]       = useState<Product[]>([]);
  const [isLoading, setIsLoading]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ESC key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeSearch(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeSearch]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isSearchOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isSearchOpen]);

  // Auto-focus + reset + fetch featured on open
  useEffect(() => {
    if (isSearchOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      // Fetch latest products for the default empty state
      fetch("/api/search")
        .then((r) => r.json())
        .then((data: Product[]) => setFeatured(data.slice(0, 8)))
        .catch(() => {});
      return () => clearTimeout(t);
    } else {
      setQuery("");
      setResults([]);
      setIsLoading(false);
    }
  }, [isSearchOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        .then((r) => r.json())
        .then((data: Product[]) => {
          setResults(data);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }, 320);
    return () => clearTimeout(t);
  }, [query]);

  const hasQuery = query.trim().length > 0;

  return (
    <div
      className={`fixed inset-0 z-[70] bg-white flex flex-col transition-all duration-300 ease-out ${
        isSearchOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      {/* ── Search Bar ── */}
      <div
        className={`border-b border-[#E8E8E8] shrink-0 transition-transform duration-300 ease-out ${
          isSearchOpen ? "translate-y-0" : "-translate-y-3"
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-5 flex items-center gap-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 shrink-0 text-[var(--muted)]">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products…"
            className="flex-1 text-xl sm:text-2xl text-[var(--black)] placeholder-[#CCCCCC] bg-transparent outline-none leading-none"
            aria-label="Search products"
          />

          {hasQuery && (
            <button onClick={() => setQuery("")} className="text-[var(--muted)] hover:text-[var(--black)] transition-colors shrink-0" aria-label="Clear search">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <div className="w-px h-5 bg-[#E8E8E8] shrink-0" />

          <button onClick={closeSearch} className="text-[var(--muted)] hover:text-[var(--black)] transition-colors shrink-0 flex items-center gap-1.5" aria-label="Close search">
            <span className="hidden sm:inline text-[10px] tracking-[0.2em] uppercase">Close</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div
        className={`flex-1 overflow-y-auto transition-all duration-300 ease-out delay-75 ${
          isSearchOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <div className="px-[30px] py-8">

          {/* Loading skeletons */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 mt-8">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Search results */}
          {!isLoading && hasQuery && (
            results.length > 0 ? (
              <>
                <h3 className="text-[23px] font-medium text-[var(--black)] mb-[20px]">
                  {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 mt-8">
                  {results.map((p) => (
                    <div key={p.slug} onClick={closeSearch}>
                      <ProductCard {...p} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-[#CCCCCC]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <p className="text-2xl font-light text-[var(--black)]">No products found</p>
                <p className="text-[12px] text-[var(--muted)]">
                  Try a different search term or&nbsp;
                  <button onClick={() => setQuery("")} className="underline hover:text-[var(--black)] transition-colors">
                    browse all products
                  </button>.
                </p>
              </div>
            )
          )}

          {/* Default state — show latest products */}
          {!isLoading && !hasQuery && featured.length > 0 && (
            <div>
              <SectionHeading>New Arrivals</SectionHeading>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 mt-8">
                {featured.map((p) => (
                  <div key={p.slug} onClick={closeSearch}>
                    <ProductCard {...p} />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
