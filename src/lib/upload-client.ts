"use client";

import type { UploadKind } from "@/lib/storage";

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

/** Posts a file to `/api/admin/upload` and returns the stored URL. */
export async function uploadFile(file: File, kind: UploadKind): Promise<UploadResult> {
  const body = new FormData();
  body.append("file", file);
  body.append("kind", kind);

  try {
    const response = await fetch("/api/admin/upload", { method: "POST", body });
    const payload = (await response.json().catch(() => null)) as
      | { url?: string; error?: string }
      | null;
    if (!response.ok || !payload?.url) {
      return { ok: false, error: payload?.error ?? "failed" };
    }
    return { ok: true, url: payload.url };
  } catch {
    return { ok: false, error: "network" };
  }
}
