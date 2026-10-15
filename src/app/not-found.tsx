import Link from "next/link";

export const metadata = {
  title: "Invitation not found",
  robots: { index: false, follow: false, nocache: true },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-6 text-center text-ink">
      <p className="text-xs uppercase tracking-[0.3em] text-gold">404</p>
      <h1 className="font-display text-3xl text-deep-rose">
        This invitation could not be found
      </h1>
      <p className="max-w-sm text-sm text-ink/70">
        The link may be mistyped or the invitation may have been removed.
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
