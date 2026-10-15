"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Locale, Messages } from "@/lib/i18n";
import { pick, type LocalizedTextPartial } from "@/lib/types";
import { cn } from "@/lib/cn";
import { initialsFromCoupleName } from "@/lib/monogram";
import { FloralArch, FloralCorner, FloralDivider, Monogram } from "./Florals";
import { useInvitationUI } from "./InvitationProvider";

interface OpeningGateProps {
  dict: Messages;
  locale: Locale;
  coupleName: LocalizedTextPartial;
  image: string | null;
}

function isRemote(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

export function OpeningGate({ dict, locale, coupleName, image }: OpeningGateProps) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const { setOpened, startMusic } = useInvitationUI();
  const isUr = locale === "ur";

  const name = pick(coupleName, locale);
  const initials = initialsFromCoupleName(name);

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.overflow;
    if (!open) root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  const handleOpen = () => {
    startMusic();
    setOpened(true);
    setOpen(true);
  };

  return (
    <AnimatePresence>
      {!open ? (
        <motion.div
          key="opening-gate"
          initial={false}
          exit={
            reduce
              ? { opacity: 0 }
              : { opacity: 0, scale: 1.06, filter: "blur(10px)" }
          }
          transition={{ duration: reduce ? 0.2 : 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-6 text-center"
          style={{
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {/* Base gradient (also the fallback when no photo is set). */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-deep-rose via-rose to-ink"
            aria-hidden="true"
          />

          {image ? (
            <>
              <Image
                src={image}
                alt=""
                fill
                priority
                unoptimized={isRemote(image)}
                sizes="100vw"
                className="absolute inset-0 object-cover"
              />
              {/* Warm tint + bottom vignette for text contrast over the photo. */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent"
                aria-hidden="true"
              />
              <div
                className="absolute inset-0"
                aria-hidden="true"
                style={{
                  background:
                    "radial-gradient(120% 90% at 50% 40%, rgba(74,44,47,0.15) 0%, rgba(74,44,47,0.55) 70%, rgba(74,44,47,0.8) 100%)",
                }}
              />
            </>
          ) : (
            <div className="absolute inset-0 bg-ink/25" aria-hidden="true" />
          )}

          {/* Gold inner frame. */}
          <div
            className="pointer-events-none absolute inset-4 rounded-[2rem] border border-cream/25 sm:inset-7"
            aria-hidden="true"
          />

          {/* Floral arch over the top + corner sprigs. */}
          <FloralArch className="pointer-events-none absolute inset-x-0 -top-2 mx-auto h-28 w-[min(34rem,92vw)] opacity-90 sm:h-36" />
          <FloralCorner className="pointer-events-none absolute -bottom-4 -left-4 h-28 w-28 opacity-80 sm:h-40 sm:w-40" />
          <FloralCorner className="pointer-events-none absolute -bottom-4 -right-4 h-28 w-28 -scale-x-100 opacity-80 sm:h-40 sm:w-40" />

          <div className="relative flex flex-col items-center gap-5">
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Monogram
                initials={initials}
                className="h-24 w-24 sm:h-28 sm:w-28"
                labelClassName="text-2xl sm:text-3xl"
              />
            </motion.div>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-xs uppercase tracking-[0.35em] text-cream/80"
            >
              {dict.opening.invitedTo}
            </motion.p>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              dir={isUr ? "rtl" : undefined}
              lang={isUr ? "ur" : undefined}
              className={cn(
                "font-display text-4xl text-cream drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] sm:text-5xl",
                isUr && "text-urdu",
              )}
            >
              {name}
            </motion.h1>

            <motion.div
              initial={reduce ? false : { opacity: 0, scaleX: 0.6 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.55 }}
            >
              <FloralDivider className="h-6 w-52 text-gold/90 sm:w-64" />
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="relative mt-3"
            >
              {!reduce ? (
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full border border-cream/70"
                  animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                />
              ) : null}
              <motion.button
                type="button"
                onClick={handleOpen}
                whileHover={reduce ? undefined : { scale: 1.04 }}
                whileTap={reduce ? undefined : { scale: 0.97 }}
                className="relative rounded-full border border-cream/80 bg-cream/10 px-8 py-3 text-sm tracking-[0.2em] text-cream backdrop-blur-sm transition-colors hover:bg-cream/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream"
              >
                {dict.opening.tapToOpen}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
