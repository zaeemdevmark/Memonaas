#!/usr/bin/env node
// Manual backup CLI — run via: npm run backup:[full|incremental|list|validate]
// Environment variables are loaded from .env automatically.

import "dotenv/config";
import {
  createFullBackup,
  createIncrementalBackup,
  listBackups,
  validateAllBackups,
  validateBackupById,
} from "../lib/backup/service";
import type { BackupMetadata } from "../lib/backup/types";

function fmtBytes(bytes: number): string {
  if (bytes === 0)             return "0 B";
  if (bytes < 1_024)           return `${bytes} B`;
  if (bytes < 1_048_576)       return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(2)} MB`;
}

function fmtDuration(ms: number): string {
  if (ms < 1_000) return `${ms}ms`;
  return `${(ms / 1_000).toFixed(1)}s`;
}

function printBackup(b: BackupMetadata): void {
  const shortId = b.id.slice(0, 8);
  const status  = b.status.padEnd(12);
  const type    = b.type.padEnd(13);
  const size    = fmtBytes(b.fileSizeBytes).padStart(10);
  console.log(`  [${shortId}] ${type} ${status} ${b.createdAt}  ${size}`);
}

async function runFull(): Promise<void> {
  console.log("Starting full backup…");
  const result = await createFullBackup();
  if (!result.ok) {
    console.error(`\nFull backup failed: ${result.error}`);
    process.exit(1);
  }
  const m = result.metadata!;
  console.log(`\nFull backup completed`);
  console.log(`  ID:       ${m.id}`);
  console.log(`  File:     ${m.filePath}`);
  console.log(`  Size:     ${fmtBytes(m.fileSizeBytes)}`);
  console.log(`  Duration: ${fmtDuration(m.durationMs)}`);
  console.log(`  Schema:   ${m.schemaVersion}`);
}

async function runIncremental(): Promise<void> {
  console.log("Starting incremental backup…");
  const result = await createIncrementalBackup();
  if (!result.ok) {
    console.error(`\nIncremental backup failed: ${result.error}`);
    process.exit(1);
  }
  const m = result.metadata!;
  console.log(`\nIncremental backup completed`);
  console.log(`  ID:       ${m.id}`);
  console.log(`  File:     ${m.filePath}`);
  console.log(`  Size:     ${fmtBytes(m.fileSizeBytes)}`);
  console.log(`  Duration: ${fmtDuration(m.durationMs)}`);
  console.log(`  Rows:     ${m.rowCount ?? 0} across ${m.tablesIncluded?.length ?? 0} table(s)`);
  console.log(`  Based on: ${m.basedOn}`);
}

async function runList(): Promise<void> {
  const backups = await listBackups();
  if (backups.length === 0) {
    console.log("No backups found.");
    return;
  }
  console.log(`${backups.length} backup(s):\n`);
  console.log("  [ID]     TYPE           STATUS       CREATED AT                SIZE");
  console.log("  " + "─".repeat(80));
  backups.forEach(printBackup);
}

async function runValidate(id?: string): Promise<void> {
  if (id) {
    console.log(`Validating backup ${id}…`);
    const result = await validateBackupById(id);
    if (result.ok) {
      console.log(`  ✔ Checksum valid — ${fmtBytes(result.fileSizeBytes)}`);
    } else {
      console.error(`  ✖ ${result.error}`);
      process.exit(1);
    }
    return;
  }

  console.log("Validating all completed backups…");
  const results = await validateAllBackups();
  if (results.length === 0) {
    console.log("No completed backups to validate.");
    return;
  }
  let failed = 0;
  for (const r of results) {
    const icon = r.ok ? "✔" : "✖";
    const detail = r.ok ? fmtBytes(r.fileSizeBytes) : (r.error ?? "invalid");
    console.log(`  ${icon} [${r.backupId.slice(0, 8)}] ${detail}`);
    if (!r.ok) failed++;
  }
  if (failed > 0) {
    console.error(`\n${failed} backup(s) failed validation.`);
    process.exit(1);
  }
  console.log(`\nAll ${results.length} backup(s) are valid.`);
}

const [,, command, arg] = process.argv;

async function main(): Promise<void> {
  switch (command) {
    case "full":        return runFull();
    case "incremental": return runIncremental();
    case "list":        return runList();
    case "validate":    return runValidate(arg);
    default:
      console.log("Usage: npm run backup:<command>\n");
      console.log("  backup:full          Run a full pg_dump backup");
      console.log("  backup:incremental   Run an incremental backup (requires a prior full backup)");
      console.log("  backup:list          List all backups from the manifest");
      console.log("  backup:validate      Validate checksums of all completed backups");
      console.log("  backup:validate <id> Validate a specific backup by ID\n");
      console.log("Environment variables:");
      console.log("  BACKUP_PATH              Directory for backup files (default: ./backups)");
      console.log("  BACKUP_RETENTION_DAYS    Days to keep backups (default: 30)");
      console.log("  PG_DUMP_BIN              Path to pg_dump binary (default: pg_dump)");
      console.log("  PG_RESTORE_BIN           Path to pg_restore binary (default: pg_restore)");
      process.exit(1);
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
