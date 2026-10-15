import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoMode } from "@/lib/data/invitation";
import { DEMO_WEDDING_ID, DEMO_WEDDING_SLUG } from "@/lib/fixtures/demo-invitation";
import { rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";
import { setSessionCookie, verifyPassword, type Role } from "@/lib/auth";

export const runtime = "nodejs";

const DEMO_PASSWORD = "changeme123";
const DEMO_ADMINS: Array<{ email: string; role: Role; weddingId: string | null }> = [
  { email: "super@example.com", role: "super_admin", weddingId: null },
  { email: "bilal.sara@example.com", role: "wedding_admin", weddingId: DEMO_WEDDING_ID },
];

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: Request) {
  const limit = rateLimit(`login:${clientIp(request)}`, 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();

  if (demoMode()) {
    const admin = DEMO_ADMINS.find((entry) => entry.email === email);
    if (!admin || parsed.data.password !== DEMO_PASSWORD) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }
    await setSessionCookie({
      sub: `demo-${admin.role}`,
      email: admin.email,
      role: admin.role,
      weddingId: admin.weddingId,
    });
    return NextResponse.json({ ok: true, demo: true, role: admin.role, weddingSlug: DEMO_WEDDING_SLUG });
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin || !(await verifyPassword(parsed.data.password, admin.passwordHash))) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  await setSessionCookie({
    sub: admin.id,
    email: admin.email,
    role: admin.role as Role,
    weddingId: admin.weddingId,
  });

  return NextResponse.json({ ok: true, role: admin.role });
}
