import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn:              process.env.SENTRY_DSN,
  environment:      process.env.NODE_ENV ?? "development",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  // No-op when DSN is absent — safe to leave enabled
  enabled:          Boolean(process.env.SENTRY_DSN),
});
