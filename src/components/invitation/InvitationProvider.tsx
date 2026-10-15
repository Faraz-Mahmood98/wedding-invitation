"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface InvitationUIContext {
  opened: boolean;
  setOpened: (value: boolean) => void;
  muted: boolean;
  toggleMute: () => void;
  startMusic: () => void;
  hasMusic: boolean;
}

const Context = createContext<InvitationUIContext | null>(null);

export function useInvitationUI(): InvitationUIContext {
  const value = useContext(Context);
  if (!value) {
    throw new Error("useInvitationUI must be used within InvitationProvider");
  }
  return value;
}

interface InvitationProviderProps {
  musicUrl: string | null;
  storageKey: string;
  children: React.ReactNode;
}

export function InvitationProvider({
  musicUrl,
  storageKey,
  children,
}: InvitationProviderProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const startedRef = useRef(false);
  const [opened, setOpened] = useState(false);
  const [muted, setMuted] = useState(false);

  // Restore the persisted mute preference after mount (SSR-safe).
  useEffect(() => {
    try {
      if (window.localStorage.getItem(storageKey) === "1") setMuted(true);
    } catch {
      /* storage unavailable */
    }
  }, [storageKey]);

  const startMusic = useCallback(() => {
    startedRef.current = true;
    const el = audioRef.current;
    if (!el || muted) return;
    el.play().catch(() => {
      /* autoplay blocked */
    });
  }, [muted]);

  const toggleMute = useCallback(() => {
    setMuted((previous) => {
      const next = !previous;
      try {
        window.localStorage.setItem(storageKey, next ? "1" : "0");
      } catch {
        /* storage unavailable */
      }
      const el = audioRef.current;
      if (el) {
        if (next) el.pause();
        else if (startedRef.current)
          el.play().catch(() => {
            /* ignore */
          });
      }
      return next;
    });
  }, [storageKey]);

  const value = useMemo<InvitationUIContext>(
    () => ({
      opened,
      setOpened,
      muted,
      toggleMute,
      startMusic,
      hasMusic: Boolean(musicUrl),
    }),
    [opened, muted, toggleMute, startMusic, musicUrl],
  );

  return (
    <Context.Provider value={value}>
      {children}
      {musicUrl ? (
        <audio ref={audioRef} src={musicUrl} loop preload="none" />
      ) : null}
    </Context.Provider>
  );
}
