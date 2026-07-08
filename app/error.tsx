"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] tracking-[0.3em] uppercase text-[var(--muted)] mb-6">
        Error 500
      </p>
      <h1
        className="font-display text-5xl sm:text-7xl text-[var(--ink)] leading-none mb-4"
      >
        Something went wrong
      </h1>
      <p className="text-[14px] text-[var(--muted)] max-w-sm leading-relaxed mb-10">
        An unexpected error occurred. Our team has been notified.
        {error.digest && (
          <span className="block mt-2 text-[11px] text-[var(--muted)]">
            Ref: {error.digest}
          </span>
        )}
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <button
          onClick={unstable_retry}
          className="text-[11px] tracking-widest uppercase bg-[var(--ink)] text-[var(--surface)] px-8 py-3 hover:bg-[var(--accent-ink)] transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-[11px] tracking-widest uppercase text-[var(--ink)] border-b border-[var(--ink)] pb-0.5 hover:opacity-60 transition-opacity"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
