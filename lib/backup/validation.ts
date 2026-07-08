import crypto from "crypto";
import { readFileBuf, exists, fileSize } from "./storage/local";
import type { BackupMetadata, ValidationResult } from "./types";

export async function computeChecksum(filePath: string): Promise<string> {
  const data = await readFileBuf(filePath);
  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function validateBackup(metadata: BackupMetadata): Promise<ValidationResult> {
  const base = { backupId: metadata.id, fileSizeBytes: 0, checksumValid: false };

  if (!(await exists(metadata.filePath))) {
    return {
      ...base,
      ok:    false,
      error: `Backup file not found: ${metadata.filePath}`,
    };
  }

  const size = await fileSize(metadata.filePath);
  if (size === 0) {
    return {
      ...base,
      ok:            false,
      fileSizeBytes: size,
      error:         "Backup file is empty (0 bytes)",
    };
  }

  const actual        = await computeChecksum(metadata.filePath);
  const checksumValid = actual === metadata.checksum;

  return {
    ok:            checksumValid,
    backupId:      metadata.id,
    checksumValid,
    fileSizeBytes: size,
    ...(checksumValid ? {} : {
      error: `Checksum mismatch — expected ${metadata.checksum.slice(0, 12)}…, got ${actual.slice(0, 12)}…`,
    }),
  };
}
