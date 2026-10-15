import en from "./messages/en.json";
import ur from "./messages/ur.json";
import { defaultLocale, localeDir, type Locale } from "./config";

export type Messages = typeof en;

const dictionaries: Record<Locale, Messages> = {
  en,
  ur: ur as Messages,
};

/** Returns the UI string table for a locale (English shape is authoritative). */
export function getDictionary(locale: Locale): Messages {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

export function dirFor(locale: Locale): "ltr" | "rtl" {
  return localeDir[locale];
}

/** Minimal `{token}` interpolation. */
export function format(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match,
  );
}

export { locales, defaultLocale, isLocale, toLocale, localeDir, localeLabel } from "./config";
export type { Locale } from "./config";
