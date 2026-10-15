import Link from "next/link";
import {
  getDictionary,
  toLocale,
  locales,
  localeLabel,
} from "@/lib/i18n";
import { DEFAULT_THEME, themeToCssVars, type PaletteKey } from "@/lib/theme";
import { styleFromCssVars } from "@/lib/css";

const DEMO_COUPLE = { en: "Ahmad & Mawra", ur: "احمد اور ماورہ" };

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang } = await searchParams;
  const locale = toLocale(lang);
  const t = getDictionary(locale);
  const dir = locale === "ur" ? "rtl" : "ltr";

  return (
    <main
      style={styleFromCssVars(themeToCssVars(DEFAULT_THEME))}
      className="min-h-screen bg-cream px-5 py-10 text-ink"
    >
      <div className="mx-auto flex max-w-xl flex-col gap-8">
        <header className="flex items-center justify-between">
          <span className="font-display text-2xl text-deep-rose">Wedding Invites</span>
          <nav className="flex items-center gap-2 text-sm" aria-label={t.common.language}>
            {locales.map((l) => (
              <Link
                key={l}
                href={`/?lang=${l}`}
                className={
                  l === locale
                    ? "rounded-full bg-deep-rose px-3 py-1 text-cream"
                    : "rounded-full border border-rose px-3 py-1 text-deep-rose"
                }
                hrefLang={l}
              >
                {localeLabel[l]}
              </Link>
            ))}
          </nav>
        </header>

        <section className="rounded-3xl border border-blush bg-white/60 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-gold">
            {t.opening.invitedTo}
          </p>
          <h1
            dir={dir}
            lang={locale}
            className="mt-2 font-display text-4xl text-deep-rose"
          >
            {DEMO_COUPLE[locale]}
          </h1>
          <p
            dir={dir}
            lang={locale}
            className={locale === "ur" ? "text-urdu mt-3" : "mt-3"}
          >
            {t.opening.tapToOpen} · {t.hero.withLove}
          </p>
        </section>

        <section aria-labelledby="palette-heading">
          <h2 id="palette-heading" className="mb-3 font-display text-xl text-ink">
            Theme tokens
          </h2>
          <ul className="grid grid-cols-3 gap-3">
            {(Object.keys(DEFAULT_THEME.palette) as PaletteKey[]).map((key) => (
              <li
                key={key}
                className="flex flex-col items-center gap-2 rounded-2xl border border-blush bg-white/50 p-3"
              >
                <span
                  className="h-10 w-10 rounded-full border border-black/10"
                  style={{ backgroundColor: DEFAULT_THEME.palette[key] }}
                  aria-hidden
                />
                <span className="text-xs text-ink/70">{key}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="seats-heading" className="rounded-3xl border border-blush bg-white/60 p-6">
          <h2 id="seats-heading" className="mb-3 font-display text-xl text-deep-rose">
            {t.faq.title}
          </h2>
          <ul
            dir={dir}
            lang={locale}
            className={locale === "ur" ? "text-urdu flex flex-col gap-2" : "flex flex-col gap-2"}
          >
            <li>{t.seats.single}</li>
            <li>{t.seats.couple}</li>
            <li>{t.seats.family}</li>
          </ul>
        </section>

        <footer className="pt-4 text-center text-xs text-ink/50">
          Phase 1 · scaffold · schema · i18n · theme
        </footer>
      </div>
    </main>
  );
}
