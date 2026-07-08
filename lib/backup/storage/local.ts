import fs   from "fs/promises";
import path from "path";

export async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export async function writeFile(filePath: string, data: Buffer | string): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, data);
}

export async function readFileBuf(filePath: string): Promise<Buffer> {
  return fs.readFile(filePath);
}

export async function exists(filePath: string): Promise<boolean> {
  return fs.access(filePath).then(() => true, () => false);
}

export async function fileSize(filePath: string): Promise<number> {
  const s = await fs.stat(filePath);
  return s.size;
}

export async function deleteFile(filePath: string): Promise<void> {
  await fs.unlink(filePath);
}

export async function listFiles(dir: string, ext?: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter(e => e.isFile() && (!ext || e.name.endsWith(ext)))
      .map(e => path.join(dir, e.name));
  } catch {
    return [];
  }
}
