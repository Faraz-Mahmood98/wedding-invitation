import { prisma } from "@/lib/prisma";
import type { Invitation } from "@/lib/invitation";
import { getDemoInvitationFor } from "@/lib/fixtures/demo-invitation";
import { toInvitation } from "./map";

/** Set INVITATION_DEMO=true to serve the fixture without a database. */
export function demoMode(): boolean {
  return process.env.INVITATION_DEMO === "true";
}

const CONNECTION_ERROR_CODES = new Set([
  "P1000",
  "P1001",
  "P1002",
  "P1003",
  "P1017",
]);

function isConnectionError(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code;
  if (code && CONNECTION_ERROR_CODES.has(code)) return true;
  const message = error instanceof Error ? error.message : String(error);
  return /can't reach database|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|connection/i.test(
    message,
  );
}

/** Loads a guest's invitation, scoped to their wedding. */
export async function getInvitation(
  weddingSlug: string,
  guestSlug: string,
): Promise<Invitation | null> {
  const wedding = await prisma.wedding.findUnique({
    where: { slug: weddingSlug },
    include: { events: true, families: true, faqs: true },
  });
  if (!wedding) return null;

  const guest = await prisma.guest.findUnique({
    where: { weddingId_slug: { weddingId: wedding.id, slug: guestSlug } },
    include: { guestEvents: true, rsvps: true },
  });
  if (!guest) return null;

  return toInvitation({
    wedding,
    guest,
    events: wedding.events,
    families: wedding.families,
    faqs: wedding.faqs,
    guestEvents: guest.guestEvents,
    rsvps: guest.rsvps,
  });
}

/**
 * Production loader with an offline/demo fallback so the app stays usable
 * before a database is provisioned. Cross-tenant lookups never fall back.
 */
export async function loadInvitation(
  weddingSlug: string,
  guestSlug: string,
): Promise<Invitation | null> {
  if (demoMode()) return getDemoInvitationFor(weddingSlug, guestSlug);

  try {
    return await getInvitation(weddingSlug, guestSlug);
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn("[invitation] database unavailable; serving demo fixture");
      return getDemoInvitationFor(weddingSlug, guestSlug);
    }
    throw error;
  }
}

/** Records a guest opening their invitation (for the RSVP dashboard). */
export async function recordGuestOpen(
  weddingSlug: string,
  guestSlug: string,
): Promise<void> {
  if (demoMode()) return;

  const guest = await prisma.guest.findFirst({
    where: { slug: guestSlug, wedding: { slug: weddingSlug } },
    select: { id: true, openedAt: true },
  });
  if (!guest) return;

  await prisma.guest.update({
    where: { id: guest.id },
    data: {
      openCount: { increment: 1 },
      ...(guest.openedAt ? {} : { openedAt: new Date() }),
    },
  });
}
