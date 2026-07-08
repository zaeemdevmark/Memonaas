import path from "path";

export interface BackupConfig {
  backupPath:    string;
  retentionDays: number;
  databaseUrl:   string;
  pgDumpBin:     string;
  pgRestoreBin:  string;
}

export interface PgConnParams {
  host:     string;
  port:     number;
  database: string;
  user:     string;
  password: string;
  ssl:      boolean;
}

export function getConfig(): BackupConfig {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL environment variable is required");

  const rawRetention = parseInt(process.env.BACKUP_RETENTION_DAYS ?? "30", 10);

  return {
    backupPath:    process.env.BACKUP_PATH    ?? path.join(process.cwd(), "backups"),
    retentionDays: Number.isFinite(rawRetention) && rawRetention > 0 ? rawRetention : 30,
    databaseUrl,
    pgDumpBin:    process.env.PG_DUMP_BIN    ?? "pg_dump",
    pgRestoreBin: process.env.PG_RESTORE_BIN ?? "pg_restore",
  };
}

export function parseDbUrl(url: string): PgConnParams {
  const u = new URL(url);
  return {
    host:     u.hostname || "localhost",
    port:     parseInt(u.port || "5432", 10),
    database: u.pathname.replace(/^\//, "").split("?")[0] || "postgres",
    user:     decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    ssl:      url.includes("sslmode=require") || url.includes("ssl=true"),
  };
}

export function redactDbUrl(url: string): string {
  try {
    const u = new URL(url);
    u.password = "***";
    return u.toString();
  } catch {
    return "[redacted]";
  }
}
