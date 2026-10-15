import Image from "next/image";
import type { Locale, Messages } from "@/lib/i18n";
import type { GuestTypeName, InvitationEvent } from "@/lib/invitation";
import { formatEventDate, formatEventTime } from "@/lib/time";
import { LocalizedText } from "./LocalizedText";
import { PetalLayer } from "./anim/PetalLayer";

interface EventCardProps {
  dict: Messages;
  locale: Locale;
  timezone: string;
  event: InvitationEvent;
  guestType: GuestTypeName;
}

export function EventCard({ dict, locale, timezone, event, guestType }: EventCardProps) {
  const isUr = locale === "ur";
  const seatLabel = dict.seats[guestType];

  return (
    <PetalLayer className="rounded-3xl border border-blush bg-white/60 shadow-sm">
      <div className="relative h-44 w-full sm:h-56">
        {event.posterImage ? (
          <Image
            src={event.posterImage}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 640px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-rose via-deep-rose to-ink" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
          <LocalizedText
            as="h3"
            value={event.title}
            locale={locale}
            className="font-display text-3xl text-cream"
          />
          <span className="rounded-full bg-cream/90 px-3 py-1 text-xs font-medium text-deep-rose">
            {formatEventDate(event.date, timezone, locale)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <p className="text-sm text-ink/80">
          {formatEventTime(event.startTime, locale)}{" "}
          <span className={isUr ? "text-urdu" : ""} dir={isUr ? "rtl" : undefined}>
            {dict.events.onwards}
          </span>
        </p>

        <div className="flex flex-col gap-1">
          <p className="font-medium text-ink">{event.venueName}</p>
          <p
            dir={isUr ? "rtl" : undefined}
            lang={isUr ? "ur" : undefined}
            className="text-sm text-ink/60"
          >
            {event.address}
          </p>
        </div>

        {event.hostedBy ? (
          <p className="text-sm text-ink/70">
            <span className="text-ink/50">{dict.events.hostedBy}: </span>
            <LocalizedText value={event.hostedBy} locale={locale} />
          </p>
        ) : null}

        {event.dressNote ? (
          <p className="text-sm text-ink/70">
            <span className="text-ink/50">{dict.events.dressCode}: </span>
            {event.dressNote}
          </p>
        ) : null}

        <div className="rounded-2xl bg-blush/60 px-4 py-3 text-center">
          <span
            dir={isUr ? "rtl" : undefined}
            lang={isUr ? "ur" : undefined}
            className={`text-sm font-medium text-deep-rose ${isUr ? "text-urdu" : ""}`}
          >
            {seatLabel}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {event.mapsUrl ? (
            <a
              href={event.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center rounded-full bg-deep-rose px-5 py-3 text-sm text-cream transition-colors hover:bg-ink"
            >
              {dict.events.openLocation}
            </a>
          ) : null}
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center rounded-full border border-deep-rose px-5 py-3 text-sm text-deep-rose transition-colors hover:bg-blush"
          >
            {dict.events.addToCalendar}
          </button>
        </div>
      </div>
    </PetalLayer>
  );
}
