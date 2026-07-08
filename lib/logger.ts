import * as Sentry from "@sentry/nextjs";

type Meta  = Record<string, unknown>;
type Level = "debug" | "info" | "warn" | "error";

const SERVICE = "nayab-posh";
const isDev   = process.env.NODE_ENV !== "production";

const COLORS: Record<Level, string> = {
  debug: "\x1b[90m",
  info:  "\x1b[36m",
  warn:  "\x1b[33m",
  error: "\x1b[31m",
};
const RESET = "\x1b[0m";

function write(level: Level, message: string, meta?: Meta): void {
  const entry = { ts: new Date().toISOString(), level, service: SERVICE, message, ...meta };

  if (isDev) {
    const suffix = meta ? ` ${JSON.stringify(meta)}` : "";
    const line   = `${COLORS[level]}[${level.toUpperCase()}]${RESET} ${message}${suffix}`;
    if (level === "error")     console.error(line);
    else if (level === "warn") console.warn(line);
    else                       console.log(line);
  } else {
    if (level === "error")     console.error(JSON.stringify(entry));
    else if (level === "warn") console.warn(JSON.stringify(entry));
    else                       console.log(JSON.stringify(entry));
  }
}

export const logger = {
  debug(message: string, meta?: Meta): void {
    if (isDev) write("debug", message, meta);
  },

  info(message: string, meta?: Meta): void {
    write("info", message, meta);
  },

  warn(message: string, meta?: Meta): void {
    write("warn", message, meta);
    Sentry.addBreadcrumb({ message, level: "warning", data: meta });
  },

  error(message: string, error?: unknown, meta?: Meta): void {
    const errorMeta: Meta = {
      ...meta,
      ...(error instanceof Error
        ? { errorName: error.name, errorMessage: error.message }
        : error !== undefined
          ? { errorRaw: String(error) }
          : {}),
    };
    write("error", message, errorMeta);

    if (error instanceof Error) {
      Sentry.captureException(error, { extra: { message, ...meta } });
    } else {
      Sentry.captureMessage(message, { level: "error", extra: meta });
    }
  },
};

// Measure operation duration and log the result
export function startTimer() {
  const start = Date.now();
  return {
    elapsed: () => Date.now() - start,
    done(label: string, meta?: Meta): void {
      logger.info(label, { durationMs: Date.now() - start, ...meta });
    },
  };
}
