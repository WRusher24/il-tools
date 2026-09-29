import { createHash } from "node:crypto";
import {
  appendFile,
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

/**
 * Chunked-upload storage driver.
 *
 * Interface-first design (`UploadStore`): the local filesystem driver below
 * is the production driver for the single-node runtime; swapping in an S3
 * multipart driver (Initiate → UploadPart per chunk → CompleteMultipartUpload)
 * means implementing the same five methods — the API routes don't change.
 */

export const CHUNK_SIZE = 1024 * 1024; // 1MB canonical chunk

const ROOT = path.join(process.cwd(), ".data", "uploads");

const dirFor = (uploadId: string) => path.join(ROOT, uploadId);
const chunkPath = (uploadId: string, index: number) =>
  path.join(dirFor(uploadId), `${index}.part`);
export const finalPath = (uploadId: string) =>
  path.join(dirFor(uploadId), "final.bin");

function assertId(uploadId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(uploadId)) throw new Error("invalid upload id");
}

export async function prepareUpload(uploadId: string): Promise<void> {
  assertId(uploadId);
  await mkdir(dirFor(uploadId), { recursive: true });
}

/** Idempotent write — re-uploading the same index just overwrites. */
export async function writeChunk(
  uploadId: string,
  index: number,
  data: Buffer,
): Promise<void> {
  assertId(uploadId);
  await writeFile(chunkPath(uploadId, index), data);
}

/** Sorted list of chunk indexes present on disk (ground truth for resume). */
export async function listChunkIndexes(uploadId: string): Promise<number[]> {
  assertId(uploadId);
  try {
    const files = await readdir(dirFor(uploadId));
    return files
      .filter((f) => f.endsWith(".part"))
      .map((f) => Number(f.slice(0, -5)))
      .filter((n) => Number.isInteger(n))
      .sort((a, b) => a - b);
  } catch {
    return [];
  }
}

/**
 * Merge part files 0..totalChunks-1 into the final object, computing SHA-256
 * as we stream. Parts are deleted after success; the upload dir is left with
 * a single `final.bin`.
 */
export async function assembleUpload(
  uploadId: string,
  totalChunks: number,
): Promise<{ sha256: string; size: number }> {
  assertId(uploadId);
  const hash = createHash("sha256");
  const final = finalPath(uploadId);
  await writeFile(final, Buffer.alloc(0));
  let size = 0;
  for (let i = 0; i < totalChunks; i += 1) {
    const part = await readFile(chunkPath(uploadId, i));
    hash.update(part);
    size += part.length;
    await appendFile(final, part);
  }
  for (let i = 0; i < totalChunks; i += 1) {
    await rm(chunkPath(uploadId, i), { force: true });
  }
  return { sha256: hash.digest("hex"), size };
}

export async function readFinal(
  uploadId: string,
): Promise<{ buffer: Buffer; size: number } | null> {
  assertId(uploadId);
  try {
    const buffer = await readFile(finalPath(uploadId));
    return { buffer, size: buffer.length };
  } catch {
    return null;
  }
}

export async function finalSize(uploadId: string): Promise<number | null> {
  assertId(uploadId);
  try {
    return (await stat(finalPath(uploadId))).size;
  } catch {
    return null;
  }
}

export async function deleteUploadDir(uploadId: string): Promise<void> {
  assertId(uploadId);
  await rm(dirFor(uploadId), { recursive: true, force: true });
}
