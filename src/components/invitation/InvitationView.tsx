import { getDictionary, type Locale } from "@/lib/i18n";
import type { Invitation } from "@/lib/invitation";
import { themeToCssVars } from "@/lib/theme";
import { styleFromCssVars } from "@/lib/css";
import { InvitationProvider } from "./InvitationProvider";
import { OpeningGate } from "./OpeningGate";
import { MusicToggle } from "./MusicToggle";
import { Hero } from "./Hero";
import { Families } from "./Families";
import { PersonalMessage } from "./PersonalMessage";
import { CountdownSection } from "./CountdownSection";
import { EventsSection } from "./EventsSection";
import { RsvpSection } from "./RsvpSection";
import { FaqSection } from "./FaqSection";
import { Closing } from "./Closing";
import { LanguageToggle } from "./LanguageToggle";
import { Reveal } from "./anim/Reveal";
import { IntroReveal } from "./anim/IntroReveal";

interface InvitationViewProps {
  invitation: Invitation;
  locale: Locale;
}

export function InvitationView({ invitation, locale }: InvitationViewProps) {
  const dict = getDictionary(locale);
  const { wedding, guest, events, families, faqs } = invitation;
  const firstEvent = events[0] ?? null;

  return (
    <InvitationProvider
      musicUrl={wedding.musicUrl}
      storageKey={`invite-muted:${wedding.slug}`}
    >
      <div
        style={{
          ...styleFromCssVars(themeToCssVars(wedding.theme)),
          backgroundColor: "var(--theme-palette-cream)",
          backgroundImage:
            "linear-gradient(180deg, var(--theme-palette-blush) 0%, var(--theme-palette-cream) 34%)",
        }}
        className="min-h-screen overflow-x-hidden text-ink"
      >
        <OpeningGate
          dict={dict}
          locale={locale}
          coupleName={wedding.coupleName}
          monogramInitials={wedding.monogramInitials}
          image={wedding.openingImage}
        />
        <MusicToggle labels={{ mute: dict.common.mute, unmute: dict.common.unmute }} />
        <LanguageToggle locale={locale} />

        <main className="mx-auto w-full max-w-4xl pb-24">
          <IntroReveal>
            <Hero dict={dict} locale={locale} wedding={wedding} firstEvent={firstEvent} />
          </IntroReveal>
          <Reveal>
            <Families dict={dict} locale={locale} families={families} />
          </Reveal>
          <Reveal>
            <PersonalMessage
              dict={dict}
              locale={locale}
              guest={guest}
              message={wedding.personalMessage}
            />
          </Reveal>
          <Reveal>
            <CountdownSection
              dict={dict}
              locale={locale}
              wedding={wedding}
              event={firstEvent}
            />
          </Reveal>
          <Reveal>
            <EventsSection
              dict={dict}
              locale={locale}
              timezone={wedding.timezone}
              events={events}
              guestType={guest.type}
            />
          </Reveal>
          <Reveal>
            <RsvpSection
              dict={dict}
              locale={locale}
              events={events}
              guestType={guest.type}
              weddingSlug={wedding.slug}
              guestSlug={guest.slug}
            />
          </Reveal>
          <Reveal>
            <FaqSection dict={dict} locale={locale} faqs={faqs} />
          </Reveal>
          <Reveal>
            <Closing dict={dict} locale={locale} coupleName={wedding.coupleName} monogramInitials={wedding.monogramInitials} />
          </Reveal>
        </main>
      </div>
    </InvitationProvider>
  );
}
