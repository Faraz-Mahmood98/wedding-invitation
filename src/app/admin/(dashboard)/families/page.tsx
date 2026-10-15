import { requireWeddingAdmin } from "@/lib/require-admin";
import { listFamilies, type AdminFamily } from "@/lib/data/admin";
import { UploadField } from "@/components/admin/UploadField";
import { deleteFamilyAction, saveFamilyAction } from "../../actions";

export const dynamic = "force-dynamic";

function FamilyFields({ family }: { family: AdminFamily | null }) {
  const membersEn = family?.memberNames.map((member) => member.en).join(", ") ?? "";
  const membersUr = family?.memberNames.map((member) => member.ur).join(", ") ?? "";
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {family ? <input type="hidden" name="id" value={family.id} /> : null}
      <label className="flex flex-col gap-1 text-xs text-ink/60">
        <span>Side</span>
        <select
          name="side"
          defaultValue={family?.side ?? "groom"}
          className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
        >
          <option value="groom">Groom</option>
          <option value="bride">Bride</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-ink/60">
        <span>Order</span>
        <input
          name="order"
          type="number"
          defaultValue={family?.order ?? 0}
          className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-ink/60">
        <span>Head name (English)</span>
        <input
          name="headNameEn"
          required
          defaultValue={family?.headNameEn ?? ""}
          className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-ink/60">
        <span>Head name (Urdu)</span>
        <input
          name="headNameUr"
          required
          dir="rtl"
          defaultValue={family?.headNameUr ?? ""}
          className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-ink/60">
        <span>Members (English, comma-separated)</span>
        <input
          name="membersEn"
          defaultValue={membersEn}
          className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-ink/60">
        <span>Members (Urdu, comma-separated)</span>
        <input
          name="membersUr"
          dir="rtl"
          defaultValue={membersUr}
          className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
        />
      </label>
      <div className="sm:col-span-2">
        <UploadField
          name="figureImage"
          label="Figure image"
          defaultValue={family?.figureImage ?? ""}
          kind="image"
          placeholder="Paste a URL or upload a file"
          hint="JPEG, PNG, WebP, AVIF or GIF up to 8 MB."
        />
      </div>
    </div>
  );
}

export default async function FamiliesPage() {
  const { weddingId } = await requireWeddingAdmin();
  const families = await listFamilies(weddingId);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl text-deep-rose">Families</h1>

      <section className="rounded-2xl border border-blush bg-white/60 p-5">
        <h2 className="font-display text-lg text-deep-rose">Add family</h2>
        <form action={saveFamilyAction} className="mt-4">
          <FamilyFields family={null} />
          <button
            type="submit"
            className="mt-4 rounded-full bg-deep-rose px-5 py-2 text-sm text-cream transition-colors hover:bg-ink"
          >
            Add family
          </button>
        </form>
      </section>

      {families.map((family) => (
        <section key={family.id} className="rounded-2xl border border-blush bg-white/60 p-5">
          <form action={saveFamilyAction}>
            <FamilyFields family={family} />
            <button
              type="submit"
              className="mt-4 rounded-full bg-deep-rose px-4 py-2 text-sm text-cream transition-colors hover:bg-ink"
            >
              Save
            </button>
          </form>
          <form action={deleteFamilyAction} className="mt-2">
            <input type="hidden" name="id" value={family.id} />
            <button
              type="submit"
              className="rounded-full border border-rose px-3 py-1.5 text-xs text-deep-rose transition-colors hover:bg-deep-rose hover:text-cream"
            >
              Delete family
            </button>
          </form>
        </section>
      ))}
      {families.length === 0 ? <p className="text-sm text-ink/50">No families yet.</p> : null}
    </div>
  );
}
