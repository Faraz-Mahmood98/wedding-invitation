import type { Locale, Messages } from "@/lib/i18n";
import type { InvitationFaq } from "@/lib/invitation";
import { LocalizedText } from "./LocalizedText";

interface FaqSectionProps {
  dict: Messages;
  locale: Locale;
  faqs: InvitationFaq[];
}

export function FaqSection({ dict, locale, faqs }: FaqSectionProps) {
  if (faqs.length === 0) return null;

  return (
    <section className="px-6 py-12">
      <h2
        dir={locale === "ur" ? "rtl" : undefined}
        lang={locale === "ur" ? "ur" : undefined}
        className={`text-center font-display text-3xl text-deep-rose ${locale === "ur" ? "text-urdu" : ""}`}
      >
        {dict.faq.title}
      </h2>
      <div className="mx-auto mt-8 max-w-xl divide-y divide-blush overflow-hidden rounded-3xl border border-blush bg-white/50">
        {faqs.map((faq) => (
          <details key={faq.id} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
              <LocalizedText
                value={faq.question}
                locale={locale}
                className="text-left font-medium text-ink"
              />
              <span
                aria-hidden="true"
                className="shrink-0 text-xl text-gold transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <LocalizedText
              as="p"
              value={faq.answer}
              locale={locale}
              className="px-5 pb-5 text-sm leading-relaxed text-ink/75"
            />
          </details>
        ))}
      </div>
    </section>
  );
}
