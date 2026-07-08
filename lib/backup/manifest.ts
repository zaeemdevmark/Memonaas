import path from "path";
import { writeFile, readFileBuf, exists } from "./storage/local";
import type { BackupManifest, BackupMetadata } from "./types";

const MANIFEST_FILE = "backup-manifest.json";

function manifestPath(backupPath: string): string {
  return path.join(backupPath, MANIFEST_FILE);
}

export async function readManifest(backupPath: string): Promise<BackupManifest> {
  const p = manifestPath(backupPath);
  if (!(await exists(p))) {
    return {
      version:       1,
      updatedAt:     new Date().toISOString(),
      backups:       [],
      scheduleState: {},
    };
  }
  const raw = await readFileBuf(p);
  return JSON.parse(raw.toString("utf8")) as BackupManifest;
}

async function saveManifest(backupPath: string, manifest: BackupManifest): Promise<void> {
  manifest.updatedAt = new Date().toISOString();
  await writeFile(manifestPath(backupPath), JSON.stringify(manifest, null, 2));
}

export async function upsertBackup(backupPath: string, metadata: BackupMetadata): Promise<void> {
  const manifest = await readManifest(backupPath);
  const idx = manifest.backups.findIndex(b => b.id === metadata.id);
  if (idx >= 0) manifest.backups[idx] = metadata;
  else manifest.backups.push(metadata);
  await saveManifest(backupPath, manifest);
}

export async function getBackupById(backupPath: string, id: string): Promise<BackupMetadata | null> {
  const manifest = await readManifest(backupPath);
  return manifest.backups.find(b => b.id === id) ?? null;
}

export async function getLatestFullBackup(backupPath: string): Promise<BackupMetadata | null> {
  const manifest = await readManifest(backupPath);
  const candidates = manifest.backups
    .filter(b => b.type === "full" && b.status === "completed")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return candidates[0] ?? null;
}

export async function listBackups(backupPath: string): Promise<BackupMetadata[]> {
  const manifest = await readManifest(backupPath);
  return [...manifest.backups].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function removeBackup(backupPath: string, id: string): Promise<void> {
  const manifest = await readManifest(backupPath);
  manifest.backups = manifest.backups.filter(b => b.id !== id);
  await saveManifest(backupPath, manifest);
}

export async function getScheduleLastRun(backupPath: string, name: string): Promise<string | null> {
  const manifest = await readManifest(backupPath);
  return manifest.scheduleState[name] ?? null;
}

export async function setScheduleLastRun(
  backupPath: string,
  name:       string,
  iso:        string,
): Promise<void> {
  const manifest = await readManifest(backupPath);
  manifest.scheduleState[name] = iso;
  await saveManifest(backupPath, manifest);
}
