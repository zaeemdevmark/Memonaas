"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  // Must include <html> and <body> — replaces the root layout when active
  return (
    <html lang="en">
      <head>
        <title>Nayab Posh — Error</title>
        <style>{`
          body { margin: 0; font-family: 'Poppins', sans-serif; background: #fff; color: #111; }
          .container { display: flex; flex-direction: column; align-items: center;
                       justify-content: center; min-height: 100dvh; padding: 2rem; text-align: center; }
          h1 { font-size: clamp(2rem, 8vw, 4rem); font-weight: 300; letter-spacing: 0.02em; margin: 0 0 1rem; }
          p  { font-size: 0.875rem; color: #666; max-width: 24rem; line-height: 1.6; margin: 0 0 2.5rem; }
          button { font-size: 0.6875rem; letter-spacing: 0.2em; text-transform: uppercase;
                   background: #111; color: #fff; border: none; padding: 0.75rem 2rem;
                   cursor: pointer; transition: background 0.2s; }
          button:hover { background: #333; }
        `}</style>
      </head>
      <body>
        <div className="container">
          <h1>Something went wrong</h1>
          <p>
            A critical error occurred. Our team has been notified.
            {error.digest && (
              <>
                <br />
                <span style={{ fontSize: "0.6875rem", color: "#aaa" }}>
                  Ref: {error.digest}
                </span>
              </>
            )}
          </p>
          <button onClick={unstable_retry}>Try again</button>
        </div>
      </body>
    </html>
  );
}
