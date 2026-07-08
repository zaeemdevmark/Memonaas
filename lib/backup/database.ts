import { spawn }  from "child_process";
import path        from "path";
import fs          from "fs/promises";
import crypto      from "crypto";
import { Client }  from "pg";
import { parseDbUrl, redactDbUrl, type BackupConfig } from "./config";
import { computeChecksum }                            from "./validation";
import { ensureDir }                                  from "./storage/local";

// ── Utilities ───────────────────────────────────────────────────────────────

function newId(): string {
  return crypto.randomUUID();
}

function fileTimestamp(): string {
  // YYYYMMDDHHmmss — safe for all file systems
  return new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
}

// Safely double-quote a PostgreSQL identifier.
// Only allows names from information_schema (trusted), but validates anyway
// to guard against any edge-case injection.
function eid(name: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error(`Unsafe SQL identifier: "${name}"`);
  }
  return `"${name}"`;
}

/** Read the latest Prisma migration name from prisma/migrations/. */
export async function getSchemaVersion(): Promise<string> {
  try {
    const dir     = path.join(process.cwd(), "prisma", "migrations");
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const dirs    = entries
      .filter(e => e.isDirectory() && /^\d{14}_/.test(e.name))
      .map(e => e.name)
      .sort();
    return dirs[dirs.length - 1] ?? "unknown";
  } catch {
    return "unknown";
  }
}

// ── pg_dump / pg_restore wrappers ────────────────────────────────────────────

