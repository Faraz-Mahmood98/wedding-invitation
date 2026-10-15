import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { demoMode } from "@/lib/data/invitation";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session?.role === "super_admin") redirect("/super");
  if (session?.weddingId) redirect("/admin");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl text-deep-rose">Wedding Admin</h1>
      <p className="mt-1 text-sm text-ink/60">Sign in to manage your wedding.</p>
      <div className="mt-8 rounded-3xl border border-blush bg-white/60 p-6">
        <LoginForm />
      </div>
      {demoMode() ? (
        <p className="mt-4 rounded-2xl bg-blush/50 px-4 py-3 text-xs text-ink/70">
          Demo mode: sign in with <strong>bilal.sara@example.com</strong> /{" "}
          <strong>changeme123</strong>
        </p>
      ) : null}
    </main>
  );
}
