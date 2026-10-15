import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  extensionFor,
  isBlobConfigured,
  localUrlFor,
  safeFilename,
  storeLocalUpload,
  storeUpload,
  validateUpload,
} from "./storage";

const createdDirs: string[] = [];

function tempRoot(): string {
  const dir = mkdtempSync(path.join(tmpdir(), "wedding-upload-"));
  createdDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of createdDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.STORAGE_PUBLIC_BASE_URL;
});

describe("validateUpload", () => {
  it("accepts a small JPEG", () => {
    expect(validateUpload("image", "image/jpeg", 1024).ok).toBe(true);
  });

  it("accepts audio (case-insensitive mime)", () => {
    expect(validateUpload("audio", "AUDIO/MPEG", 1024).ok).toBe(true);
  });

  it("rejects SVG and other disallowed image types", () => {
    expect(validateUpload("image", "image/svg+xml", 512)).toEqual({ ok: false, error: "type" });
  });

  it("rejects images over the size cap", () => {
    expect(validateUpload("image", "image/png", 9 * 1024 * 1024)).toEqual({
      ok: false,
      error: "size",
    });
  });

  it("rejects audio over the size cap", () => {
    expect(validateUpload("audio", "audio/mpeg", 20 * 1024 * 1024).error).toBe("size");
  });

  it("rejects empty files", () => {
    expect(validateUpload("image", "image/png", 0)).toEqual({ ok: false, error: "empty" });
  });
});

describe("safeFilename", () => {
  it("produces a url-safe name with the right extension", () => {
    const name = safeFilename("Our Big Day!.PNG", "image/png");
    expect(name).toMatch(/^[a-z0-9]+-[a-f0-9]+-our-big-day\.png$/);
  });

  it("still yields an extension when the base is unusable", () => {
    expect(safeFilename("???", "audio/mpeg")).toMatch(/\.mp3$/);
  });

  it("maps content types to extensions", () => {
    expect(extensionFor("image/avif")).toBe("avif");
    expect(extensionFor("audio/x-m4a")).toBe("m4a");
    expect(extensionFor("application/zip")).toBe("bin");
  });
});

describe("local storage", () => {
  it("builds a dated public url", () => {
    const date = new Date("2026-03-09T12:00:00.000Z");
    expect(localUrlFor("song.mp3", date)).toBe("/uploads/2026/03/song.mp3");
  });

  it("writes the file under storage/uploads and returns its path", async () => {
    const root = tempRoot();
    const data = new Uint8Array([1, 2, 3, 4]);
    const stored = await storeLocalUpload("clip.jpg", data, {
      root,
      date: new Date("2026-05-01T00:00:00.000Z"),
    });

    expect(stored.url).toBe("/uploads/2026/05/clip.jpg");
    const written = readFileSync(path.join(root, "storage", "uploads", "2026", "05", "clip.jpg"));
    expect(Array.from(written)).toEqual([1, 2, 3, 4]);
  });
});

describe("backend selection", () => {
  it("reports blob as unconfigured by default", () => {
    expect(isBlobConfigured()).toBe(false);
  });

  it("requires both token and public base url", () => {
    process.env.BLOB_READ_WRITE_TOKEN = "token";
    expect(isBlobConfigured()).toBe(false);
    process.env.STORAGE_PUBLIC_BASE_URL = "https://store.public.blob.vercel-storage.com";
    expect(isBlobConfigured()).toBe(true);
  });

  it("storeUpload falls back to the local backend", async () => {
    const root = tempRoot();
    const stored = await storeUpload("Pic.PNG", "image/png", new Uint8Array([9]), { root });
    expect(stored.url).toMatch(/^\/uploads\//);
    expect(stored.key).toMatch(/^uploads\//);
    expect(stored.url).toMatch(/\.png$/);
  });
});