function spawnWithPassword(
  bin:      string,
  args:     string[],
  password: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, {
      env: { ...process.env, PGPASSWORD: password },
    });

    const stderrLines: string[] = [];
    child.stderr.on("data", (d: Buffer) => {
      const line = d.toString().trim();
      if (line) stderrLines.push(line);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${bin} exited with code ${code}:\n${stderrLines.join("\n")}`));
      }
    });

    child.on("error", (e) => {
      reject(new Error(
        `Failed to start "${bin}": ${e.message}\n` +
        `Ensure pg_dump/pg_restore is in PATH or set PG_DUMP_BIN / PG_RESTORE_BIN.`,
      ));
    });
  });
}

async function execPgDump(
  config:     BackupConfig,
  outputFile: string,
): Promise<void> {
  const p = parseDbUrl(config.databaseUrl);
  await ensureDir(path.dirname(outputFile));
  await spawnWithPassword(
    config.pgDumpBin,
    [
      `--host=${p.host}`,
      `--port=${p.port}`,
      `--username=${p.user}`,
      `--dbname=${p.database}`,
      "--format=custom",  // compressed binary — restored with pg_restore
      "--compress=6",     // zlib level 6 balances speed and size
      "--no-password",    // password is supplied via PGPASSWORD env var
      `--file=${outputFile}`,
    ],
    p.password,
  );
}

async function execPgRestore(
  config:     BackupConfig,
  backupFile: string,
): Promise<void> {
  const p = parseDbUrl(config.databaseUrl);
  await spawnWithPassword(
    config.pgRestoreBin,
    [
      `--host=${p.host}`,
      `--port=${p.port}`,
      `--username=${p.user}`,
      `--dbname=${p.database}`,
      "--clean",         // drop existing objects before restoring
      "--if-exists",     // suppress errors when dropping non-existent objects
      "--no-password",
      "--exit-on-error",
      backupFile,
    ],
    p.password,
  );
}

// ── Incremental backup via pg client ─────────────────────────────────────────

interface TableEntry {
  table:    string;  // exact table name from information_schema
  trackCol: string;  // column used to detect changes (updatedAt | createdAt)
}

/** Discover all public tables that carry a timestamp column for change tracking. */
async function discoverTrackableTables(client: Client): Promise<TableEntry[]> {
  // Exclude Prisma's internal migration table
  const { rows: tables } = await client.query<{ table_name: string }>(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_type   = 'BASE TABLE'
       AND table_name NOT LIKE '\\_%' ESCAPE '\\'
     ORDER BY table_name`,
  );

  const result: TableEntry[] = [];

  for (const { table_name } of tables) {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table_name)) continue;

    // Prefer updatedAt → updated_at → createdAt → created_at, in that order
    const { rows: cols } = await client.query<{ column_name: string }>(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name   = $1
         AND column_name IN ('updatedAt', 'updated_at', 'createdAt', 'created_at')
       ORDER BY CASE column_name
                  WHEN 'updatedAt'   THEN 0
                  WHEN 'updated_at'  THEN 1
                  WHEN 'createdAt'   THEN 2
                  WHEN 'created_at'  THEN 3
                END`,
      [table_name],
    );

    if (cols.length > 0) {
      result.push({ table: table_name, trackCol: cols[0].column_name });
    }
  }

  return result;
}

/** Get primary key columns for a table (used for UPSERT during restore). */
async function getPrimaryKeys(client: Client, table: string): Promise<string[]> {
  const { rows } = await client.query<{ column_name: string }>(
    `SELECT kcu.column_name
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema    = kcu.table_schema
     WHERE tc.table_schema   = 'public'
       AND tc.table_name     = $1
       AND tc.constraint_type = 'PRIMARY KEY'
     ORDER BY kcu.ordinal_position`,
    [table],
  );
  return rows.map(r => r.column_name);
}

// ── Public API ───────────────────────────────────────────────────────────────

export interface FullBackupResult {
  filePath:   string;
  checksum:   string;
  sizeBytes:  number;
  schema:     string;
}

export async function runFullBackup(
  config:    BackupConfig,
  outputDir: string,
): Promise<FullBackupResult> {
  const ts       = fileTimestamp();
  const id       = newId().slice(0, 8);
  const filePath = path.join(outputDir, `full_${ts}_${id}.dump`);
  const schema   = await getSchemaVersion();

  await execPgDump(config, filePath);

  const checksum            = await computeChecksum(filePath);
  const { size: sizeBytes } = await fs.stat(filePath);

  return { filePath, checksum, sizeBytes, schema };
}

export interface IncrementalTableData {
  table:    string;
  trackCol: string;
  rows:     Record<string, unknown>[];
}

export interface IncrementalBackupFile {
  version:    1;
  type:       "incremental";
  since:      string;   // ISO — rows changed at or after this time were captured
  capturedAt: string;   // ISO
  basedOn:    string;   // parent full-backup ID
  tables:     IncrementalTableData[];
}

export interface IncrementalBackupResult {
  filePath:      string;
  checksum:      string;
  sizeBytes:     number;
  schema:        string;
  tablesChanged: string[];
  rowCount:      number;
}

export async function runIncrementalBackup(
  config:    BackupConfig,
  outputDir: string,
  since:     Date,
  basedOn:   string,
): Promise<IncrementalBackupResult> {
  const p      = parseDbUrl(config.databaseUrl);
  const client = new Client({
    host:     p.host,
    port:     p.port,
    database: p.database,
    user:     p.user,
    password: p.password,
    ...(p.ssl ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  await client.connect();

  try {
    const schema  = await getSchemaVersion();
    const tables  = await discoverTrackableTables(client);
    const payload: IncrementalBackupFile = {
      version:    1,
      type:       "incremental",
      since:      since.toISOString(),
      capturedAt: new Date().toISOString(),
      basedOn,
      tables:     [],
    };

    const tablesChanged: string[] = [];
    let totalRows = 0;

    for (const { table, trackCol } of tables) {
      const { rows } = await client.query<Record<string, unknown>>(
        `SELECT * FROM ${eid(table)} WHERE ${eid(trackCol)} >= $1 ORDER BY ${eid(trackCol)}`,
        [since],
      );

      if (rows.length > 0) {
        payload.tables.push({ table, trackCol, rows });
        tablesChanged.push(table);
        totalRows += rows.length;
      }
    }

    const ts       = fileTimestamp();
    const id       = newId().slice(0, 8);
    const filePath = path.join(outputDir, `incremental_${ts}_${id}.json`);

    await ensureDir(outputDir);
    await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");

    const checksum            = await computeChecksum(filePath);
    const { size: sizeBytes } = await fs.stat(filePath);

    return { filePath, checksum, sizeBytes, schema, tablesChanged, rowCount: totalRows };
  } finally {
    await client.end();
  }
}

// ── Restore ──────────────────────────────────────────────────────────────────

export async function restoreFullBackup(
  config:     BackupConfig,
  backupFile: string,
): Promise<void> {
  await execPgRestore(config, backupFile);
}

export interface IncrementalRestoreResult {
  tablesRestored: string[];
  rowsUpserted:   number;
}

export async function applyIncrementalBackup(
  config:     BackupConfig,
  backupFile: string,
): Promise<IncrementalRestoreResult> {
  const raw     = await fs.readFile(backupFile, "utf8");
  const payload = JSON.parse(raw) as IncrementalBackupFile;

  const p      = parseDbUrl(config.databaseUrl);
  const client = new Client({
    host:     p.host,
    port:     p.port,
    database: p.database,
    user:     p.user,
    password: p.password,
    ...(p.ssl ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  await client.connect();

  const tablesRestored: string[] = [];
  let rowsUpserted = 0;

  try {
    for (const tableData of payload.tables) {
      const { table, rows } = tableData;
      if (!rows.length) continue;
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) continue;

      const pkColumns = await getPrimaryKeys(client, table);

      for (const row of rows) {
        // Only include columns with safe names (from our own backup — no user input)
        const cols     = Object.keys(row).filter(c => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(c));
        const colsSql  = cols.map(eid).join(", ");
        const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
        const values   = cols.map(c => row[c]);

        if (pkColumns.length === 0) {
          // No primary key — truncate table and bulk-insert (last resort)
          await client.query(`TRUNCATE TABLE ${eid(table)} CASCADE`);
          await client.query(
            `INSERT INTO ${eid(table)} (${colsSql}) VALUES (${placeholders})`,
            values,
          );
        } else {
          const pkConflict  = pkColumns.filter(c => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(c)).map(eid).join(", ");
          const nonPkCols   = cols.filter(c => !pkColumns.includes(c));
          const updateClause = nonPkCols.length > 0
            ? `DO UPDATE SET ${nonPkCols.map(c => `${eid(c)} = EXCLUDED.${eid(c)}`).join(", ")}`
            : "DO NOTHING";

          await client.query(
            `INSERT INTO ${eid(table)} (${colsSql}) VALUES (${placeholders})
             ON CONFLICT (${pkConflict}) ${updateClause}`,
            values,
          );
        }

        rowsUpserted++;
      }

      tablesRestored.push(table);
    }
  } finally {
    await client.end();
  }

  return { tablesRestored, rowsUpserted };
}
