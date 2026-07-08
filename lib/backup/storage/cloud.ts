// Cloud storage integration — placeholder for future implementation.
//
// To add cloud backup support, install one of these SDKs and implement the
// functions below:
//
//   AWS S3       — @aws-sdk/client-s3
//   Google Cloud — @google-cloud/storage
//   Azure Blob   — @azure/storage-blob
//
// Required environment variables (add to .env when implementing):
//   CLOUD_BACKUP_PROVIDER   = "s3" | "gcs" | "azure"
//   AWS_BACKUP_BUCKET       = "my-backup-bucket"
//   AWS_REGION              = "us-east-1"
//   AWS_ACCESS_KEY_ID       = "..."
//   AWS_SECRET_ACCESS_KEY   = "..."

export interface CloudUploadResult {
  ok:         boolean;
  remoteKey?: string;
  error?:     string;
}

export interface CloudDownloadResult {
  ok:     boolean;
  data?:  Buffer;
  error?: string;
}

/**
 * Upload a local backup file to cloud storage.
 * @param localPath  - Absolute path of the source file
 * @param remoteKey  - Destination object key / blob name in the bucket
 */
export async function uploadBackup(
  localPath:  string,
  remoteKey:  string,
): Promise<CloudUploadResult> {
  void localPath;
  void remoteKey;
  return {
    ok:    false,
    error: "Cloud storage is not configured. Implement this function with your chosen cloud SDK.",
  };
}

/**
 * Download a backup from cloud storage to a local file.
 * @param remoteKey - Source object key / blob name in the bucket
 * @param localPath - Destination path on the local filesystem
 */
export async function downloadBackup(
  remoteKey:  string,
  localPath:  string,
): Promise<CloudDownloadResult> {
  void remoteKey;
  void localPath;
  return {
    ok:    false,
    error: "Cloud storage is not configured. Implement this function with your chosen cloud SDK.",
  };
}

/** List all backup objects in cloud storage. */
export async function listCloudBackups(prefix?: string): Promise<string[]> {
  void prefix;
  return [];
}

/** Delete a backup object from cloud storage. */
export async function deleteCloudBackup(remoteKey: string): Promise<boolean> {
  void remoteKey;
  return false;
}
