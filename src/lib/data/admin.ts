import { prisma } from "@/lib/prisma";
import { demoMode } from "@/lib/data/invitation";
import {
  DEMO_DEFAULT_GUEST,
  DEMO_GUEST_SLUGS,
  DEMO_WEDDING_ID,
  DEMO_WEDDING_SLUG,
  getDemoInvitationFor,
} from "@/lib/fixtures/demo-invitation";
import { normalizeTheme, type WeddingTheme } from "@/lib/theme";
import type { Invitation } from "@/lib/invitation";

export interface AdminWedding {
  id: string;
  slug: string;
  coupleNameEn: string;
  coupleNameUr: string;
  timezone: string;
  defaultLang: string;
  bismillahEnabled: boolean;
  personalMessageEn: string | null;
  personalMessageUr: string | null;
  theme: WeddingTheme;
  musicUrl: string | null;
  openingImage: string | null;
  adminEmail: string | null;
}

export interface AdminEvent {
  id: string;
  order: number;
  titleEn: string;
  titleUr: string;
  date: string;
  startTime: string;
  venueName: string;
  address: string;
  mapsUrl: string | null;
  hostedByEn: string | null;
  hostedByUr: string | null;
  posterImage: string | null;
  dressNote: string | null;
}

export interface AdminFamily {
  id: string;
  side: "groom" | "bride";
  headNameEn: string;
  headNameUr: string;
  memberNames: Array<{ en: string; ur: string }>;
  figureImage: string | null;
  order: number;
}

export interface AdminFaq {
  id: string;
  order: number;
  questionEn: string;
  questionUr: string;
  answerEn: string;
  answerUr: string;
}

export interface AdminGuest {
  id: string;
  slug: string;
  displayNameEn: string;
  displayNameUr: string;
  type: "single" | "couple" | "family";
  phone: string | null;
  lang: string;
  openedAt: string | null;
  openCount: number;
  invites: Array<{ eventId: string; seatsAllowed: number | null }>;
  rsvps: Array<{ eventId: string; status: "yes" | "no" | "maybe"; seatsConfirmed: number }>;
}

export interface EventRsvpStats {
  eventId: string;
  titleEn: string;
  titleUr: string;
  date: string;
  invited: number;
  yes: number;
  no: number;
  maybe: number;
  pending: number;
  confirmedSeats: number;
}

export interface AdminOverview {
  wedding: AdminWedding;
  events: AdminEvent[];
  eventCount: number;
  familyCount: number;
  faqCount: number;
  guestCount: number;
  openedCount: number;
  rsvpStats: EventRsvpStats[];
}

function isDemoWedding(weddingId: string): boolean {
  return demoMode() && weddingId === DEMO_WEDDING_ID;
}

/* ------------------------------------------------------------------ demo --- */

function demoInvitations(): Invitation[] {
  return DEMO_GUEST_SLUGS.map((slug) => getDemoInvitationFor(DEMO_WEDDING_SLUG, slug)).filter(
    (value): value is Invitation => value !== null,
  );
}

function demoWedding(): AdminWedding {
  const base =
    getDemoInvitationFor(DEMO_WEDDING_SLUG, DEMO_DEFAULT_GUEST) ?? demoInvitations()[0];
  return {
    id: DEMO_WEDDING_ID,
    slug: base.wedding.slug,
    coupleNameEn: base.wedding.coupleName.en,
    coupleNameUr: base.wedding.coupleName.ur,
    timezone: base.wedding.timezone,
    defaultLang: base.wedding.defaultLang,
    bismillahEnabled: base.wedding.bismillahEnabled,
    personalMessageEn: base.wedding.personalMessage?.en ?? null,
    personalMessageUr: base.wedding.personalMessage?.ur ?? null,
    theme: base.wedding.theme,
    musicUrl: base.wedding.musicUrl,
    openingImage: base.wedding.openingImage,
    adminEmail: "ahmad.mawra@example.com",
  };
}

