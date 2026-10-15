import Link from "next/link";
import { requireSuperAdmin } from "@/lib/require-admin";
import { getSuperSummary, listSuperWeddings } from "@/lib/data/super";

export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-blush bg-white/60 p-4">
      <p className="text-xs uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-1 font-display text-3xl text-deep-rose">{value}</p>
    </div>
  );
}

export default async function SuperOverviewPage() {
  await requireSuperAdmin();
  const [weddings, summary] = await Promise.all([listSuperWeddings(), getSuperSummary()]);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-deep-rose">Weddings</h1>
          <Link
            href="/super/new"
            className="rounded-full bg-deep-rose px-4 py-2 text-sm text-cream transition-colors hover:bg-ink"
          >
            New wedding
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Weddings" value={summary.weddingCount} />
          <Stat label="Guests" value={summary.guestCount} />
          <Stat label="Status" value="Live" />
        </div>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-blush">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-blush/40 text-ink/70">
            <tr>
              <th className="px-4 py-2 font-medium">Couple</th>
              <th className="px-4 py-2 font-medium">Slug</th>
              <th className="px-4 py-2 font-medium">Admin email</th>
              <th className="px-4 py-2 font-medium">Guests</th>
              <th className="px-4 py-2 font-medium">Events</th>
              <th className="px-4 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {weddings.map((wedding) => (
              <tr key={wedding.id} className="border-t border-blush/60">
                <td className="px-4 py-2">
                  <span className="text-deep-rose">{wedding.coupleNameEn}</span>
                  <span className="block font-arabic text-ink/50" dir="rtl">
                    {wedding.coupleNameUr}
                  </span>
                </td>
                <td className="px-4 py-2 font-mono text-xs text-ink/60">{wedding.slug}</td>
                <td className="px-4 py-2 text-ink/60">{wedding.adminEmail}</td>
                <td className="px-4 py-2">{wedding.guestCount}</td>
                <td className="px-4 py-2">{wedding.eventCount}</td>
                <td className="px-4 py-2 text-right">
                  <Link
                    href={`/super/${wedding.id}`}
                    className="text-xs text-deep-rose underline underline-offset-2"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
            {weddings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink/50">
                  No weddings yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
