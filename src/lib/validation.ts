import { z } from "zod";

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

const optionalText = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((value) => (value ? value : undefined));

const requiredText = z.string().trim().min(1).max(2000);

const hexColor = z.string().trim().regex(HEX, "Expected a hex colour");

/** Absolute URL (https://…) or site-relative path (/images/…). Empty = unset. */
const mediaUrl = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((value) => {
    if (!value) return "";
    if (/^https?:\/\//i.test(value) || value.startsWith("/")) return value;
    return "";
  });

const password = z.string().min(8, "Use at least 8 characters").max(72);

const checkbox = z.preprocess(
  (value) => value === true || value === "on" || value === "true" || value === "1",
  z.boolean(),
);

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const rsvpSchema = z.object({
  weddingSlug: z.string().trim().min(1),
  guestSlug: z.string().trim().min(1),
  eventId: z.string().trim().min(1),
  status: z.enum(["yes", "no", "maybe"]),
  seatsConfirmed: z.coerce.number().int().min(0).max(50).default(0),
  dietaryNotes: optionalText,
  message: optionalText,
});

export const eventSchema = z.object({
  order: z.coerce.number().int().min(0).max(999),
  titleEn: requiredText,
  titleUr: requiredText,
  date: z.string().trim().regex(DATE, "Use YYYY-MM-DD"),
  startTime: z.string().trim().regex(TIME, "Use HH:mm"),
  venueName: requiredText,
  address: requiredText,
  mapsUrl: optionalText,
  hostedByEn: optionalText,
  hostedByUr: optionalText,
  posterImage: optionalText,
  dressNote: optionalText,
});

export const familySchema = z.object({
  side: z.enum(["groom", "bride"]),
  headNameEn: requiredText,
  headNameUr: requiredText,
  membersEn: optionalText,
  membersUr: optionalText,
  figureImage: optionalText,
  order: z.coerce.number().int().min(0).max(999).default(0),
});

export const faqSchema = z.object({
  order: z.coerce.number().int().min(0).max(999),
  questionEn: requiredText,
  questionUr: requiredText,
  answerEn: requiredText,
  answerUr: requiredText,
});

export const guestSchema = z.object({
  displayNameEn: requiredText,
  displayNameUr: optionalText,
  type: z.enum(["single", "couple", "family"]),
  phone: optionalText,
  lang: z.enum(["en", "ur"]).default("en"),
  slug: optionalText,
});

export const weddingSettingsSchema = z.object({
  coupleNameEn: requiredText,
  coupleNameUr: requiredText,
  defaultLang: z.enum(["en", "ur"]).default("en"),
  timezone: requiredText,
  bismillahEnabled: checkbox,
  personalMessageEn: optionalText,
  personalMessageUr: optionalText,
  /** Empty = the built-in default background. */
  openingImage: mediaUrl,
  /** Empty = no background music. */
  musicUrl: mediaUrl,
  blush: hexColor,
  cream: hexColor,
  rose: hexColor,
  deepRose: hexColor,
  gold: hexColor,
  ink: hexColor,
});

/* --------------------------------------------------------- super admin --- */

const slugField = z
  .string()
  .trim()
  .max(64)
  .optional()
  .transform((value) => (value ? slugify(value) : ""));

export const newWeddingSchema = z.object({
  coupleNameEn: requiredText,
  coupleNameUr: requiredText,
  slug: slugField,
  adminEmail: z.email("Enter a valid email").transform((value) => value.toLowerCase()),
  password,
  timezone: z.string().trim().min(1).max(100).default("Asia/Karachi"),
  defaultLang: z.enum(["en", "ur"]).default("en"),
});

export const superWeddingUpdateSchema = z.object({
  coupleNameEn: requiredText,
  coupleNameUr: requiredText,
  slug: z.string().trim().min(1).max(64).transform((value) => slugify(value)),
  adminEmail: z.email("Enter a valid email").transform((value) => value.toLowerCase()),
  timezone: z.string().trim().min(1).max(100).default("Asia/Karachi"),
  defaultLang: z.enum(["en", "ur"]).default("en"),
});

export const passwordResetSchema = z.object({ password });

export type EventInput = z.infer<typeof eventSchema>;
export type FamilyInput = z.infer<typeof familySchema>;
export type FaqInput = z.infer<typeof faqSchema>;
export type GuestInput = z.infer<typeof guestSchema>;
export type WeddingSettingsInput = z.infer<typeof weddingSettingsSchema>;
export type NewWeddingInput = z.infer<typeof newWeddingSchema>;
export type SuperWeddingUpdateInput = z.infer<typeof superWeddingUpdateSchema>;
export type RsvpInput = z.infer<typeof rsvpSchema>;

/** URL-safe slug; falls back to a random suffix when nothing usable remains. */
export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || `guest-${Math.random().toString(36).slice(2, 8)}`;
}

/** Zips parallel comma-separated en/ur member lists into localized pairs. */
export function zipMembers(en?: string, ur?: string): Array<{ en: string; ur: string }> {
  const listEn = (en ?? "").split(",").map((value) => value.trim());
  const listUr = (ur ?? "").split(",").map((value) => value.trim());
  const length = Math.max(listEn.length, listUr.length);
  const result: Array<{ en: string; ur: string }> = [];
  for (let i = 0; i < length; i += 1) {
    const enValue = listEn[i] ?? "";
    const urValue = listUr[i] ?? "";
    if (enValue || urValue) result.push({ en: enValue, ur: urValue });
  }
  return result;
}

export interface CsvGuestRow {
  displayNameEn: string;
  displayNameUr?: string;
  type: "single" | "couple" | "family";
  phone?: string;
  lang: "en" | "ur";
  slug: string;
  /** Event order -> seats (null = full family). */
  events: Array<{ order: number; seats: number | null }>;
}

/**
 * Parses the guest CSV. Header row (case-insensitive):
 * `name_en,name_ur,type,phone,lang,slug,events`
 * where `events` is `1:1;2:2` (order:seats, or `order:full`).
 */
export function parseGuestCsv(text: string): CsvGuestRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const header = lines[0].toLowerCase().split(",").map((cell) => cell.trim());
  const hasHeader = header.includes("name_en") || header.includes("type");
  const rows = hasHeader ? lines.slice(1) : lines;

  return rows
    .map((line) => {
      const cells = line.split(",").map((cell) => cell.trim());
      const get = (name: string) => {
        const index = header.indexOf(name);
        return index >= 0 ? cells[index] : undefined;
      };

      const events = (get("events") ?? "")
        .split(";")
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
          const [orderRaw, seatsRaw] = entry.split(":");
          const order = Number(orderRaw);
          const seats =
            seatsRaw === "full" || seatsRaw === ""
              ? null
              : Number(seatsRaw);
          return { order, seats };
        })
        .filter((entry) => Number.isFinite(entry.order));

      const type = (get("type") ?? "single") as CsvGuestRow["type"];
      const nameEn = get("name_en") ?? cells[0] ?? "";

      return {
        displayNameEn: nameEn,
        displayNameUr: get("name_ur") || undefined,
        type: (["single", "couple", "family"].includes(type) ? type : "single"),
        phone: get("phone") || undefined,
        lang: (get("lang") === "ur" ? "ur" : "en") as "en" | "ur",
        slug: get("slug") || slugify(nameEn),
        events,
      };
    })
    .filter((row) => row.displayNameEn.length > 0);
}