function demoEvents(): AdminEvent[] {
  const first = demoInvitations()[0];
  if (!first) return [];
  return first.events.map((event) => ({
    id: event.id,
    order: event.order,
    titleEn: event.title.en,
    titleUr: event.title.ur,
    date: event.date,
    startTime: event.startTime,
    venueName: event.venueName,
    address: event.address,
    mapsUrl: event.mapsUrl,
    hostedByEn: event.hostedBy?.en ?? null,
    hostedByUr: event.hostedBy?.ur ?? null,
    posterImage: event.posterImage,
    dressNote: event.dressNote,
  }));
}

function demoFamilies(): AdminFamily[] {
  const first = demoInvitations()[0];
  if (!first) return [];
  return first.families.map((family, index) => ({
    id: family.id,
    side: family.side,
    headNameEn: family.headName.en,
    headNameUr: family.headName.ur,
    memberNames: family.memberNames,
    figureImage: family.figureImage,
    order: index,
  }));
}

function demoFaqs(): AdminFaq[] {
  const first = demoInvitations()[0];
  if (!first) return [];
  return first.faqs.map((faq) => ({
    id: faq.id,
    order: faq.order,
    questionEn: faq.question.en,
    questionUr: faq.question.ur,
    answerEn: faq.answer.en,
    answerUr: faq.answer.ur,
  }));
}

function demoGuests(): AdminGuest[] {
  return demoInvitations().map((invitation) => ({
    id: invitation.guest.slug,
    slug: invitation.guest.slug,
    displayNameEn: invitation.guest.displayName?.en ?? "",
    displayNameUr: invitation.guest.displayName?.ur ?? "",
    type: invitation.guest.type,
    phone: null,
    lang: invitation.guest.lang,
    openedAt: invitation.guest.slug === DEMO_DEFAULT_GUEST ? "2026-10-01T10:00:00.000Z" : null,
    openCount: invitation.guest.slug === DEMO_DEFAULT_GUEST ? 2 : 0,
    invites: invitation.events.map((event) => ({
      eventId: event.id,
      seatsAllowed: event.seatsAllowed,
    })),
    rsvps: invitation.events
      .filter((event) => event.rsvp !== null)
      .map((event) => ({
        eventId: event.id,
        status: event.rsvp!.status,
        seatsConfirmed: event.rsvp!.seatsConfirmed,
      })),
  }));
}

/* -------------------------------------------------------------------- db --- */

async function dbWedding(weddingId: string): Promise<AdminWedding | null> {
  const wedding = await prisma.wedding.findUnique({ where: { id: weddingId } });
  if (!wedding) return null;
  return {
    id: wedding.id,
    slug: wedding.slug,
    coupleNameEn: wedding.coupleNameEn,
    coupleNameUr: wedding.coupleNameUr,
    timezone: wedding.timezone,
    defaultLang: wedding.defaultLang,
    bismillahEnabled: wedding.bismillahEnabled,
    personalMessageEn: wedding.personalMessageEn,
    personalMessageUr: wedding.personalMessageUr,
    theme: normalizeTheme(wedding.theme),
    musicUrl: wedding.musicUrl,
    openingImage: wedding.openingImage,
    adminEmail: wedding.adminEmail,
  };
}

function isoDate(value: Date | string): string {
  return new Date(value).toISOString().slice(0, 10);
}

/* --------------------------------------------------------------- public --- */

export async function getAdminWedding(weddingId: string): Promise<AdminWedding | null> {
  if (isDemoWedding(weddingId)) return demoWedding();
  return dbWedding(weddingId);
}

export async function listEvents(weddingId: string): Promise<AdminEvent[]> {
  if (isDemoWedding(weddingId)) return demoEvents();
  const rows = await prisma.event.findMany({ where: { weddingId }, orderBy: { order: "asc" } });
  return rows.map((row) => ({ ...row, date: isoDate(row.date) }));
}

