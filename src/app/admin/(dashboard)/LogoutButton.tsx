"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const logout = () => {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className="rounded-full border border-rose px-3 py-1.5 text-xs text-deep-rose transition-colors hover:bg-deep-rose hover:text-cream disabled:opacity-60"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
