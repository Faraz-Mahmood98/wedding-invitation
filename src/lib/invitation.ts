import type { WeddingTheme } from "./theme";
import type { LocalizedText } from "./types";

export type GuestTypeName = "single" | "couple" | "family";

export type RsvpStatusName = "yes" | "no" | "maybe";

export interface InvitationRsvp {
  status: RsvpStatusName;
  seatsConfirmed: number;
  dietaryNotes: string | null;
  message: string | null;
}

export interface InvitationWedding {
  slug: string;
  coupleName: LocalizedText;
  /** Optional override for the monogram initials. When set, used instead of deriving from coupleName. */
  monogramInitials?: string[];
  theme: WeddingTheme;
  bismillahEnabled: boolean;
  musicUrl: string | null;
  openingImage: string | null;
  bgImages: string[];
  timezone: string;
  defaultLang: string;
  personalMessage: LocalizedText | null;
}

export interface InvitationEvent {
  id: string;
  order: number;
  title: LocalizedText;
  /** ISO date string, e.g. "2026-12-04". */
  date: string;
  /** Local start time as HH:mm in the wedding timezone. */
  startTime: string;
  venueName: string;
  address: string;
  mapsUrl: string | null;
  hostedBy: LocalizedText | null;
  posterImage: string | null;
  dressNote: string | null;
  /** null for family with unlimited seats. */
  seatsAllowed: number | null;
  /** Existing RSVP for this event, if the guest already responded. */
  rsvp: InvitationRsvp | null;
}

export interface InvitationFamily {
  id: string;
  side: "groom" | "bride";
  headName: LocalizedText;
  memberNames: LocalizedText[];
  figureImage: string | null;
}

export interface InvitationFaq {
  id: string;
  order: number;
  question: LocalizedText;
  answer: LocalizedText;
}

export interface InvitationGuest {
  slug: string;
  displayName: LocalizedText | null;
  type: GuestTypeName;
  lang: string;
}

export interface Invitation {
  wedding: InvitationWedding;
  guest: InvitationGuest;
  /** Only the events this guest is invited to, ordered. */
  events: InvitationEvent[];
  families: InvitationFamily[];
  faqs: InvitationFaq[];
}

export type SeatLabelKey = GuestTypeName;

/** Seat label for a guest type, resolved against `messages.seats`. */
export function seatLabelKey(type: GuestTypeName): SeatLabelKey {
  return type;
}

/** Arabic Bismillah, rendered with the Amiri font. */
export const BISMILLAH_ARABIC = "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
