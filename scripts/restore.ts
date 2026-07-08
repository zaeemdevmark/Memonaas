#!/usr/bin/env node
// Restore CLI — run via: npm run backup:restore <backup-id>
// DESTRUCTIVE: overwrites the current database. Validates backup integrity
// and prompts for confirmation before proceeding.

import "dotenv/config";
import readline                                        from "readline";
import { restoreFromBackup, validateBackupById, listBackups } from "../lib/backup/service";

function fmtBytes(bytes: number): string {
  if (bytes < 1_048_576) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(2)} MB`;
}

function fmtDuration(ms: number): string {
  if (ms < 1_000) return `${ms}ms`;
  return `${(ms / 1_000).toFixed(1)}s`;
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

const [,, backupId] = process.argv;

async function main(): Promise<void> {
  if (!backupId) {
    console.error("Usage: npm run backup:restore <backup-id>\n");
    console.error('Run "npm run backup:list" to see available backups.');
    process.exit(1);
  }

  // Show the backup we're about to restore
  const backups  = await listBackups();
  const target   = backups.find(b => b.id === backupId || b.id.startsWith(backupId));
  if (!target) {
    console.error(`Backup "${backupId}" not found.\n`);
    console.error('Run "npm run backup:list" to see available backups.');
    process.exit(1);
  }

  console.log("\nBackup details:");
  console.log(`  ID:      ${target.id}`);
  console.log(`  Type:    ${target.type}`);
  console.log(`  Created: ${target.createdAt}`);
  console.log(`  Size:    ${fmtBytes(target.fileSizeBytes)}`);
  console.log(`  Schema:  ${target.schemaVersion}`);
  if (target.basedOn) console.log(`  Based on: ${target.basedOn}`);

  // Validate integrity before touching the database
  console.log("\nVerifying backup integrity…");
  const validation = await validateBackupById(target.id);
  if (!validation.ok) {
    console.error(`\n✖ Integrity check FAILED: ${validation.error}`);
    console.error("Restore aborted — do not restore a corrupt backup.");
    process.exit(1);
  }
  console.log(`✔ Checksum valid — ${fmtBytes(validation.fileSizeBytes)}`);

  // Require explicit confirmation — this is destructive
  console.log("\n⚠  WARNING: This will OVERWRITE the current database.");
  console.log("   Ensure you have a recent backup of the current state before proceeding.");
  const answer = await prompt('\nType "yes" to confirm restore, or anything else to cancel: ');

  if (answer.toLowerCase() !== "yes") {
    console.log("Restore cancelled.");
    process.exit(0);
  }

  console.log("\nStarting restore…");
  const result = await restoreFromBackup(target.id);

  if (!result.ok) {
    console.error(`\n✖ Restore FAILED: ${result.error}`);
    process.exit(1);
  }

  console.log(`\n✔ Restore completed in ${fmtDuration(result.durationMs ?? 0)}`);
  if (result.tablesRestored?.length) {
    console.log(`  Tables: ${result.tablesRestored.join(", ")}`);
  }
  console.log("\nNext steps:");
  console.log("  1. Run database migrations if the schema changed: npm run db:migrate:prod");
  console.log("  2. Restart the application server.");
  console.log("  3. Verify core functionality (login, product listing, orders).");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
