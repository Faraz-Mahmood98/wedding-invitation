import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { demoMode } from "@/lib/data/invitation";

export const metadata = {
  title: "Invitation",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Landing page for a wedding host without a personal guest slug
 * (e.g. opening the bare subdomain). Shows a neutral prompt.
 */
export default async function WeddingLandingPage({
  params,
}: {
  params: Promise<{ weddingSlug: string }>;
}) {
  const { weddingSlug } = await params;

  let coupleName: string | null = null;
  if (demoMode()) {
    coupleName = "Syed Bilal Zaidi & Sara Javed";
  } else {
    const wedding = await prisma.wedding
      .findUnique({
        where: { slug: weddingSlug },
        select: { coupleNameEn: true },
      })
      .catch(() => null);
    coupleName = wedding?.coupleNameEn ?? null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-6 text-center text-ink">
      <p className="text-xs uppercase tracking-[0.3em] text-gold">
        {coupleName ?? "Wedding"}
      </p>
      <h1 className="font-display text-3xl text-deep-rose">
        This link needs your personal invitation code
      </h1>
      <p className="max-w-sm text-sm text-ink/70">
        Please open the personal link that was shared with you.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full border border-deep-rose px-5 py-2 text-sm text-deep-rose"
      >
        Back
      </Link>
    </main>
  );
}
