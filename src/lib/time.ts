import type { Locale } from "./i18n";

/**
 * Offset (ms) between the wall clock in `timeZone` and UTC for a given instant.
 * Positive for zones ahead of UTC.
 */
function timeZoneOffsetMs(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const map: Record<string, string> = {};
  for (const part of dtf.formatToParts(date)) map[part.type] = part.value;
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );
  return asUtc - date.getTime();
}

/**
 * Converts a wall-clock date + time in a named timezone to the corresponding
 * UTC `Date`. Used for the countdown and .ics generation.
 */
export function zonedWallTimeToUtc(
  dateISO: string,
  timeHHmm: string,
  timeZone: string,
): Date {
  const [y, mo, d] = dateISO.slice(0, 10).split("-").map(Number);
  const [h, mi] = timeHHmm.split(":").map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi, 0);
  // Two passes converge across DST transitions.
  const firstOffset = timeZoneOffsetMs(new Date(guess), timeZone);
  const secondOffset = timeZoneOffsetMs(new Date(guess - firstOffset), timeZone);
  return new Date(guess - secondOffset);
}

function intlLocale(locale: Locale): string {
  return locale === "ur" ? "ur-PK" : "en-GB";
}

export function formatEventDate(
  dateISO: string,
  timeZone: string,
  locale: Locale,
): string {
  const noon = zonedWallTimeToUtc(dateISO, "12:00", timeZone);
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(noon);
}

export function formatEventShortDate(
  dateISO: string,
  timeZone: string,
  locale: Locale,
): string {
  const noon = zonedWallTimeToUtc(dateISO, "12:00", timeZone);
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone,
    day: "numeric",
    month: "long",
  }).format(noon);
}

export function formatEventTime(timeHHmm: string, locale: Locale): string {
  const [h, mi] = timeHHmm.split(":").map(Number);
  const base = new Date(Date.UTC(2000, 0, 1, h, mi));
  return new Intl.DateTimeFormat(locale === "ur" ? "ur-PK" : "en-US", {
    timeZone: "UTC",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(base);
}
