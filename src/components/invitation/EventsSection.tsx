import type { Locale, Messages } from "@/lib/i18n";
import type { GuestTypeName, InvitationEvent } from "@/lib/invitation";
import { EventCard } from "./EventCard";

interface EventsSectionProps {
  dict: Messages;
  locale: Locale;
  timezone: string;
  events: InvitationEvent[];
  guestType: GuestTypeName;
}

export function EventsSection({
  dict,
  locale,
  timezone,
  events,
  guestType,
}: EventsSectionProps) {
  if (events.length === 0) return null;

  return (
    <section className="px-6 py-12">
      <h2
        dir={locale === "ur" ? "rtl" : undefined}
        lang={locale === "ur" ? "ur" : undefined}
        className={`text-center font-display text-3xl text-deep-rose ${locale === "ur" ? "text-urdu" : ""}`}
      >
        {dict.events.title}
      </h2>
      <div className="mx-auto mt-8 flex max-w-xl flex-col gap-8">
        {events.map((event) => (
          <EventCard
            key={event.id}
            dict={dict}
            locale={locale}
            timezone={timezone}
            event={event}
            guestType={guestType}
          />
        ))}
      </div>
    </section>
  );
}
