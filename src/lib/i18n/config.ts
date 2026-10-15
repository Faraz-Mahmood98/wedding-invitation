export const locales = ["en", "ur"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeDir: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ur: "rtl",
};

export const localeLabel: Record<Locale, string> = {
  en: "EN",
  ur: "اردو",
};

/** `<html lang>` / `hreflang` values. */
export const localeHtmlLang: Record<Locale, string> = {
  en: "en",
  ur: "ur",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/** Resolves an unknown input (query param, DB value) to a supported locale. */
export function toLocale(value: unknown, fallback: Locale = defaultLocale): Locale {
  return isLocale(value) ? value : fallback;
}
