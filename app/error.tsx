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
      <p className="text-[11px] tracking-[0.3em] uppercase text-[#999] mb-6">
        Error 500
      </p>
      <h1
        className="text-5xl sm:text-7xl font-light text-[#111] leading-none mb-4"
      >
        Something went wrong
      </h1>
      <p className="text-[14px] text-[#666] max-w-sm leading-relaxed mb-10">
        An unexpected error occurred. Our team has been notified.
        {error.digest && (
          <span className="block mt-2 text-[11px] text-[#aaa]">
            Ref: {error.digest}
          </span>
        )}
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <button
          onClick={unstable_retry}
          className="text-[11px] tracking-widest uppercase bg-[#111] text-white px-8 py-3 hover:bg-[#333] transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-[11px] tracking-widest uppercase text-[#111] border-b border-[#111] pb-0.5 hover:opacity-60 transition-opacity"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}
