"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { DEFAULT_OPENING_IMAGE, OPENING_IMAGE_PRESETS } from "@/lib/images";
import { uploadFile } from "@/lib/upload-client";

interface Props {
  defaultValue: string;
}

const DEFAULT_ID = "__default__";

export default function OpeningImagePicker({ defaultValue }: Props) {
  const [value, setValue] = useState(
    !defaultValue || defaultValue === DEFAULT_OPENING_IMAGE ? DEFAULT_ID : defaultValue,
  );
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  const active = value === DEFAULT_ID ? "" : value;

  const handleFile = async (file: File) => {
    setStatus("uploading");
    const result = await uploadFile(file, "image");
    if (result.ok) {
      setValue(result.url);
      setStatus("idle");
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => setValue(DEFAULT_ID)}
          className={`relative h-24 overflow-hidden rounded-lg border-2 transition-colors ${
            value === DEFAULT_ID ? "border-deep-rose" : "border-blush"
          }`}
        >
          <Image
            src={DEFAULT_OPENING_IMAGE}
            alt="Default opening background"
            fill
            sizes="160px"
            className="object-cover"
          />
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-2 py-1 text-left text-[10px] text-cream">
            Default
          </span>
        </button>

        {OPENING_IMAGE_PRESETS.slice(1).map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => setValue(preset.url)}
            className={`relative h-24 overflow-hidden rounded-lg border-2 transition-colors ${
              value === preset.url ? "border-deep-rose" : "border-blush"
            }`}
          >
            <Image
              src={preset.url}
              alt={preset.label}
              fill
              sizes="160px"
              className="object-cover"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-2 py-1 text-left text-[10px] text-cream">
              {preset.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1 text-xs text-ink/60">
        <span>Or paste an image URL (https://…) or upload your own</span>
        <div className="flex items-center gap-2">
          <input
            name="openingImage"
            value={active}
            onChange={(event) => setValue(event.target.value || DEFAULT_ID)}
            placeholder="Leave empty to use the default background"
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
        {status === "error" ? (
          <span className="text-deep-rose">Upload failed. Use a JPEG/PNG/WebP/GIF under 8 MB.</span>
        ) : null}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = "";
        }}
      />

      <div
        className="relative h-40 overflow-hidden rounded-lg border border-blush bg-blush/40 bg-cover bg-center"
        style={{ backgroundImage: `url("${active || DEFAULT_OPENING_IMAGE}")` }}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-ink/70 via-ink/30 to-transparent">
          <div className="text-center">
            <p className="font-display text-xl text-cream">Opening screen preview</p>
          </div>
        </div>
      </div>
    </div>
  );
}
