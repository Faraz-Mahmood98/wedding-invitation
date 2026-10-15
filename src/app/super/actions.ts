"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { demoMode } from "@/lib/data/invitation";
import { requireSuperAdmin } from "@/lib/require-admin";
import { DEFAULT_THEME } from "@/lib/theme";
import { hashPassword } from "@/lib/auth";
import {
  newWeddingSchema,
  passwordResetSchema,
  slugify,
  superWeddingUpdateSchema,
} from "@/lib/validation";

function formToObject(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") result[key] = value;
  }
  return result;
}

async function uniqueWeddingSlug(desired: string, excludeId?: string): Promise<string> {
  const base = slugify(desired);
  let candidate = base;
  let attempt = 2;
  for (;;) {
    const clash = await prisma.wedding.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    if (!clash) return candidate;
    candidate = `${base}-${attempt}`;
    attempt += 1;
  }
}

export async function createWeddingAction(formData: FormData): Promise<void> {
  await requireSuperAdmin();
  const parsed = newWeddingSchema.safeParse(formToObject(formData));
  if (!parsed.success) return;
  if (demoMode()) return;

  const data = parsed.data;
  const slug = await uniqueWeddingSlug(data.slug || data.coupleNameEn);
  const passwordHash = await hashPassword(data.password);

  const created = await prisma.wedding.create({
    data: {
      slug,
      coupleNameEn: data.coupleNameEn,
      coupleNameUr: data.coupleNameUr,
      theme: DEFAULT_THEME as unknown as Prisma.InputJsonValue,
      timezone: data.timezone,
      defaultLang: data.defaultLang,
      adminEmail: data.adminEmail,
      passwordHash,
      admins: {
        create: [{ email: data.adminEmail, passwordHash, role: "wedding_admin" }],
      },
    },
  });

  revalidatePath("/super");
  redirect(`/super/${created.id}`);
}

export async function updateSuperWeddingAction(formData: FormData): Promise<void> {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const parsed = superWeddingUpdateSchema.safeParse(formToObject(formData));
  if (!parsed.success) return;
  if (demoMode()) return;

  const data = parsed.data;
  const slug = await uniqueWeddingSlug(data.slug, id);

  await prisma.$transaction([
    prisma.wedding.update({
      where: { id },
      data: {
        slug,
        coupleNameEn: data.coupleNameEn,
        coupleNameUr: data.coupleNameUr,
        adminEmail: data.adminEmail,
        timezone: data.timezone,
        defaultLang: data.defaultLang,
      },
    }),
    prisma.adminUser.updateMany({
      where: { weddingId: id, role: "wedding_admin" },
      data: { email: data.adminEmail },
    }),
  ]);

  revalidatePath("/super");
  revalidatePath(`/super/${id}`);
}

export async function resetWeddingPasswordAction(formData: FormData): Promise<void> {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = passwordResetSchema.safeParse(formToObject(formData));
  if (!id || !parsed.success) return;
  if (demoMode()) return;

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.$transaction([
    prisma.wedding.update({ where: { id }, data: { passwordHash } }),
    prisma.adminUser.updateMany({
      where: { weddingId: id, role: "wedding_admin" },
      data: { passwordHash },
    }),
  ]);

  revalidatePath(`/super/${id}`);
}

export async function deleteWeddingAction(formData: FormData): Promise<void> {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id || demoMode()) return;
  await prisma.wedding.delete({ where: { id } });
  revalidatePath("/super");
  redirect("/super");
}
