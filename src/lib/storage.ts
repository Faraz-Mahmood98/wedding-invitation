import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

/**
 * Upload storage. Defaults to the local filesystem (`storage/uploads/…`) so the
 * feature works out of the box in development; files are streamed back through
 * the `/uploads/[...path]` route handler. When `BLOB_READ_WRITE_TOKEN` and
 * `STORAGE_PUBLIC_BASE_URL` are configured, files are pushed to Vercel Blob
 * instead and the public blob URL is returned.
 */

export type UploadKind = "image" | "audio";

export interface KindRules {
  types: readonly string[];
  maxBytes: number;
}

export const UPLOAD_KINDS: Record<UploadKind, KindRules> = {
  image: {
    types: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
    maxBytes: 8 * 1024 * 1024,
  },
  audio: {
    types: ["audio/mpeg", "audio/mp4", "audio/ogg", "audio/wav", "audio/x-m4a"],
    maxBytes: 15 * 1024 * 1024,
  },
};

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/x-m4a": "m4a",
};

export type UploadError = "empty" | "type" | "size";

export interface UploadCheck {
  ok: boolean;
  error?: UploadError;
}

/** Pure validation shared by the API route and the tests. */
export function validateUpload(kind: UploadKind, contentType: string, size: number): UploadCheck {
  const rules = UPLOAD_KINDS[kind];
  if (!rules) return { ok: false, error: "type" };
  if (!Number.isFinite(size) || size <= 0) return { ok: false, error: "empty" };
  if (!rules.types.includes(contentType.toLowerCase())) return { ok: false, error: "type" };
  if (size > rules.maxBytes) return { ok: false, error: "size" };
  return { ok: true };
}

export function extensionFor(contentType: string): string {
  return EXTENSIONS[contentType.toLowerCase()] ?? "bin";
}

/** Collision-resistant filename that keeps a readable, URL-safe base. */
export function safeFilename(original: string, contentType: string): string {
  const base = original
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const stamp = Date.now().toString(36);
  const random = randomBytes(4).toString("hex");
  const prefix = base ? `${stamp}-${random}-${base}` : `${stamp}-${random}`;
  return `${prefix}.${extensionFor(contentType)}`;
}

export interface StoredFile {
  url: string;
  key: string;
}

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN && process.env.STORAGE_PUBLIC_BASE_URL);
}

export function localUploadRoot(root: string = process.cwd()): string {
  return path.join(root, "storage", "uploads");
}

function dateParts(date: Date): { year: string; month: string } {
  return { year: String(date.getUTCFullYear()), month: String(date.getUTCMonth() + 1).padStart(2, "0") };
}

export function localUrlFor(filename: string, date: Date = new Date()): string {
  const { year, month } = dateParts(date);
  return `/uploads/${year}/${month}/${filename}`;
}

/** Writes to `<root>/storage/uploads/<year>/<month>/<file>` and returns the public path. */
export async function storeLocalUpload(
  filename: string,
  data: Uint8Array,
  options: { root?: string; date?: Date } = {},
): Promise<StoredFile> {
  const date = options.date ?? new Date();
  const { year, month } = dateParts(date);
  const dir = path.join(localUploadRoot(options.root ?? process.cwd()), year, month);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), data);
  return { url: localUrlFor(filename, date), key: `uploads/${year}/${month}/${filename}` };
}

/** PUTs to Vercel Blob over REST (avoids pulling in the SDK as a dependency). */
export async function storeBlobUpload(
  filename: string,
  contentType: string,
  data: Uint8Array,
): Promise<StoredFile> {
  const token = process.env.BLOB_READ_WRITE_TOKEN as string;
  const base = (process.env.STORAGE_PUBLIC_BASE_URL as string).replace(/\/$/, "");
  const key = `uploads/${filename}`;

  const response = await fetch(`https://blob.vercel-storage.com/${key}`, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${token}`,
      "x-content-type": contentType,
      "x-api-version": "7",
    },
    body: data as BodyInit,
  });
  if (!response.ok) {
    throw new Error(`Blob upload failed with status ${response.status}`);
  }
  const payload = (await response.json().catch(() => null)) as { url?: string } | null;
  return { url: payload?.url ?? `${base}/${key}`, key };
}

/** Picks the configured backend and stores the file. */
export async function storeUpload(
  original: string,
  contentType: string,
  data: Uint8Array,
  options: { root?: string; date?: Date } = {},
): Promise<StoredFile> {
  const filename = safeFilename(original, contentType);
  if (isBlobConfigured()) return storeBlobUpload(filename, contentType, data);
  return storeLocalUpload(filename, data, options);
}
