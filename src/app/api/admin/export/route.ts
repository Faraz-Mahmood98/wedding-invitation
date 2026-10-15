import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listEvents, listGuests } from "@/lib/data/admin";

export const runtime = "nodejs";

function csvCell(value: string | number | null): string {
  const text = value === null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET() {
  const session = await getSession();
  if (!session?.weddingId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [events, guests] = await Promise.all([
    listEvents(session.weddingId),
    listGuests(session.weddingId),
  ]);

  const header = [
    "guest",
    "slug",
    "type",
    "phone",
    "lang",
    "openedAt",
    "openCount",
    ...events.flatMap((event) => [`${event.titleEn} status`, `${event.titleEn} seats`]),
  ];

  const rows = guests.map((guest) => {
    const cells: Array<string | number | null> = [
      guest.displayNameEn,
      guest.slug,
      guest.type,
      guest.phone,
      guest.lang,
      guest.openedAt,
      guest.openCount,
    ];
    for (const event of events) {
      const rsvp = guest.rsvps.find((entry) => entry.eventId === event.id);
      cells.push(rsvp?.status ?? "pending", rsvp?.seatsConfirmed ?? "");
    }
    return cells.map(csvCell).join(",");
  });

  const csv = [header.map(csvCell).join(","), ...rows].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rsvps-${session.weddingId}.csv"`,
    },
  });
}
