import Link from "next/link";
import { requireSuperAdmin } from "@/lib/require-admin";
import { demoMode } from "@/lib/data/invitation";
import { createWeddingAction } from "../../actions";

export const dynamic = "force-dynamic";

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  dir,
  required,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  dir?: "rtl";
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-ink/60">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        dir={dir}
        required={required}
        defaultValue={defaultValue}
        className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
      />
      {hint ? <span className="text-ink/40">{hint}</span> : null}
    </label>
  );
}

export default async function NewWeddingPage() {
  await requireSuperAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-deep-rose">New wedding</h1>
        <p className="mt-1 text-sm text-ink/60">
          Creates the tenant plus its first wedding-admin account.
        </p>
      </div>

      <form
        action={createWeddingAction}
        className="rounded-2xl border border-blush bg-white/60 p-5"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Couple name (English)" name="coupleNameEn" required />
          <Field label="Couple name (Urdu)" name="coupleNameUr" dir="rtl" required />
          <Field
            label="Slug"
            name="slug"
            hint="Lower-case, URL-safe. Derived from the couple name if left blank."
          />
          <Field label="Timezone" name="timezone" defaultValue="Asia/Karachi" />
          <Field label="Admin email" name="adminEmail" type="email" required />
          <Field label="Admin password" name="password" type="password" required hint="At least 8 characters." />
          <label className="flex flex-col gap-1 text-xs text-ink/60">
            <span>Default language</span>
            <select
              name="defaultLang"
              defaultValue="en"
              className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
            >
              <option value="en">English</option>
              <option value="ur">Urdu</option>
            </select>
          </label>
        </div>

        {demoMode() ? (
          <p className="mt-4 rounded-xl bg-gold/20 px-3 py-2 text-xs text-ink/70">
            Demo mode is on — this will not be saved.
          </p>
        ) : null}

        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            className="rounded-full bg-deep-rose px-5 py-2 text-sm text-cream transition-colors hover:bg-ink"
          >
            Create wedding
          </button>
          <Link href="/super" className="text-sm text-deep-rose underline underline-offset-2">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
