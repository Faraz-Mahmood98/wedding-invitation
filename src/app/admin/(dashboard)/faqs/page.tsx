import { requireWeddingAdmin } from "@/lib/require-admin";
import { listFaqs, type AdminFaq } from "@/lib/data/admin";
import { deleteFaqAction, saveFaqAction } from "../../actions";

export const dynamic = "force-dynamic";

function FaqFields({ faq }: { faq: AdminFaq | null }) {
  return (
    <div className="flex flex-col gap-3">
      {faq ? <input type="hidden" name="id" value={faq.id} /> : null}
      <label className="flex flex-col gap-1 text-xs text-ink/60">
        <span>Order</span>
        <input
          name="order"
          type="number"
          defaultValue={faq?.order ?? 1}
          className="w-24 rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-ink/60">
          <span>Question (English)</span>
          <input
            name="questionEn"
            required
            defaultValue={faq?.questionEn ?? ""}
            className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink/60">
          <span>Question (Urdu)</span>
          <input
            name="questionUr"
            required
            dir="rtl"
            defaultValue={faq?.questionUr ?? ""}
            className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink/60">
          <span>Answer (English)</span>
          <textarea
            name="answerEn"
            required
            rows={3}
            defaultValue={faq?.answerEn ?? ""}
            className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink/60">
          <span>Answer (Urdu)</span>
          <textarea
            name="answerUr"
            required
            dir="rtl"
            rows={3}
            defaultValue={faq?.answerUr ?? ""}
            className="rounded-lg border border-blush bg-cream px-2 py-1.5 text-sm text-ink"
          />
        </label>
      </div>
    </div>
  );
}

export default async function FaqsPage() {
  const { weddingId } = await requireWeddingAdmin();
  const faqs = await listFaqs(weddingId);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl text-deep-rose">FAQs</h1>

      <section className="rounded-2xl border border-blush bg-white/60 p-5">
        <h2 className="font-display text-lg text-deep-rose">Add FAQ</h2>
        <form action={saveFaqAction} className="mt-4">
          <FaqFields faq={null} />
          <button
            type="submit"
            className="mt-4 rounded-full bg-deep-rose px-5 py-2 text-sm text-cream transition-colors hover:bg-ink"
          >
            Add FAQ
          </button>
        </form>
      </section>

      {faqs.map((faq) => (
        <section key={faq.id} className="rounded-2xl border border-blush bg-white/60 p-5">
          <form action={saveFaqAction}>
            <FaqFields faq={faq} />
            <button
              type="submit"
              className="mt-4 rounded-full bg-deep-rose px-4 py-2 text-sm text-cream transition-colors hover:bg-ink"
            >
              Save
            </button>
          </form>
          <form action={deleteFaqAction} className="mt-2">
            <input type="hidden" name="id" value={faq.id} />
            <button
              type="submit"
              className="rounded-full border border-rose px-3 py-1.5 text-xs text-deep-rose transition-colors hover:bg-deep-rose hover:text-cream"
            >
              Delete FAQ
            </button>
          </form>
        </section>
      ))}
      {faqs.length === 0 ? <p className="text-sm text-ink/50">No FAQs yet.</p> : null}
    </div>
  );
}
