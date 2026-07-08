"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function AdminError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, { tags: { area: "admin" } });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-slate-800 mb-2">
          An error occurred
        </h1>
        <p className="text-sm text-slate-600 mb-1 leading-relaxed">
          Something went wrong in the admin panel. The error has been reported.
        </p>
        {error.digest && (
          <p className="text-xs text-slate-500 mb-6">Ref: {error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={unstable_retry}
            className="px-5 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = "/admin"}
            className="px-5 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Reload admin
          </button>
        </div>
      </div>
    </div>
  );
}
