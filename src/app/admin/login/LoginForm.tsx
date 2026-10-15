"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error("invalid");
      const data = (await response.json().catch(() => null)) as { role?: string } | null;
      router.replace(data?.role === "super_admin" ? "/super" : "/admin");
      router.refresh();
    } catch {
      setError(true);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm text-ink/80">
        <span>Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-blush bg-cream px-3 py-2 text-ink"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink/80">
        <span>Password</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl border border-blush bg-cream px-3 py-2 text-ink"
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm text-deep-rose">
          Invalid email or password.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-deep-rose px-5 py-3 text-sm text-cream transition-colors hover:bg-ink disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
