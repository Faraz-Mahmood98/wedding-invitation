"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale, Messages } from "@/lib/i18n";
import type { InvitationEvent, InvitationWedding } from "@/lib/invitation";
import { formatEventDate, zonedWallTimeToUtc } from "@/lib/time";
import { LocalizedText } from "./LocalizedText";
import { ScratchReveal } from "./ScratchReveal";

interface CountdownSectionProps {
  dict: Messages;
  locale: Locale;
  wedding: InvitationWedding;
  event: InvitationEvent | null;
}

function breakdown(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function CountdownSection({
  dict,
  locale,
  wedding,
  event,
}: CountdownSectionProps) {
  const target = useMemo(
    () =>
      event
        ? zonedWallTimeToUtc(event.date, event.startTime, wedding.timezone).getTime()
        : 0,
    [event, wedding.timezone],
  );

  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!event) return null;

  const remaining = now === null ? null : breakdown(Math.max(0, target - now));
  const isUr = locale === "ur";

  const units: Array<{ label: string; value: number | null }> = [
    { label: dict.countdown.days, value: remaining?.days ?? null },
    { label: dict.countdown.hours, value: remaining?.hours ?? null },
    { label: dict.countdown.minutes, value: remaining?.minutes ?? null },
    { label: dict.countdown.seconds, value: remaining?.seconds ?? null },
  ];

  return (
    <section className="px-6 py-12 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-gold">
        {dict.countdown.title}
      </p>

      <div className="mx-auto mt-6 max-w-sm">
        <ScratchReveal
          hint={dict.countdown.scratchReveal}
          className="rounded-3xl bg-deep-rose shadow-sm"
        >
          <div className="flex min-h-[8.5rem] flex-col items-center justify-center gap-1 px-5 py-8 text-cream">
            <LocalizedText
              as="span"
              value={event.title}
              locale={locale}
              className="font-display text-3xl"
            />
            <span className="text-sm text-cream/85">
              {formatEventDate(event.date, wedding.timezone, locale)}
            </span>
          </div>
        </ScratchReveal>
      </div>

      <dl className="mx-auto mt-8 grid max-w-md grid-cols-4 gap-3">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="rounded-2xl border border-blush bg-white/60 px-2 py-4"
          >
            <dd className="font-display text-3xl tabular-nums text-deep-rose">
              {unit.value === null ? "--" : String(unit.value).padStart(2, "0")}
            </dd>
            <dt
              dir={isUr ? "rtl" : undefined}
              lang={isUr ? "ur" : undefined}
              className={`mt-1 text-[0.65rem] uppercase tracking-wider text-ink/60 ${isUr ? "text-urdu" : ""}`}
            >
              {unit.label}
            </dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
