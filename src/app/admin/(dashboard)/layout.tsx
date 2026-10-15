import Link from "next/link";
import type { ReactNode } from "react";
import { requireWeddingAdmin } from "@/lib/require-admin";
import { getAdminWedding } from "@/lib/data/admin";
import { demoMode } from "@/lib/data/invitation";
import { LogoutButton } from "./LogoutButton";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/guests", label: "Guests" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/families", label: "Families" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireWeddingAdmin();
  const wedding = await getAdminWedding(session.weddingId);

  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="border-b border-blush bg-white/70">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <p className="font-display text-xl text-deep-rose">
              {wedding?.coupleNameEn ?? "Wedding Admin"}
            </p>
            <p className="text-xs text-ink/50">{session.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/w/${wedding?.slug ?? ""}`}
              className="text-xs text-deep-rose underline underline-offset-2"
            >
              View invitation
            </Link>
            <LogoutButton />
          </div>
        </div>
        <nav className="mx-auto flex w-full max-w-5xl flex-wrap gap-1 px-4 pb-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-sm text-ink/70 transition-colors hover:bg-blush/60 hover:text-deep-rose"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {demoMode() ? (
        <div className="bg-gold/20 px-6 py-2 text-center text-xs text-ink/80">
          Demo mode — changes are not persisted. Configure <code>DATABASE_URL</code> and set{" "}
          <code>INVITATION_DEMO=false</code> to save.
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
