import { prisma } from "@/lib/prisma";
import { demoMode } from "@/lib/data/invitation";
import {
  DEMO_DEFAULT_GUEST,
  DEMO_GUEST_SLUGS,
  DEMO_WEDDING_ID,
  DEMO_WEDDING_SLUG,
  getDemoInvitationFor,
} from "@/lib/fixtures/demo-invitation";

/**
 * Cross-tenant reads for the platform (super) admin: every wedding with a few
 * summary counts. Demo mode exposes the single bundled fixture wedding so the
 * surface is explorable without a database.
 */

export interface SuperWedding {
  id: string;
  slug: string;
  coupleNameEn: string;
  coupleNameUr: string;
  adminEmail: string;
  timezone: string;
  defaultLang: string;
  createdAt: string | null;
  guestCount: number;
  eventCount: number;
  adminCount: number;
}

export interface SuperSummary {
  weddingCount: number;
  guestCount: number;
}

function demoSuperWeddings(): SuperWedding[] {
  const invitation =
    getDemoInvitationFor(DEMO_WEDDING_SLUG, DEMO_DEFAULT_GUEST) ??
    getDemoInvitationFor(DEMO_WEDDING_SLUG, DEMO_GUEST_SLUGS[0] ?? DEMO_DEFAULT_GUEST);
  if (!invitation) return [];

  return [
    {
      id: DEMO_WEDDING_ID,
      slug: invitation.wedding.slug,
      coupleNameEn: invitation.wedding.coupleName.en,
      coupleNameUr: invitation.wedding.coupleName.ur,
      adminEmail: "bilal.sara@example.com",
      timezone: invitation.wedding.timezone,
      defaultLang: invitation.wedding.defaultLang,
      createdAt: null,
      guestCount: DEMO_GUEST_SLUGS.length,
      eventCount: invitation.events.length,
      adminCount: 1,
    },
  ];
}

export async function listSuperWeddings(): Promise<SuperWedding[]> {
  if (demoMode()) return demoSuperWeddings();

  const rows = await prisma.wedding.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { guests: true, events: true, admins: true } } },
  });

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    coupleNameEn: row.coupleNameEn,
    coupleNameUr: row.coupleNameUr,
    adminEmail: row.adminEmail,
    timezone: row.timezone,
    defaultLang: row.defaultLang,
    createdAt: row.createdAt.toISOString(),
    guestCount: row._count.guests,
    eventCount: row._count.events,
    adminCount: row._count.admins,
  }));
}

export async function getSuperWedding(id: string): Promise<SuperWedding | null> {
  if (demoMode()) {
    return demoSuperWeddings().find((wedding) => wedding.id === id) ?? null;
  }

  const row = await prisma.wedding.findUnique({
    where: { id },
    include: { _count: { select: { guests: true, events: true, admins: true } } },
  });
  if (!row) return null;

  return {
    id: row.id,
    slug: row.slug,
    coupleNameEn: row.coupleNameEn,
    coupleNameUr: row.coupleNameUr,
    adminEmail: row.adminEmail,
    timezone: row.timezone,
    defaultLang: row.defaultLang,
    createdAt: row.createdAt.toISOString(),
    guestCount: row._count.guests,
    eventCount: row._count.events,
    adminCount: row._count.admins,
  };
}

export async function getSuperSummary(): Promise<SuperSummary> {
  const weddings = await listSuperWeddings();
  return {
    weddingCount: weddings.length,
    guestCount: weddings.reduce((total, wedding) => total + wedding.guestCount, 0),
  };
}
