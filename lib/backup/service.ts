import crypto from "crypto";
import { getConfig }                from "./config";
import { deleteFile }               from "./storage/local";
import * as store                   from "./manifest";
import { validateBackup }           from "./validation";
import {
  runFullBackup,
  runIncrementalBackup,
  restoreFullBackup,
  applyIncrementalBackup,
} from "./database";
import { log } from "./logger";
import type {
  BackupMetadata,
  BackupResult,
  RestoreResult,
  ValidationResult,
  CleanupResult,
} from "./types";

function newId(): string {
  return crypto.randomUUID();
}

// ── Backup ───────────────────────────────────────────────────────────────────

export async function createFullBackup(): Promise<BackupResult> {
  const config  = getConfig();
  const id      = newId();
  const startMs = Date.now();

  const partial: BackupMetadata = {
    id,
    type:          "full",
    status:        "in_progress",
    createdAt:     new Date().toISOString(),
    filePath:      "",
    fileSizeBytes: 0,
    storageType:   "local",
    checksum:      "",
    schemaVersion: "",
    durationMs:    0,
  };
  await store.upsertBackup(config.backupPath, partial);

  try {
    const { filePath, checksum, sizeBytes, schema } = await runFullBackup(config, config.backupPath);

    const done: BackupMetadata = {
      ...partial,
      status:        "completed",
      completedAt:   new Date().toISOString(),
      filePath,
      fileSizeBytes: sizeBytes,
      checksum,
      schemaVersion: schema,
      durationMs:    Date.now() - startMs,
    };
    await store.upsertBackup(config.backupPath, done);

    log.info("Full backup completed", {
      backupId:  id,
      sizeBytes,
      durationMs: done.durationMs,
      schema,
    });

    return { ok: true, metadata: done };
  } catch (err) {
    const failed: BackupMetadata = {
      ...partial,
      status:    "failed",
      durationMs: Date.now() - startMs,
      error:     err instanceof Error ? err.message : String(err),
    };
    await store.upsertBackup(config.backupPath, failed);

    log.error("Full backup failed", err instanceof Error ? err : undefined, { backupId: id });

    return { ok: false, error: failed.error, metadata: failed };
  }
}

export async function createIncrementalBackup(): Promise<BackupResult> {
  const config  = getConfig();
  const id      = newId();
  const startMs = Date.now();

  // Incremental snapshots are relative to the latest completed full backup
  const parent = await store.getLatestFullBackup(config.backupPath);
  if (!parent) {
    return {
      ok:    false,
      error: "No completed full backup found. Run a full backup first.",
    };
  }

  const since   = new Date(parent.completedAt ?? parent.createdAt);
  const partial: BackupMetadata = {
    id,
    type:          "incremental",
    status:        "in_progress",
    createdAt:     new Date().toISOString(),
    filePath:      "",
    fileSizeBytes: 0,
    storageType:   "local",
    checksum:      "",
    schemaVersion: "",
    basedOn:       parent.id,
    durationMs:    0,
  };
  await store.upsertBackup(config.backupPath, partial);

  try {
    const {
      filePath, checksum, sizeBytes, schema, tablesChanged, rowCount,
    } = await runIncrementalBackup(config, config.backupPath, since, parent.id);

    const done: BackupMetadata = {
      ...partial,
      status:         "completed",
      completedAt:    new Date().toISOString(),
      filePath,
      fileSizeBytes:  sizeBytes,
      checksum,
      schemaVersion:  schema,
      tablesIncluded: tablesChanged,
      rowCount,
      durationMs:     Date.now() - startMs,
    };
    await store.upsertBackup(config.backupPath, done);

    log.info("Incremental backup completed", {
      backupId:      id,
      basedOn:       parent.id,
      tablesChanged: tablesChanged.length,
      rowCount,
      sizeBytes,
      durationMs:    done.durationMs,
    });

    return { ok: true, metadata: done };
  } catch (err) {
    const failed: BackupMetadata = {
      ...partial,
      status:    "failed",
      durationMs: Date.now() - startMs,
      error:     err instanceof Error ? err.message : String(err),
    };
    await store.upsertBackup(config.backupPath, failed);

    log.error("Incremental backup failed", err instanceof Error ? err : undefined, {
      backupId: id,
      basedOn:  parent.id,
    });

    return { ok: false, error: failed.error, metadata: failed };
  }
}

// ── Restore ──────────────────────────────────────────────────────────────────

