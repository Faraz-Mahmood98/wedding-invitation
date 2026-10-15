import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSuperAdmin } from "@/lib/require-admin";
import { getSuperWedding } from "@/lib/data/super";
import { demoMode } from "@/lib/data/invitation";
import {
  deleteWeddingAction,
  resetWeddingPasswordAction,
  updateSuperWeddingAction,
} from "../../actions";

export const dynamic = "force-dynamic";

export default async function SuperWeddingPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  await requireSuperAdmin();
  const { weddingId } = await params;
  const wedding = await getSuperWedding(weddingId);
  if (!wedding) notFound();

  const rootDomain = process.env.APP_ROOT_DOMAIN ?? "localhost:3000";
  const isLocal = rootDomain.includes("localhost");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/super" className="text-xs text-deep-rose underline underline-offset-2">
            ← All weddings
          </Link>
          <h1 className="mt-2 font-display text-2xl text-deep-rose">{wedding.coupleNameEn}</h1>
          <p className="font-arabic text-ink/50" dir="rtl">
            {wedding.coupleNameUr}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <Link
            href={`/w/${wedding.slug}`}
            className="rounded-full border border-rose px-3 py-1.5 text-deep-rose transition-colors hover:bg-deep-rose hover:text-cream"
          >
            View invitation
          </Link>
          <Link
            href="/admin/login"
            className="rounded-full border border-rose px-3 py-1.5 text-deep-rose transition-colors hover:bg-deep-rose hover:text-cream"
          >
            Open admin login
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-blush bg-white/60 p-4">
          <p className="text-xs uppercase tracking-wide text-ink/50">Guests</p>
          <p className="mt-1 font-display text-2xl text-deep-rose">{wedding.guestCount}</p>
        </div>
        <div className="rounded-2xl border border-blush bg-white/60 p-4">
          <p className="text-xs uppercase tracking-wide text-ink/50">Events</p>
          <p className="mt-1 font-display text-2xl text-deep-rose">{wedding.eventCount}</p>
        </div>
        <div className="rounded-2xl border border-blush bg-white/60 p-4">
          <p className="text-xs uppercase tracking-wide text-ink/50">Admins</p>
          <p className="mt-1 font-display text-2xl text-deep-rose">{wedding.adminCount}</p>
        </div>
        <div className="rounded-2xl border border-blush bg-white/60 p-4">
          <p className="text-xs uppercase tracking-wide text-ink/50">Created</p>
          <p className="mt-1 text-sm text-ink/70">
            {wedding.createdAt ? wedding.createdAt.slice(0, 10) : "—"}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-blush bg-white/60 p-5">
        <h2 className="font-display text-lg text-deep-rose">Wedding details</h2>
        <form action={updateSuperWeddingAction} className="mt-4">
          <input type="hidden" name="id" value={wedding.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-ink/60">
              <span>Couple name (English)</span>
              <input
                name="coupleNameEn"
                required
                defaultValue={wedding.coupleNameEn}
                className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-ink/60">
              <span>Couple name (Urdu)</span>
              <input
                name="coupleNameUr"
                required
                dir="rtl"
                defaultValue={wedding.coupleNameUr}
                className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-ink/60">
              <span>Slug</span>
              <input
                name="slug"
                required
                defaultValue={wedding.slug}
                className="rounded-lg border border-blush bg-cream px-2 py-1.5 font-mono text-sm text-ink"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-ink/60">
              <span>Admin email</span>
              <input
                name="adminEmail"
                type="email"
                required
                defaultValue={wedding.adminEmail}
                className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-ink/60">
              <span>Timezone</span>
              <input
                name="timezone"
                required
                defaultValue={wedding.timezone}
                className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-ink/60">
              <span>Default language</span>
              <select
                name="defaultLang"
                defaultValue={wedding.defaultLang}
                className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
              >
                <option value="en">English</option>
                <option value="ur">Urdu</option>
              </select>
            </label>
          </div>
          {demoMode() ? (
            <p className="mt-4 rounded-xl bg-gold/20 px-3 py-2 text-xs text-ink/70">
              Demo mode is on — changes are not saved.
            </p>
          ) : null}
          <button
            type="submit"
            className="mt-5 rounded-full bg-deep-rose px-5 py-2 text-sm text-cream transition-colors hover:bg-ink"
          >
            Save details
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-blush bg-white/60 p-5">
        <h2 className="font-display text-lg text-deep-rose">Guest link</h2>
        <p className="mt-2 break-all font-mono text-xs text-ink/60">
          {isLocal
            ? `/w/${wedding.slug}/{"{guestSlug}"}`
            : `https://${wedding.slug}.${rootDomain}/{"{guestSlug}"}`}
        </p>
        <p className="mt-1 text-xs text-ink/50">
          {isLocal
            ? `Production form: {slug}.{APP_ROOT_DOMAIN}/{guestSlug}`
            : `Local path form: /w/${wedding.slug}/{"{guestSlug}"}`}
        </p>
      </section>

      <section className="rounded-2xl border border-blush bg-white/60 p-5">
        <h2 className="font-display text-lg text-deep-rose">Reset admin password</h2>
        <form action={resetWeddingPasswordAction} className="mt-4 flex flex-wrap items-end gap-3">
          <input type="hidden" name="id" value={wedding.id} />
          <label className="flex flex-1 flex-col gap-1 text-xs text-ink/60">
            <span>New password</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-deep-rose px-5 py-2 text-sm text-cream transition-colors hover:bg-ink"
          >
            Reset password
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-rose/60 bg-white/60 p-5">
        <h2 className="font-display text-lg text-deep-rose">Danger zone</h2>
        <p className="mt-1 text-xs text-ink/60">
          Deleting a wedding removes its guests, events, families, FAQs and RSVPs.
        </p>
        <form action={deleteWeddingAction} className="mt-4">
          <input type="hidden" name="id" value={wedding.id} />
          <button
            type="submit"
            className="rounded-full border border-rose px-4 py-2 text-sm text-deep-rose transition-colors hover:bg-deep-rose hover:text-cream"
          >
            Delete wedding
          </button>
        </form>
      </section>
    </div>
  );
}
