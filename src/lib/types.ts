import type { Locale } from "./i18n/config";

/** A piece of content stored in both languages. */
export interface LocalizedText {
  en: string;
  ur: string;
}

export type LocalizedTextPartial = Partial<LocalizedText>;

/** Picks a value from a localized record, falling back to English then empty. */
export function pick(
  text: LocalizedTextPartial | null | undefined,
  locale: Locale,
): string {
  if (!text) return "";
  const value = text[locale];
  if (typeof value === "string" && value.trim()) return value;
  return text.en ?? "";
}

export function localized(en: string, ur: string): LocalizedText {
  return { en, ur };
}
