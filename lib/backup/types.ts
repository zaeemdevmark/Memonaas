export type BackupType   = "full" | "incremental";
export type BackupStatus = "in_progress" | "completed" | "failed";
export type StorageType  = "local" | "cloud";

export interface BackupMetadata {
  id:              string;     // UUID
  type:            BackupType;
  status:          BackupStatus;
  createdAt:       string;     // ISO 8601
  completedAt?:    string;     // ISO 8601
  filePath:        string;     // absolute path on local disk
  fileSizeBytes:   number;
  storageType:     StorageType;
  checksum:        string;     // SHA-256 hex digest of the backup file
  schemaVersion:   string;     // name of the latest Prisma migration at backup time
  basedOn?:        string;     // parent full-backup ID (incremental only)
  tablesIncluded?: string[];   // tables captured (incremental only)
  rowCount?:       number;     // total rows captured (incremental only)
  durationMs:      number;
  error?:          string;
}

// Persisted to backup-manifest.json in the backup directory
export interface BackupManifest {
  version:       1;
  updatedAt:     string;
  backups:       BackupMetadata[];
  scheduleState: Record<string, string>; // scheduleName → lastRunAt ISO
}

export interface BackupResult {
  ok:        boolean;
  metadata?: BackupMetadata;
  error?:    string;
}

export interface RestoreResult {
  ok:             boolean;
  backupId:       string;
  restoredAt?:    string;
  durationMs?:    number;
  tablesRestored?: string[];
  error?:         string;
}

export interface ValidationResult {
  ok:            boolean;
  backupId:      string;
  checksumValid: boolean;
  fileSizeBytes: number;
  error?:        string;
}

export interface CleanupResult {
  ok:           boolean;
  deletedCount: number;
  freedBytes:   number;
  error?:       string;
}
