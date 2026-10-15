import type { Locale } from "@/lib/i18n";
import type { Messages } from "@/lib/i18n";
import { BISMILLAH_ARABIC, type InvitationEvent, type InvitationWedding } from "@/lib/invitation";
import { formatEventShortDate } from "@/lib/time";
import { initialsFromCoupleName } from "@/lib/monogram";
import { pick } from "@/lib/types";
import { LocalizedText } from "./LocalizedText";
import { Monogram, FloralCorner, FloralDivider } from "./Florals";

interface HeroProps {
  dict: Messages;
  locale: Locale;
  wedding: InvitationWedding;
  firstEvent: InvitationEvent | null;
}

export function Hero({ dict, locale, wedding, firstEvent }: HeroProps) {
  const initials = initialsFromCoupleName(pick(wedding.coupleName, locale));

  return (
    <section className="relative flex flex-col items-center overflow-hidden px-6 pt-20 pb-14 text-center sm:pt-28">
      <FloralCorner className="pointer-events-none absolute -left-6 -top-5 h-32 w-32 opacity-70 sm:h-44 sm:w-44" />
      <FloralCorner className="pointer-events-none absolute -right-6 -top-5 h-32 w-32 -scale-x-100 opacity-70 sm:h-44 sm:w-44" />

      {wedding.bismillahEnabled ? (
        <>
          <p className="font-arabic text-3xl leading-relaxed text-deep-rose sm:text-4xl">
            {BISMILLAH_ARABIC}
          </p>
          <p
            dir={locale === "ur" ? "rtl" : undefined}
            lang={locale === "ur" ? "ur" : undefined}
            className={`mt-3 max-w-md text-sm text-ink/70 ${locale === "ur" ? "text-urdu" : ""}`}
          >
            {dict.hero.bismillahTranslation}
          </p>
          <FloralDivider className="mt-8 h-6 w-56 max-w-full sm:w-72" />
        </>
      ) : (
        <FloralDivider className="mt-2 h-6 w-56 max-w-full sm:w-72" />
      )}

      <p className="mt-8 text-xs uppercase tracking-[0.35em] text-gold">
        {dict.hero.withLove}
      </p>

      <Monogram
        initials={initials}
        className="mt-5 h-16 w-16 sm:h-20 sm:w-20"
        labelClassName="text-xl text-deep-rose sm:text-2xl"
      />

      <LocalizedText
        as="h1"
        value={wedding.coupleName}
        locale={locale}
        className="mt-4 font-display text-4xl text-deep-rose sm:text-6xl"
      />

      {firstEvent ? (
        <p className="mt-5 text-sm tracking-wide text-ink/70">
          <LocalizedText value={firstEvent.title} locale={locale} className="font-semibold" />
          <span className="mx-2 text-rose">·</span>
          {formatEventShortDate(firstEvent.date, wedding.timezone, locale)}
        </p>
      ) : null}
    </section>
  );
}
