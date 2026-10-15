import { env } from "@/lib/env";
import { requireWeddingAdmin } from "@/lib/require-admin";
import { getAdminWedding, listEvents, listGuests, type AdminGuest } from "@/lib/data/admin";
import { deleteGuestAction, importGuestsAction, saveGuestAction } from "../../actions";
import { GuestLinkActions } from "./GuestLinkActions";

export const dynamic = "force-dynamic";

interface EventOption {
  id: string;
  titleEn: string;
}

function seatValue(guest: AdminGuest | null, eventId: string): string {
  if (!guest) return "";
  const invite = guest.invites.find((entry) => entry.eventId === eventId);
  if (!invite) return "";
  return invite.seatsAllowed === null ? "full" : String(invite.seatsAllowed);
}

function SeatSelect({
  events,
  guest,
}: {
  events: EventOption[];
  guest: AdminGuest | null;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {events.map((event) => (
        <label key={event.id} className="flex flex-col gap-1 text-xs text-ink/60">
          <span>{event.titleEn}</span>
          <select
            name={`seat__${event.id}`}
            defaultValue={seatValue(guest, event.id)}
            className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
          >
            <option value="">Not invited</option>
            <option value="full">Full family</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} seat{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}

function GuestFields({
  events,
  guest,
}: {
  events: EventOption[];
  guest: AdminGuest | null;
}) {
  return (
    <div className="flex flex-col gap-3">
      {guest ? <input type="hidden" name="id" value={guest.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-ink/60">
          <span>Name (English)</span>
          <input
            name="displayNameEn"
            required
            defaultValue={guest?.displayNameEn ?? ""}
            className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink/60">
          <span>Name (Urdu)</span>
          <input
            name="displayNameUr"
            dir="rtl"
            defaultValue={guest?.displayNameUr ?? ""}
            className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink/60">
          <span>Type</span>
          <select
            name="type"
            defaultValue={guest?.type ?? "single"}
            className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
          >
            <option value="single">Single</option>
            <option value="couple">Couple</option>
            <option value="family">Family</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink/60">
          <span>Language</span>
          <select
            name="lang"
            defaultValue={guest?.lang ?? "en"}
            className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
          >
            <option value="en">English</option>
            <option value="ur">Urdu</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink/60">
          <span>Phone (for WhatsApp)</span>
          <input
            name="phone"
            defaultValue={guest?.phone ?? ""}
            className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink/60">
          <span>Slug</span>
          <input
            name="slug"
            defaultValue={guest?.slug ?? ""}
            className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
          />
        </label>
      </div>
      <SeatSelect events={events} guest={guest} />
    </div>
  );
}

export default async function GuestsPage() {
  const { weddingId } = await requireWeddingAdmin();
  const [wedding, events, guests] = await Promise.all([
    getAdminWedding(weddingId),
    listEvents(weddingId),
    listGuests(weddingId),
  ]);

  const baseUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const weddingSlug = wedding?.slug ?? "";
  const eventOptions: EventOption[] = events.map((event) => ({
    id: event.id,
    titleEn: event.titleEn,
  }));

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="font-display text-2xl text-deep-rose">Guests</h1>
        <p className="mt-1 text-sm text-ink/60">
          {guests.length} guest{guests.length === 1 ? "" : "s"}. Each link opens a
          personalised invitation.
        </p>
      </section>

      <section className="rounded-2xl border border-blush bg-white/60 p-5">
        <h2 className="font-display text-lg text-deep-rose">Add guest</h2>
        <form action={saveGuestAction} className="mt-4">
          <GuestFields events={eventOptions} guest={null} />
          <button
            type="submit"
            className="mt-4 rounded-full bg-deep-rose px-5 py-2 text-sm text-cream transition-colors hover:bg-ink"
          >
            Add guest
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-blush bg-white/60 p-5">
        <h2 className="font-display text-lg text-deep-rose">Import CSV</h2>
        <p className="mt-1 text-xs text-ink/60">
          Header: <code>name_en,name_ur,type,phone,lang,slug,events</code>. In{" "}
          <code>events</code> use <code>order:seats</code> pairs separated by{" "}
          <code>;</code> (e.g. <code>1:2;3:full</code>).
        </p>
        <form action={importGuestsAction} className="mt-3 flex flex-col gap-3">
          <textarea
            name="csv"
            rows={4}
            placeholder="name_en,type,events&#10;Ali Khan,couple,1:2;2:2"
            className="rounded-lg border border-blush bg-cream px-3 py-2 font-mono text-xs text-ink"
          />
          <button
            type="submit"
            className="self-start rounded-full border border-rose px-4 py-2 text-sm text-deep-rose transition-colors hover:bg-deep-rose hover:text-cream"
          >
            Import
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-4">
        {guests.map((guest) => {
          const url = `${baseUrl}/w/${weddingSlug}/${guest.slug}`;
          return (
            <article
              key={guest.id}
              className="rounded-2xl border border-blush bg-white/60 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg text-deep-rose">
                    {guest.displayNameEn}
                  </p>
                  <p className="text-xs text-ink/50">
                    /{guest.slug} · {guest.type} · {guest.lang.toUpperCase()}
                    {guest.openedAt ? " · opened" : ""}
                  </p>
                </div>
                <GuestLinkActions url={url} phone={guest.phone} name={guest.displayNameEn} />
              </div>

              <form action={saveGuestAction} className="mt-4">
                <GuestFields events={eventOptions} guest={guest} />
                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="submit"
                    className="rounded-full bg-deep-rose px-4 py-2 text-sm text-cream transition-colors hover:bg-ink"
                  >
                    Save
                  </button>
                </div>
              </form>

              <form action={deleteGuestAction} className="mt-2">
                <input type="hidden" name="id" value={guest.id} />
                <button
                  type="submit"
                  className="rounded-full border border-rose px-3 py-1.5 text-xs text-deep-rose transition-colors hover:bg-deep-rose hover:text-cream"
                >
                  Delete guest
                </button>
              </form>
            </article>
          );
        })}
        {guests.length === 0 ? (
          <p className="text-sm text-ink/50">No guests yet.</p>
        ) : null}
      </section>
    </div>
  );
}
