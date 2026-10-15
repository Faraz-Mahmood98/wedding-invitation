"use client";

import { useState } from "react";
import type { Locale, Messages } from "@/lib/i18n";
import type { GuestTypeName, InvitationEvent, RsvpStatusName } from "@/lib/invitation";
import { MAX_FAMILY_SEATS } from "@/lib/rsvp";
import { LocalizedText } from "./LocalizedText";

type Status = RsvpStatusName;

interface Entry {
  status: Status;
  seats: number;
  dietary: string;
  message: string;
  submitted: boolean;
  saving: boolean;
  error: boolean;
}

interface RsvpSectionProps {
  dict: Messages;
  locale: Locale;
  events: InvitationEvent[];
  guestType: GuestTypeName;
  weddingSlug: string;
  guestSlug: string;
}

function maxSeats(event: InvitationEvent): number {
  return event.seatsAllowed ?? MAX_FAMILY_SEATS;
}

function initialEntry(event: InvitationEvent): Entry {
  const rsvp = event.rsvp;
  return {
    status: rsvp?.status ?? "yes",
    seats: rsvp?.seatsConfirmed ?? Math.min(event.seatsAllowed ?? 1, maxSeats(event)),
    dietary: rsvp?.dietaryNotes ?? "",
    message: rsvp?.message ?? "",
    submitted: rsvp !== null,
    saving: false,
    error: false,
  };
}

export function RsvpSection({
  dict,
  locale,
  events,
  guestType,
  weddingSlug,
  guestSlug,
}: RsvpSectionProps) {
  const isUr = locale === "ur";
  const statusLabels: Array<{ value: Status; label: string }> = [
    { value: "yes", label: dict.rsvp.yes },
    { value: "no", label: dict.rsvp.no },
    { value: "maybe", label: dict.rsvp.maybe },
  ];

  const [entries, setEntries] = useState<Record<string, Entry>>(() =>
    Object.fromEntries(events.map((event) => [event.id, initialEntry(event)])),
  );

  if (events.length === 0) return null;

  const update = (id: string, patch: Partial<Entry>) =>
    setEntries((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const submit = async (event: InvitationEvent) => {
    const entry = entries[event.id];
    update(event.id, { saving: true, error: false });

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weddingSlug,
          guestSlug,
          eventId: event.id,
          status: entry.status,
          seatsConfirmed: entry.status === "no" ? 0 : entry.seats,
          dietaryNotes: entry.dietary,
          message: entry.message,
        }),
      });
      if (!response.ok) throw new Error("request failed");
      update(event.id, { saving: false, submitted: true });
    } catch {
      update(event.id, { saving: false, error: true });
    }
  };

  return (
    <section className="px-6 py-12">
      <h2
        dir={isUr ? "rtl" : undefined}
        lang={isUr ? "ur" : undefined}
        className={`text-center font-display text-3xl text-deep-rose ${isUr ? "text-urdu" : ""}`}
      >
        {dict.rsvp.title}
      </h2>
      <p className="mt-2 text-center text-sm text-ink/60">{dict.seats[guestType]}</p>

      <div className="mx-auto mt-8 flex max-w-xl flex-col gap-6">
        {events.map((event) => {
          const entry = entries[event.id];
          const max = maxSeats(event);
          return (
            <article
              key={event.id}
              className="rounded-3xl border border-blush bg-white/60 p-5"
            >
              <LocalizedText
                as="h3"
                value={event.title}
                locale={locale}
                className="font-display text-xl text-deep-rose"
              />

              {entry.submitted ? (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-blush/60 px-4 py-3">
                  <p className="text-sm text-deep-rose">{dict.rsvp.submitted}</p>
                  <button
                    type="button"
                    onClick={() => update(event.id, { submitted: false })}
                    className="shrink-0 text-sm font-medium text-deep-rose underline underline-offset-2"
                  >
                    {dict.rsvp.update}
                  </button>
                </div>
              ) : (
                <form
                  className="mt-4 flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void submit(event);
                  }}
                >
                  <div
                    role="radiogroup"
                    aria-label={dict.rsvp.title}
                    className="grid grid-cols-3 gap-2"
                  >
                    {statusLabels.map((option) => {
                      const active = entry.status === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => update(event.id, { status: option.value })}
                          className={
                            active
                              ? "rounded-full bg-deep-rose px-3 py-2 text-sm text-cream"
                              : "rounded-full border border-rose px-3 py-2 text-sm text-deep-rose"
                          }
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  {entry.status !== "no" ? (
                    <>
                      {max > 1 ? (
                        <label className="flex items-center justify-between gap-3 text-sm text-ink/80">
                          <span>{dict.rsvp.seats}</span>
                          <select
                            value={entry.seats}
                            onChange={(e) =>
                              update(event.id, { seats: Number(e.target.value) })
                            }
                            className="rounded-xl border border-blush bg-cream px-3 py-2 text-ink"
                          >
                            {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}

                      <label className="flex flex-col gap-1 text-sm text-ink/80">
                        <span>{dict.rsvp.dietary}</span>
                        <input
                          type="text"
                          value={entry.dietary}
                          onChange={(e) =>
                            update(event.id, { dietary: e.target.value })
                          }
                          className="rounded-xl border border-blush bg-cream px-3 py-2 text-ink"
                        />
                      </label>
                    </>
                  ) : null}

                  <label className="flex flex-col gap-1 text-sm text-ink/80">
                    <span>{dict.rsvp.message}</span>
                    <textarea
                      rows={2}
                      value={entry.message}
                      onChange={(e) => update(event.id, { message: e.target.value })}
                      className="rounded-xl border border-blush bg-cream px-3 py-2 text-ink"
                    />
                  </label>

                  {entry.error ? (
                    <p role="alert" className="text-sm text-deep-rose">
                      {dict.rsvp.error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={entry.saving}
                    className="rounded-full bg-deep-rose px-5 py-3 text-sm text-cream transition-colors hover:bg-ink disabled:opacity-60"
                  >
                    {entry.saving ? dict.rsvp.sending : dict.rsvp.submit}
                  </button>
                </form>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
