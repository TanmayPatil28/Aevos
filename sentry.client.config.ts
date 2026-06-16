import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://placeholder@sentry.io/123456",
  tracesSampleRate: 1.0,
  debug: false,
});
