import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found | Memonaas",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] tracking-[0.3em] uppercase text-[#999] mb-6">
        Error 404
      </p>
      <h1
        className="text-6xl sm:text-8xl font-light text-[#111] leading-none mb-4"
      >
        Not Found
      </h1>
      <p className="text-[14px] text-[#666] max-w-sm leading-relaxed mb-10">
        The page you&apos;re looking for has been moved, deleted, or never existed.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <Link
          href="/"
          className="text-[11px] tracking-widest uppercase bg-[#111] text-white px-8 py-3 hover:bg-[#333] transition-colors"
        >
          Return home
        </Link>
        <Link
          href="/shop"
          className="text-[11px] tracking-widest uppercase text-[#111] border-b border-[#111] pb-0.5 hover:opacity-60 transition-opacity"
        >
          Shop all
        </Link>
      </div>
    </div>
  );
}
