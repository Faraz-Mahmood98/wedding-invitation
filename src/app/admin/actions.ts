"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { demoMode } from "@/lib/data/invitation";
import { requireWeddingAdmin } from "@/lib/require-admin";
import {
  eventSchema,
  familySchema,
  faqSchema,
  guestSchema,
  parseGuestCsv,
  slugify,
  weddingSettingsSchema,
  zipMembers,
} from "@/lib/validation";

function formToObject(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") result[key] = value;
  }
  return result;
}

function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

/* --------------------------------------------------------------- wedding --- */

export async function updateWeddingAction(formData: FormData): Promise<void> {
  const { weddingId } = await requireWeddingAdmin();
  const parsed = weddingSettingsSchema.safeParse(formToObject(formData));
  if (!parsed.success) return;
  if (demoMode()) return;

  const data = parsed.data;
  await prisma.wedding.update({
    where: { id: weddingId },
    data: {
      coupleNameEn: data.coupleNameEn,
      coupleNameUr: data.coupleNameUr,
      defaultLang: data.defaultLang,
      timezone: data.timezone,
      bismillahEnabled: data.bismillahEnabled,
      personalMessageEn: data.personalMessageEn ?? null,
      personalMessageUr: data.personalMessageUr ?? null,
      openingImage: data.openingImage || null,
      musicUrl: data.musicUrl || null,
      theme: {
        palette: {
          blush: data.blush,
          cream: data.cream,
          rose: data.rose,
          deepRose: data.deepRose,
          gold: data.gold,
          ink: data.ink,
        },
      },
    },
  });
  revalidatePath("/admin/settings");
}

/* ---------------------------------------------------------------- events --- */

export async function saveEventAction(formData: FormData): Promise<void> {
  const { weddingId } = await requireWeddingAdmin();
  const parsed = eventSchema.safeParse(formToObject(formData));
  if (!parsed.success) return;
  if (demoMode()) return;

  const data = parsed.data;
  const payload = {
    order: data.order,
    titleEn: data.titleEn,
    titleUr: data.titleUr,
    date: parseDate(data.date),
    startTime: data.startTime,
    venueName: data.venueName,
    address: data.address,
    mapsUrl: data.mapsUrl ?? null,
    hostedByEn: data.hostedByEn ?? null,
    hostedByUr: data.hostedByUr ?? null,
    posterImage: data.posterImage ?? null,
    dressNote: data.dressNote ?? null,
  };

  const id = String(formData.get("id") ?? "");
  if (id) {
    await prisma.event.update({ where: { id }, data: payload });
  } else {
    await prisma.event.create({ data: { weddingId, ...payload } });
  }
  revalidatePath("/admin/events");
}

export async function deleteEventAction(formData: FormData): Promise<void> {
  await requireWeddingAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id || demoMode()) return;
  await prisma.event.delete({ where: { id } });
  revalidatePath("/admin/events");
}

/* -------------------------------------------------------------- families --- */

export async function saveFamilyAction(formData: FormData): Promise<void> {
  const { weddingId } = await requireWeddingAdmin();
  const parsed = familySchema.safeParse(formToObject(formData));
  if (!parsed.success) return;
  if (demoMode()) return;

  const data = parsed.data;
  const payload = {
    side: data.side,
    headNameEn: data.headNameEn,
    headNameUr: data.headNameUr,
    memberNames: zipMembers(data.membersEn, data.membersUr) as Prisma.InputJsonValue,
    figureImage: data.figureImage ?? null,
    order: data.order,
  };

  const id = String(formData.get("id") ?? "");
  if (id) {
    await prisma.family.update({ where: { id }, data: payload });
  } else {
    await prisma.family.create({ data: { weddingId, ...payload } });
  }
  revalidatePath("/admin/families");
}

export async function deleteFamilyAction(formData: FormData): Promise<void> {
  await requireWeddingAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id || demoMode()) return;
  await prisma.family.delete({ where: { id } });
  revalidatePath("/admin/families");
}

/* ------------------------------------------------------------------ faqs --- */

