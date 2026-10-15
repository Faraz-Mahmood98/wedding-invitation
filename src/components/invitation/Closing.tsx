import type { Locale, Messages } from "@/lib/i18n";
import type { LocalizedTextPartial } from "@/lib/types";
import { pick } from "@/lib/types";
import { initialsFromCoupleName } from "@/lib/monogram";
import { LocalizedText } from "./LocalizedText";
import { FloralCorner, FloralDivider, Monogram } from "./Florals";

interface ClosingProps {
  dict: Messages;
  locale: Locale;
  coupleName: LocalizedTextPartial;
}

export function Closing({ dict, locale, coupleName }: ClosingProps) {
  const isUr = locale === "ur";
  const initials = initialsFromCoupleName(pick(coupleName, locale));

  return (
    <section className="relative overflow-hidden rounded-t-3xl bg-blush/40 px-6 pb-16 pt-12 text-center">
      <FloralCorner className="pointer-events-none absolute -left-6 -top-6 h-28 w-28 -scale-y-100 opacity-70 sm:h-36 sm:w-36" />
      <FloralCorner className="pointer-events-none absolute -right-6 -top-6 h-28 w-36 -scale-x-100 -scale-y-100 opacity-70 sm:h-36 sm:w-36" />

      <Monogram
        initials={initials}
        className="mx-auto h-20 w-20 sm:h-24 sm:w-24"
        labelClassName="text-2xl text-deep-rose sm:text-3xl"
      />

      <FloralDivider className="mx-auto mt-6 h-6 w-56 max-w-full sm:w-72" />

      <p
        dir={isUr ? "rtl" : undefined}
        lang={isUr ? "ur" : undefined}
        className={`mx-auto mt-6 max-w-md text-sm text-ink/75 ${isUr ? "text-urdu" : ""}`}
      >
        {dict.closing.message}
      </p>
      <LocalizedText
        as="p"
        value={coupleName}
        locale={locale}
        className="mt-4 font-display text-3xl text-deep-rose"
      />
      <footer className="mt-10 flex flex-col items-center gap-4">
        <span className="h-px w-24 bg-gold/60" aria-hidden="true" />
        <span
          aria-hidden="true"
          className="block h-1.5 w-1.5 rounded-full bg-gold"
        />
      </footer>
    </section>
  );
}
