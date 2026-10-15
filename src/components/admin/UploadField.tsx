"use client";

import { useRef, useState } from "react";
import { uploadFile } from "@/lib/upload-client";
import type { UploadKind } from "@/lib/storage";

interface UploadFieldProps {
  name: string;
  label: string;
  defaultValue?: string;
  kind?: UploadKind;
  placeholder?: string;
  hint?: string;
}

const ERROR_TEXT: Record<string, string> = {
  type: "Unsupported file type.",
  size: "File is too large.",
  empty: "That file is empty.",
  rate_limited: "Too many uploads — try again shortly.",
  unauthorized: "Please sign in again.",
  storage_failed: "Storage is unavailable right now.",
  network: "Network error — please retry.",
  failed: "Upload failed.",
};

/**
 * Text field for a media URL with a companion file picker. The picked file is
 * uploaded immediately and the returned URL fills the input, so the enclosing
 * server-action form still submits a plain string.
 */
export function UploadField({
  name,
  label,
  defaultValue = "",
  kind = "image",
  placeholder,
  hint,
}: UploadFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setStatus("uploading");
    setError("");
    const result = await uploadFile(file, kind);
    if (result.ok) {
      setValue(result.url);
      setStatus("idle");
    } else {
      setError(ERROR_TEXT[result.error] ?? ERROR_TEXT.failed);
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col gap-1 text-xs text-ink/60">
      <span>{label}</span>
      <div className="flex items-center gap-2">
        <input
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={status === "uploading"}
          className="shrink-0 rounded-full border border-rose px-3 py-1.5 text-xs text-deep-rose transition-colors hover:bg-deep-rose hover:text-cream disabled:opacity-60"
        >
          {status === "uploading" ? "Uploading…" : "Upload"}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={kind === "image" ? "image/*" : "audio/*"}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = "";
        }}
      />

      {kind === "image" && value ? (
        <div
          className="mt-1 h-24 w-40 rounded-lg border border-blush bg-blush/40 bg-cover bg-center"
          style={{ backgroundImage: `url("${value}")` }}
          aria-hidden="true"
        />
      ) : null}
      {kind === "audio" && value ? (
        <audio controls src={value} className="mt-1 w-full max-w-sm" />
      ) : null}

      {status === "error" ? <span className="text-deep-rose">{error}</span> : null}
      {hint ? <span className="text-ink/40">{hint}</span> : null}
    </div>
  );
}