export async function saveFaqAction(formData: FormData): Promise<void> {
  const { weddingId } = await requireWeddingAdmin();
  const parsed = faqSchema.safeParse(formToObject(formData));
  if (!parsed.success) return;
  if (demoMode()) return;

  const data = parsed.data;
  const id = String(formData.get("id") ?? "");
  if (id) {
    await prisma.faq.update({ where: { id }, data });
  } else {
    await prisma.faq.create({ data: { weddingId, ...data } });
  }
  revalidatePath("/admin/faqs");
}

export async function deleteFaqAction(formData: FormData): Promise<void> {
  await requireWeddingAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id || demoMode()) return;
  await prisma.faq.delete({ where: { id } });
  revalidatePath("/admin/faqs");
}

/* ---------------------------------------------------------------- guests --- */

function parseInvites(formData: FormData): Array<{ eventId: string; seatsAllowed: number | null }> {
  const invites: Array<{ eventId: string; seatsAllowed: number | null }> = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("seat__") || typeof value !== "string") continue;
    const eventId = key.slice("seat__".length);
    const trimmed = value.trim();
    if (trimmed === "") continue;
    invites.push({
      eventId,
      seatsAllowed: trimmed === "full" ? null : Number(trimmed),
    });
  }
  return invites;
}

async function uniqueSlug(weddingId: string, desired: string, excludeId?: string): Promise<string> {
  const base = slugify(desired);
  let candidate = base;
  let attempt = 2;
  for (;;) {
    const clash = await prisma.guest.findFirst({
      where: {
        weddingId,
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (!clash) return candidate;
    candidate = `${base}-${attempt}`;
    attempt += 1;
  }
}

export async function saveGuestAction(formData: FormData): Promise<void> {
  const { weddingId } = await requireWeddingAdmin();
  const parsed = guestSchema.safeParse(formToObject(formData));
  if (!parsed.success) return;
  if (demoMode()) return;

  const data = parsed.data;
  const invites = parseInvites(formData);
  const id = String(formData.get("id") ?? "");

  if (id) {
    await prisma.$transaction([
      prisma.guestEvent.deleteMany({ where: { guestId: id } }),
      prisma.guest.update({
        where: { id },
        data: {
          displayNameEn: data.displayNameEn,
          displayNameUr: data.displayNameUr ?? null,
          type: data.type,
          phone: data.phone ?? null,
          lang: data.lang,
          slug: data.slug ? await uniqueSlug(weddingId, data.slug, id) : undefined,
          guestEvents: { create: invites },
        },
      }),
    ]);
  } else {
    const slug = await uniqueSlug(weddingId, data.slug ?? data.displayNameEn);
    await prisma.guest.create({
      data: {
        weddingId,
        slug,
        displayNameEn: data.displayNameEn,
        displayNameUr: data.displayNameUr ?? null,
        type: data.type,
        phone: data.phone ?? null,
        lang: data.lang,
        guestEvents: { create: invites },
      },
    });
  }
  revalidatePath("/admin/guests");
}

export async function deleteGuestAction(formData: FormData): Promise<void> {
  await requireWeddingAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id || demoMode()) return;
  await prisma.guest.delete({ where: { id } });
  revalidatePath("/admin/guests");
}

export async function importGuestsAction(formData: FormData): Promise<void> {
  const { weddingId } = await requireWeddingAdmin();
  const csv = String(formData.get("csv") ?? "");
  if (!csv.trim() || demoMode()) return;

  const events = await prisma.event.findMany({
    where: { weddingId },
    select: { id: true, order: true },
  });
  const eventByOrder = new Map(events.map((event) => [event.order, event.id]));
  const rows = parseGuestCsv(csv);

  for (const row of rows) {
    const slug = await uniqueSlug(weddingId, row.slug || row.displayNameEn);
    const invites = row.events
      .map((entry) => {
        const eventId = eventByOrder.get(entry.order);
        return eventId ? { eventId, seatsAllowed: entry.seats } : null;
      })
      .filter((value): value is { eventId: string; seatsAllowed: number | null } => value !== null);

    await prisma.guest.create({
      data: {
        weddingId,
        slug,
        displayNameEn: row.displayNameEn,
        displayNameUr: row.displayNameUr ?? null,
        type: row.type,
        phone: row.phone ?? null,
        lang: row.lang,
        guestEvents: { create: invites },
      },
    });
  }
  revalidatePath("/admin/guests");
}
