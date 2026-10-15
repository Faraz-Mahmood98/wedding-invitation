import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { UPLOAD_KINDS, storeUpload, validateUpload, type UploadKind } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isUploadKind(value: string): value is UploadKind {
  return value === "image" || value === "audio";
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const limit = rateLimit(`upload:${session.sub}`, 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const kindValue = String(form?.get("kind") ?? "");
  if (!(file instanceof File) || !isUploadKind(kindValue)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const check = validateUpload(kindValue, file.type, file.size);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }

  try {
    const data = new Uint8Array(await file.arrayBuffer());
    const stored = await storeUpload(file.name || "upload", file.type, data);
    return NextResponse.json({
      ok: true,
      url: stored.url,
      maxBytes: UPLOAD_KINDS[kindValue].maxBytes,
    });
  } catch {
    return NextResponse.json({ error: "storage_failed" }, { status: 502 });
  }
}
