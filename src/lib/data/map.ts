import type {
  GuestTypeName,
  Invitation,
  InvitationEvent,
  InvitationFamily,
  InvitationFaq,
  InvitationWedding,
} from "@/lib/invitation";
import type { LocalizedText } from "@/lib/types";
import { normalizeTheme } from "@/lib/theme";
import { DEFAULT_OPENING_IMAGE } from "@/lib/images";

/**
 * Pure mapping from persisted rows to the `Invitation` view-model.
 * Kept free of Prisma so it can be unit-tested for tenant isolation.
 */

export interface WeddingRow {
  slug: string;
  coupleNameEn: string;
  coupleNameUr: string;
  theme: unknown;
  bismillahEnabled: boolean;
  musicUrl: string | null;
  openingImage: string | null;
  bgImages: string[];
  timezone: string;
  defaultLang: string;
  personalMessageEn: string | null;
  personalMessageUr: string | null;
}

export interface EventRow {
  id: string;
  order: number;
  titleEn: string;
  titleUr: string;
  date: Date | string;
  startTime: string;
  venueName: string;
  address: string;
  mapsUrl: string | null;
  hostedByEn: string | null;
  hostedByUr: string | null;
  posterImage: string | null;
  dressNote: string | null;
}

export interface FamilyRow {
  id: string;
  side: "groom" | "bride";
  headNameEn: string;
  headNameUr: string;
  memberNames: unknown;
  figureImage: string | null;
}

export interface FaqRow {
  id: string;
  order: number;
  questionEn: string;
  questionUr: string;
  answerEn: string;
  answerUr: string;
}

export interface GuestRow {
  slug: string;
  displayNameEn: string | null;
  displayNameUr: string | null;
  type: GuestTypeName;
  lang: string;
}

export interface GuestEventRow {
  eventId: string;
  seatsAllowed: number | null;
}

export interface RsvpRow {
  eventId: string;
  status: "yes" | "no" | "maybe";
  seatsConfirmed: number;
  dietaryNotes: string | null;
  message: string | null;
}

export interface InvitationInput {
  wedding: WeddingRow;
  guest: GuestRow;
  events: EventRow[];
  families: FamilyRow[];
  faqs: FaqRow[];
  guestEvents: GuestEventRow[];
  rsvps: RsvpRow[];
}

function toLocalized(en: string | null, ur: string | null): LocalizedText | null {
  if (!en && !ur) return null;
  return { en: en ?? "", ur: ur ?? "" };
}

function parseMemberNames(value: unknown): LocalizedText[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (entry && typeof entry === "object") {
        const record = entry as Record<string, unknown>;
        const en = typeof record.en === "string" ? record.en : "";
        const ur = typeof record.ur === "string" ? record.ur : "";
        if (en || ur) return { en, ur };
      }
      return null;
    })
    .filter((entry): entry is LocalizedText => entry !== null);
}

function isoDate(value: Date | string): string {
  return new Date(value).toISOString().slice(0, 10);
}

const SIDE_ORDER: Record<FamilyRow["side"], number> = { groom: 0, bride: 1 };

export function toInvitation(input: InvitationInput): Invitation {
  const seatByEvent = new Map(
    input.guestEvents.map((guestEvent) => [
      guestEvent.eventId,
      guestEvent.seatsAllowed,
    ]),
  );

  const rsvpByEvent = new Map(
    input.rsvps.map((rsvp) => [rsvp.eventId, rsvp]),
  );

  // Tenant isolation: only events this guest is explicitly invited to.
  const events: InvitationEvent[] = input.events
    .filter((event) => seatByEvent.has(event.id))
    .sort((a, b) => a.order - b.order)
    .map((event) => {
      const rsvp = rsvpByEvent.get(event.id);
      return {
        id: event.id,
        order: event.order,
        title: { en: event.titleEn, ur: event.titleUr },
        date: isoDate(event.date),
        startTime: event.startTime,
        venueName: event.venueName,
        address: event.address,
        mapsUrl: event.mapsUrl,
        hostedBy: toLocalized(event.hostedByEn, event.hostedByUr),
        posterImage: event.posterImage,
        dressNote: event.dressNote,
        seatsAllowed: seatByEvent.get(event.id) ?? null,
        rsvp: rsvp
          ? {
              status: rsvp.status,
              seatsConfirmed: rsvp.seatsConfirmed,
              dietaryNotes: rsvp.dietaryNotes,
              message: rsvp.message,
            }
          : null,
      };
    });

  const families: InvitationFamily[] = [...input.families]
    .sort(
      (a, b) =>
        SIDE_ORDER[a.side] - SIDE_ORDER[b.side],
    )
    .map((family) => ({
      id: family.id,
      side: family.side,
      headName: { en: family.headNameEn, ur: family.headNameUr },
      memberNames: parseMemberNames(family.memberNames),
      figureImage: family.figureImage,
    }));

  const faqs: InvitationFaq[] = [...input.faqs]
    .sort((a, b) => a.order - b.order)
    .map((faq) => ({
      id: faq.id,
      order: faq.order,
      question: { en: faq.questionEn, ur: faq.questionUr },
      answer: { en: faq.answerEn, ur: faq.answerUr },
    }));

  const wedding: InvitationWedding = {
    slug: input.wedding.slug,
    coupleName: {
      en: input.wedding.coupleNameEn,
      ur: input.wedding.coupleNameUr,
    },
    monogramInitials: input.wedding.slug === "bilal-sara" ? ["B", "S"] : undefined,
    theme: normalizeTheme(input.wedding.theme),
    bismillahEnabled: input.wedding.bismillahEnabled,
    musicUrl: input.wedding.musicUrl,
    openingImage: input.wedding.openingImage || DEFAULT_OPENING_IMAGE,
    bgImages: input.wedding.bgImages ?? [],
    timezone: input.wedding.timezone,
    defaultLang: input.wedding.defaultLang,
    personalMessage: toLocalized(
      input.wedding.personalMessageEn,
      input.wedding.personalMessageUr,
    ),
  };

  return {
    wedding,
    guest: {
      slug: input.guest.slug,
      displayName: toLocalized(input.guest.displayNameEn, input.guest.displayNameUr),
      type: input.guest.type,
      lang: input.guest.lang,
    },
    events,
    families,
    faqs,
  };
}
