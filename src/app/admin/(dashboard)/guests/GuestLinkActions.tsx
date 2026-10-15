"use client";

import { useState } from "react";

interface GuestLinkActionsProps {
  url: string;
  phone: string | null;
  name: string;
}

export function GuestLinkActions({ url, phone, name }: GuestLinkActionsProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const digits = (phone ?? "").replace(/\D/g, "");
  const whatsappHref = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(`You're invited to the wedding of ${name}!\n${url}`)}`
    : null;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={copy}
        className="rounded-full border border-rose px-2.5 py-1 text-xs text-deep-rose transition-colors hover:bg-deep-rose hover:text-cream"
      >
        {copied ? "Copied" : "Copy link"}
      </button>
      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-rose px-2.5 py-1 text-xs text-deep-rose transition-colors hover:bg-deep-rose hover:text-cream"
        >
          WhatsApp
        </a>
      ) : null}
    </div>
  );
}
