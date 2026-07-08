import * as Sentry from "@sentry/nextjs";

// Client-side Sentry — runs before React hydration (Next.js 16+)
Sentry.init({
  dsn:              process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment:      process.env.NODE_ENV ?? "development",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  enabled:          Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
});

// Add Sentry navigation breadcrumbs on client-side route transitions
export function onRouterTransitionStart(url: string) {
  Sentry.addBreadcrumb({
    category: "navigation",
    message:  `Navigating to ${url}`,
    level:    "info",
  });
}
