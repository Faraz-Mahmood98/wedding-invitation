import { requireWeddingAdmin } from "@/lib/require-admin";
import { listEvents, type AdminEvent } from "@/lib/data/admin";
import { UploadField } from "@/components/admin/UploadField";
import { deleteEventAction, saveEventAction } from "../../actions";

export const dynamic = "force-dynamic";

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  dir,
  wide,
}: {
  label: string;
  name: string;
  defaultValue: string | number;
  type?: string;
  dir?: "rtl";
  wide?: boolean;
}) {
  return (
    <label
      className={`flex flex-col gap-1 text-xs text-ink/60 ${wide ? "sm:col-span-2" : ""}`}
    >
      <span>{label}</span>
      <input
        name={name}
        type={type}
        dir={dir}
        defaultValue={defaultValue}
        className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
      />
    </label>
  );
}

function EventFields({ event }: { event: AdminEvent | null }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {event ? <input type="hidden" name="id" value={event.id} /> : null}
      <Field label="Order" name="order" type="number" defaultValue={event?.order ?? 1} />
      <Field label="Date (YYYY-MM-DD)" name="date" defaultValue={event?.date ?? ""} />
      <Field label="Title (English)" name="titleEn" defaultValue={event?.titleEn ?? ""} />
      <Field label="Title (Urdu)" name="titleUr" dir="rtl" defaultValue={event?.titleUr ?? ""} />
      <Field
        label="Start time (HH:mm)"
        name="startTime"
        defaultValue={event?.startTime ?? "19:00"}
      />
      <Field label="Venue name" name="venueName" defaultValue={event?.venueName ?? ""} />
      <Field label="Address" name="address" wide defaultValue={event?.address ?? ""} />
      <Field label="Maps URL" name="mapsUrl" wide defaultValue={event?.mapsUrl ?? ""} />
      <Field
        label="Hosted by (English)"
        name="hostedByEn"
        defaultValue={event?.hostedByEn ?? ""}
      />
      <Field
        label="Hosted by (Urdu)"
        name="hostedByUr"
        dir="rtl"
        defaultValue={event?.hostedByUr ?? ""}
      />
      <div className="sm:col-span-2">
        <UploadField
          name="posterImage"
          label="Poster image"
          defaultValue={event?.posterImage ?? ""}
          kind="image"
          placeholder="Paste a URL or upload a file"
          hint="JPEG, PNG, WebP, AVIF or GIF up to 8 MB."
        />
      </div>
      <Field label="Dress note" name="dressNote" defaultValue={event?.dressNote ?? ""} />
    </div>
  );
}

export default async function EventsPage() {
  const { weddingId } = await requireWeddingAdmin();
  const events = await listEvents(weddingId);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl text-deep-rose">Events</h1>

      <section className="rounded-2xl border border-blush bg-white/60 p-5">
        <h2 className="font-display text-lg text-deep-rose">Add event</h2>
        <form action={saveEventAction} className="mt-4">
          <EventFields event={null} />
          <button
            type="submit"
            className="mt-4 rounded-full bg-deep-rose px-5 py-2 text-sm text-cream transition-colors hover:bg-ink"
          >
            Add event
          </button>
        </form>
      </section>

      {events.map((event) => (
        <section key={event.id} className="rounded-2xl border border-blush bg-white/60 p-5">
          <form action={saveEventAction}>
            <EventFields event={event} />
            <button
              type="submit"
              className="mt-4 rounded-full bg-deep-rose px-4 py-2 text-sm text-cream transition-colors hover:bg-ink"
            >
              Save
            </button>
          </form>
          <form action={deleteEventAction} className="mt-2">
            <input type="hidden" name="id" value={event.id} />
            <button
              type="submit"
              className="rounded-full border border-rose px-3 py-1.5 text-xs text-deep-rose transition-colors hover:bg-deep-rose hover:text-cream"
            >
              Delete event
            </button>
          </form>
        </section>
      ))}
      {events.length === 0 ? <p className="text-sm text-ink/50">No events yet.</p> : null}
    </div>
  );
}
