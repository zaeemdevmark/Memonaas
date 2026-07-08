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
        <title>Memonaas — Error</title>
        <style>{`
          body { margin: 0; font-family: Georgia, 'Times New Roman', serif; background: #F7F3EE; color: #1F1B18; }
          .container { display: flex; flex-direction: column; align-items: center;
                       justify-content: center; min-height: 100dvh; padding: 2rem; text-align: center; }
          h1 { font-size: clamp(2rem, 8vw, 4rem); font-weight: 400; letter-spacing: 0.02em; margin: 0 0 1rem; }
          p  { font-size: 0.875rem; color: #6B6560; max-width: 24rem; line-height: 1.6; margin: 0 0 2.5rem; }
          button { font-size: 0.6875rem; letter-spacing: 0.2em; text-transform: uppercase;
                   background: #1F1B18; color: #F7F3EE; border: none; padding: 0.75rem 2rem;
                   cursor: pointer; transition: background 0.2s; }
          button:hover { background: #7A3F28; }
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
                <span style={{ fontSize: "0.6875rem", color: "#9C948C" }}>
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
