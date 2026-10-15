"use client";

import { useInvitationUI } from "./InvitationProvider";

interface MusicToggleProps {
  labels: { mute: string; unmute: string };
}

export function MusicToggle({ labels }: MusicToggleProps) {
  const { hasMusic, muted, toggleMute } = useInvitationUI();
  if (!hasMusic) return null;

  const label = muted ? labels.unmute : labels.mute;

  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-label={label}
      aria-pressed={muted}
      title={label}
      className="fixed z-40 flex h-11 w-11 items-center justify-center rounded-full border border-blush bg-cream/90 text-deep-rose shadow-sm backdrop-blur transition-colors hover:bg-blush focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-rose"
      style={{
        top: "calc(1rem + env(safe-area-inset-top))",
        left: "calc(1rem + env(safe-area-inset-left))",
      }}
    >
      {muted ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M11 5 6 9H3v6h3l5 4V5z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="m16 9 5 6m0-6-5 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M11 5 6 9H3v6h3l5 4V5z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8 8 0 0 1 0 12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
