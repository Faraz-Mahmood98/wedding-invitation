import { requireWeddingAdmin } from "@/lib/require-admin";
import { getAdminWedding } from "@/lib/data/admin";
import { updateWeddingAction } from "../../actions";
import { UploadField } from "@/components/admin/UploadField";
import OpeningImagePicker from "./OpeningImagePicker";

export const dynamic = "force-dynamic";

const PALETTE_FIELDS: Array<{ key: string; label: string }> = [
  { key: "blush", label: "Blush" },
  { key: "cream", label: "Cream" },
  { key: "rose", label: "Rose" },
  { key: "deepRose", label: "Deep rose" },
  { key: "gold", label: "Gold" },
  { key: "ink", label: "Ink" },
];

export default async function SettingsPage() {
  const { weddingId } = await requireWeddingAdmin();
  const wedding = await getAdminWedding(weddingId);
  if (!wedding) return <p className="text-ink/70">Wedding not found.</p>;

  const palette = wedding.theme.palette as unknown as Record<string, string>;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl text-deep-rose">Settings</h1>

      <form
        action={updateWeddingAction}
        className="rounded-2xl border border-blush bg-white/60 p-5"
      >
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
          <label className="flex flex-col gap-1 text-xs text-ink/60">
            <span>Timezone</span>
            <input
              name="timezone"
              required
              defaultValue={wedding.timezone}
              className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink/60 sm:col-span-2">
            <span>Personal message (English)</span>
            <textarea
              name="personalMessageEn"
              rows={3}
              defaultValue={wedding.personalMessageEn ?? ""}
              className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink/60 sm:col-span-2">
            <span>Personal message (Urdu)</span>
            <textarea
              name="personalMessageUr"
              dir="rtl"
              rows={3}
              defaultValue={wedding.personalMessageUr ?? ""}
              className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input
              type="checkbox"
              name="bismillahEnabled"
              defaultChecked={wedding.bismillahEnabled}
              className="h-4 w-4"
            />
            <span>Show Bismillah</span>
          </label>
        </div>

        <h2 className="mt-6 font-display text-lg text-deep-rose">Opening screen</h2>
        <p className="mt-1 text-xs text-ink/50">
          Background shown on the tap-to-open page.
        </p>
        <div className="mt-3">
          <OpeningImagePicker defaultValue={wedding.openingImage ?? ""} />
        </div>

        <h2 className="mt-6 font-display text-lg text-deep-rose">Background music</h2>
        <p className="mt-1 text-xs text-ink/50">
          Optional track that plays after the guest opens the invitation. Leave empty for silence.
        </p>
        <div className="mt-3">
          <UploadField
            name="musicUrl"
            label="Music file"
            defaultValue={wedding.musicUrl ?? ""}
            kind="audio"
            placeholder="Paste a URL or upload a file"
            hint="MP3, M4A, OGG or WAV up to 15 MB."
          />
        </div>

        <h2 className="mt-6 font-display text-lg text-deep-rose">Theme colours</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PALETTE_FIELDS.map((field) => (
            <label key={field.key} className="flex flex-col gap-1 text-xs text-ink/60">
              <span>{field.label}</span>
              <input
                type="color"
                name={field.key}
                defaultValue={palette[field.key] ?? "#000000"}
                className="h-10 w-full rounded-lg border border-blush bg-cream"
              />
            </label>
          ))}
        </div>

        <button
          type="submit"
          className="mt-6 rounded-full bg-deep-rose px-5 py-2 text-sm text-cream transition-colors hover:bg-ink"
        >
          Save settings
        </button>
      </form>

      <p className="text-xs text-ink/50">
        Photo and audio uploads are added in a later phase; paste URLs for
        events and families.
      </p>
    </div>
  );
}
