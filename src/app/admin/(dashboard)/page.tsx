import Link from "next/link";
import { requireWeddingAdmin } from "@/lib/require-admin";
import { getAdminOverview } from "@/lib/data/admin";

export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-blush bg-white/60 p-4">
      <p className="text-xs uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-1 font-display text-3xl text-deep-rose">{value}</p>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const { weddingId } = await requireWeddingAdmin();
  const overview = await getAdminOverview(weddingId);

  if (!overview) {
    return <p className="text-ink/70">Wedding not found.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="font-display text-2xl text-deep-rose">Overview</h1>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Guests" value={overview.guestCount} />
          <Stat label="Opened" value={`${overview.openedCount}/${overview.guestCount}`} />
          <Stat label="Events" value={overview.eventCount} />
          <Stat label="FAQs" value={overview.faqCount} />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-deep-rose">RSVP by event</h2>
          <a
            href="/api/admin/export"
            className="rounded-full border border-rose px-3 py-1.5 text-xs text-deep-rose transition-colors hover:bg-deep-rose hover:text-cream"
          >
            Export CSV
          </a>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-blush">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-blush/40 text-ink/70">
              <tr>
                <th className="px-4 py-2 font-medium">Event</th>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Invited</th>
                <th className="px-4 py-2 font-medium">Yes</th>
                <th className="px-4 py-2 font-medium">No</th>
                <th className="px-4 py-2 font-medium">Maybe</th>
                <th className="px-4 py-2 font-medium">Pending</th>
                <th className="px-4 py-2 font-medium">Seats</th>
              </tr>
            </thead>
            <tbody>
              {overview.rsvpStats.map((row) => (
                <tr key={row.eventId} className="border-t border-blush/60">
                  <td className="px-4 py-2 text-deep-rose">{row.titleEn}</td>
                  <td className="px-4 py-2 text-ink/60">{row.date}</td>
                  <td className="px-4 py-2">{row.invited}</td>
                  <td className="px-4 py-2">{row.yes}</td>
                  <td className="px-4 py-2">{row.no}</td>
                  <td className="px-4 py-2">{row.maybe}</td>
                  <td className="px-4 py-2">{row.pending}</td>
                  <td className="px-4 py-2">{row.confirmedSeats}</td>
                </tr>
              ))}
              {overview.rsvpStats.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-ink/50">
                    No events yet.{" "}
                    <Link href="/admin/events" className="underline">
                      Add one
                    </Link>
                    .
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
