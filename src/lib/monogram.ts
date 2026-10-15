/**
 * Derives monogram initials from a couple name for the opening medallion.
 * "Ahmad & Mawra" -> ["A", "M"]; "Ahmad and Mawra" -> ["A", "M"];
 * "احمد اور ماورہ" -> ["ا", "م"]. "&" may join names directly; "and"/"اور" must
 * be whole whitespace-delimited words. Falls back to the first character when
 * no separator is present, and to a heart for empty names.
 */
const SEPARATORS = /\s*&\s*|\s+(?:and|اور)\s+/i;

export function initialsFromCoupleName(name: string): string[] {
  const parts = name
    .split(SEPARATORS)
    .map((part) => part.trim())
    .filter(Boolean);

  const source = parts.length > 1 ? parts : [name.trim()];
  const initials = source
    .map((part) => Array.from(part)[0] ?? "")
    .filter(Boolean);

  return initials.length > 0 ? initials : ["♥"];
}