export async function listFamilies(weddingId: string): Promise<AdminFamily[]> {
  if (isDemoWedding(weddingId)) return demoFamilies();
  const rows = await prisma.family.findMany({ where: { weddingId }, orderBy: { order: "asc" } });
  return rows.map((row) => ({
    id: row.id,
    side: row.side,
    headNameEn: row.headNameEn,
    headNameUr: row.headNameUr,
    memberNames: Array.isArray(row.memberNames)
      ? (row.memberNames as Array<{ en: string; ur: string }>)
      : [],
    figureImage: row.figureImage,
    order: row.order,
  }));
}

export async function listFaqs(weddingId: string): Promise<AdminFaq[]> {
  if (isDemoWedding(weddingId)) return demoFaqs();
  return prisma.faq.findMany({
    where: { weddingId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      order: true,
      questionEn: true,
      questionUr: true,
      answerEn: true,
      answerUr: true,
    },
  });
}

export async function listGuests(weddingId: string): Promise<AdminGuest[]> {
  if (isDemoWedding(weddingId)) return demoGuests();
  const rows = await prisma.guest.findMany({
    where: { weddingId },
    orderBy: { displayNameEn: "asc" },
    include: { guestEvents: true, rsvps: true },
  });
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    displayNameEn: row.displayNameEn ?? "",
    displayNameUr: row.displayNameUr ?? "",
    type: row.type,
    phone: row.phone,
    lang: row.lang,
    openedAt: row.openedAt ? row.openedAt.toISOString() : null,
    openCount: row.openCount,
    invites: row.guestEvents.map((invite) => ({
      eventId: invite.eventId,
      seatsAllowed: invite.seatsAllowed,
    })),
    rsvps: row.rsvps.map((rsvp) => ({
      eventId: rsvp.eventId,
      status: rsvp.status,
      seatsConfirmed: rsvp.seatsConfirmed,
    })),
  }));
}

export function computeRsvpStats(
  events: AdminEvent[],
  guests: AdminGuest[],
): EventRsvpStats[] {
  return events.map((event) => {
    let invited = 0;
    let yes = 0;
    let no = 0;
    let maybe = 0;
    let confirmedSeats = 0;

    for (const guest of guests) {
      if (!guest.invites.some((invite) => invite.eventId === event.id)) continue;
      invited += 1;
      const rsvp = guest.rsvps.find((entry) => entry.eventId === event.id);
      if (!rsvp) continue;
      if (rsvp.status === "yes") {
        yes += 1;
        confirmedSeats += rsvp.seatsConfirmed;
      } else if (rsvp.status === "no") {
        no += 1;
      } else {
        maybe += 1;
      }
    }

    return {
      eventId: event.id,
      titleEn: event.titleEn,
      titleUr: event.titleUr,
      date: event.date,
      invited,
      yes,
      no,
      maybe,
      pending: invited - yes - no - maybe,
      confirmedSeats,
    };
  });
}

export async function getRsvpStats(weddingId: string): Promise<EventRsvpStats[]> {
  const [events, guests] = await Promise.all([listEvents(weddingId), listGuests(weddingId)]);
  return computeRsvpStats(events, guests);
}

export async function getAdminOverview(weddingId: string): Promise<AdminOverview | null> {
  const wedding = await getAdminWedding(weddingId);
  if (!wedding) return null;

  const [events, families, faqs, guests] = await Promise.all([
    listEvents(weddingId),
    listFamilies(weddingId),
    listFaqs(weddingId),
    listGuests(weddingId),
  ]);

  return {
    wedding,
    events,
    eventCount: events.length,
    familyCount: families.length,
    faqCount: faqs.length,
    guestCount: guests.length,
    openedCount: guests.filter((guest) => guest.openedAt !== null).length,
    rsvpStats: computeRsvpStats(events, guests),
  };
}
