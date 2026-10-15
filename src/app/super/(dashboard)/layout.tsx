import Link from "next/link";
import type { ReactNode } from "react";
import { requireSuperAdmin } from "@/lib/require-admin";
import { demoMode } from "@/lib/data/invitation";
import { LogoutButton } from "@/app/admin/(dashboard)/LogoutButton";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/super", label: "Weddings" },
  { href: "/super/new", label: "New wedding" },
];

export default async function SuperLayout({ children }: { children: ReactNode }) {
  const session = await requireSuperAdmin();

  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="border-b border-blush bg-white/70">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <p className="font-display text-xl text-deep-rose">Platform Admin</p>
            <p className="text-xs text-ink/50">{session.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-xs text-deep-rose underline underline-offset-2"
            >
              Wedding admin
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
          Demo mode — weddings are not persisted. Configure <code>DATABASE_URL</code> and set{" "}
          <code>INVITATION_DEMO=false</code> to manage real tenants.
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
