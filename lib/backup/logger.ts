// Lightweight logger for the backup subsystem.
// Intentionally standalone — no Sentry dependency — so backup scripts run
// outside the Next.js runtime without import errors.

type Meta  = Record<string, unknown>;
type Level = "info" | "warn" | "error";

const SERVICE = "backup";
const isDev   = process.env.NODE_ENV !== "production";

const COLORS: Record<Level, string> = {
  info:  "\x1b[36m",
  warn:  "\x1b[33m",
  error: "\x1b[31m",
};
const RESET = "\x1b[0m";

function write(level: Level, message: string, meta?: Meta): void {
  const payload = { ts: new Date().toISOString(), level, service: SERVICE, message, ...meta };

  if (isDev) {
    const suffix = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    const line   = `${COLORS[level]}[${level.toUpperCase()}]${RESET} [${SERVICE}] ${message}${suffix}`;
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
  } else {
    if (level === "error") console.error(JSON.stringify(payload));
    else if (level === "warn") console.warn(JSON.stringify(payload));
    else console.log(JSON.stringify(payload));
  }
}

export const log = {
  info(message: string, meta?: Meta): void {
    write("info", message, meta);
  },
  warn(message: string, meta?: Meta): void {
    write("warn", message, meta);
  },
  error(message: string, err?: unknown, meta?: Meta): void {
    const errMeta: Meta =
      err instanceof Error
        ? { errorName: err.name, errorMessage: err.message }
        : err !== undefined
          ? { errorRaw: String(err) }
          : {};
    write("error", message, { ...errMeta, ...meta });
  },
};
