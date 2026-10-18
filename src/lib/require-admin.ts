import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "./auth";
import { prisma } from "./prisma";
import { demoMode } from "./data/invitation";

export type WeddingAdminSession = SessionPayload & { weddingId: string };
export type SuperAdminSession = SessionPayload & { role: "super_admin" };

/**
 * Server-side guard for the per-wedding admin. Redirects to the login page when
 * there is no session, and rejects sessions that are not scoped to a wedding.
 */
export async function requireWeddingAdmin(): Promise<WeddingAdminSession> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.weddingId) {
    if (!demoMode()) {
      const exists = await prisma.wedding.findUnique({
        where: { id: session.weddingId },
        select: { id: true },
      });
      if (!exists) redirect("/admin/login");
    }
    return session as WeddingAdminSession;
  }
  redirect("/admin/login?error=forbidden");
}

/**
 * Server-side guard for the platform (super) admin. Wedding admins are sent back
 * to their own dashboard rather than being shown the login form again.
 */
export async function requireSuperAdmin(): Promise<SuperAdminSession> {
  const session = await getSession();
  if (!session) redirect("/super/login");
  if (session.role === "super_admin") return session as SuperAdminSession;
  redirect("/super/login?error=forbidden");
}
