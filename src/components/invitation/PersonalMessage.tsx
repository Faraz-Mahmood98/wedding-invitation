import type { Locale, Messages } from "@/lib/i18n";
import type { InvitationGuest } from "@/lib/invitation";
import { pick, type LocalizedTextPartial } from "@/lib/types";
import { LocalizedText } from "./LocalizedText";

interface PersonalMessageProps {
  dict: Messages;
  locale: Locale;
  guest: InvitationGuest;
  message: LocalizedTextPartial | null;
}

export function PersonalMessage({ dict, locale, guest, message }: PersonalMessageProps) {
  if (!message) return null;
  const isUr = locale === "ur";

  return (
    <section className="px-6 py-6">
      <div className="mx-auto max-w-2xl rounded-3xl border border-blush bg-white/50 px-6 py-10 text-center">
        <p
          dir={isUr ? "rtl" : undefined}
          lang={isUr ? "ur" : undefined}
          className={`font-display text-2xl text-deep-rose ${isUr ? "text-urdu" : ""}`}
        >
          {dict.message.dear}{" "}
          <LocalizedText
            value={guest.displayName}
            locale={locale}
            className="text-ink"
          />
          {pick(guest.displayName, locale) ? "," : ""}
        </p>
        <LocalizedText
          as="p"
          value={message}
          locale={locale}
          className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink/80"
        />
      </div>
    </section>
  );
}