export async function restoreFromBackup(backupId: string): Promise<RestoreResult> {
  const config  = getConfig();
  const startMs = Date.now();
  const meta    = await store.getBackupById(config.backupPath, backupId);

  if (!meta) {
    return { ok: false, backupId, error: `Backup "${backupId}" not found in manifest` };
  }
  if (meta.status !== "completed") {
    return {
      ok:      false,
      backupId,
      error:   `Backup "${backupId}" has status "${meta.status}" — only completed backups can be restored`,
    };
  }

  // Verify file integrity before touching the database
  const validation = await validateBackup(meta);
  if (!validation.ok) {
    return { ok: false, backupId, error: `Integrity check failed: ${validation.error}` };
  }

  log.info("Starting restore", { backupId, type: meta.type });

  try {
    if (meta.type === "full") {
      await restoreFullBackup(config, meta.filePath);

      log.info("Full restore completed", { backupId, durationMs: Date.now() - startMs });

      return {
        ok:         true,
        backupId,
        restoredAt: new Date().toISOString(),
        durationMs: Date.now() - startMs,
      };
    }

    // Incremental restore: first restore the parent full backup to establish
    // a consistent baseline, then apply the incremental delta on top.
    if (meta.basedOn) {
      const parent = await store.getBackupById(config.backupPath, meta.basedOn);
      if (parent && parent.status === "completed") {
        log.info("Restoring parent full backup first", { parentId: meta.basedOn });
        await restoreFullBackup(config, parent.filePath);
      }
    }

    const { tablesRestored, rowsUpserted } = await applyIncrementalBackup(config, meta.filePath);

    log.info("Incremental restore completed", {
      backupId,
      tablesRestored,
      rowsUpserted,
      durationMs: Date.now() - startMs,
    });

    return {
      ok:             true,
      backupId,
      restoredAt:     new Date().toISOString(),
      durationMs:     Date.now() - startMs,
      tablesRestored,
    };
  } catch (err) {
    log.error("Restore failed", err instanceof Error ? err : undefined, { backupId });
    return {
      ok:      false,
      backupId,
      error:   err instanceof Error ? err.message : String(err),
    };
  }
}

// ── Validation ───────────────────────────────────────────────────────────────

export async function validateBackupById(backupId: string): Promise<ValidationResult> {
  const config = getConfig();
  const meta   = await store.getBackupById(config.backupPath, backupId);

  if (!meta) {
    return {
      ok:            false,
      backupId,
      checksumValid: false,
      fileSizeBytes: 0,
      error:         `Backup "${backupId}" not found in manifest`,
    };
  }

  const result = await validateBackup(meta);

  if (!result.ok) {
    log.warn("Backup validation failed", { backupId, error: result.error });
  }

  return result;
}

/** Validate all completed backups and return results for each. */
export async function validateAllBackups(): Promise<ValidationResult[]> {
  const config   = getConfig();
  const backups  = await store.listBackups(config.backupPath);
  const completed = backups.filter(b => b.status === "completed");

  const results: ValidationResult[] = [];
  for (const b of completed) {
    results.push(await validateBackup(b));
  }
  return results;
}

// ── Listing ──────────────────────────────────────────────────────────────────

export async function listBackups(): Promise<BackupMetadata[]> {
  const config = getConfig();
  return store.listBackups(config.backupPath);
}

export async function getBackup(id: string): Promise<BackupMetadata | null> {
  const config = getConfig();
  return store.getBackupById(config.backupPath, id);
}

// ── Retention cleanup ────────────────────────────────────────────────────────

export async function pruneExpired(): Promise<CleanupResult> {
  const config   = getConfig();
  const all      = await store.listBackups(config.backupPath);
  const cutoffMs = Date.now() - config.retentionDays * 24 * 60 * 60 * 1000;
  const expired  = all.filter(
    b => new Date(b.createdAt).getTime() < cutoffMs && b.status !== "in_progress",
  );

  let deletedCount = 0;
  let freedBytes   = 0;
  const errors: string[] = [];

  for (const backup of expired) {
    try {
      if (backup.filePath) {
        await deleteFile(backup.filePath);
        freedBytes += backup.fileSizeBytes;
      }
      await store.removeBackup(config.backupPath, backup.id);
      deletedCount++;

      log.info("Pruned expired backup", {
        backupId:  backup.id,
        createdAt: backup.createdAt,
        type:      backup.type,
      });
    } catch (err) {
      const msg = `Failed to prune ${backup.id}: ${err instanceof Error ? err.message : String(err)}`;
      errors.push(msg);
      log.warn("Could not prune backup", { backupId: backup.id });
    }
  }

  if (errors.length > 0) {
    return { ok: false, deletedCount, freedBytes, error: errors.join("; ") };
  }
  return { ok: true, deletedCount, freedBytes };
}
