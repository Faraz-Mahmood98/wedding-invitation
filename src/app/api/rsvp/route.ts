import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoMode } from "@/lib/data/invitation";
import { clampSeats } from "@/lib/rsvp";
import { rateLimit } from "@/lib/rate-limit";
import { rsvpSchema } from "@/lib/validation";
import { env } from "@/lib/env";

export const runtime = "nodejs";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  const limit = rateLimit(
    `rsvp:${clientIp(request)}`,
    env.RSVP_RATE_LIMIT_PER_MINUTE,
    60_000,
  );
  if (!limit.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((limit.reset - Date.now()) / 1000)) },
      },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { weddingSlug, guestSlug, eventId, status, seatsConfirmed, dietaryNotes, message } =
    parsed.data;

  // Demo mode: validate + echo so the RSVP flow is testable without a database.
  if (demoMode()) {
    const seats = status === "no" ? 0 : clampSeats(seatsConfirmed, null);
    return NextResponse.json({
      ok: true,
      demo: true,
      rsvp: { eventId, status, seatsConfirmed: seats, dietaryNotes, message },
    });
  }

  const guest = await prisma.guest.findFirst({
    where: { slug: guestSlug, wedding: { slug: weddingSlug } },
    select: { id: true },
  });
  if (!guest) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const guestEvent = await prisma.guestEvent.findUnique({
    where: { guestId_eventId: { guestId: guest.id, eventId } },
    select: { seatsAllowed: true },
  });
  if (!guestEvent) {
    return NextResponse.json({ error: "not_invited" }, { status: 403 });
  }

  const seats = status === "no" ? 0 : clampSeats(seatsConfirmed, guestEvent.seatsAllowed);

  const rsvp = await prisma.rsvp.upsert({
    where: { guestId_eventId: { guestId: guest.id, eventId } },
    create: {
      guestId: guest.id,
      eventId,
      status,
      seatsConfirmed: seats,
      dietaryNotes: dietaryNotes ?? null,
      message: message ?? null,
    },
    update: {
      status,
      seatsConfirmed: seats,
      dietaryNotes: dietaryNotes ?? null,
      message: message ?? null,
    },
  });

  return NextResponse.json({ ok: true, rsvp });
}
