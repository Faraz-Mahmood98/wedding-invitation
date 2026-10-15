import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationView } from "@/components/invitation/InvitationView";
import { toLocale } from "@/lib/i18n";
import { loadInvitation, recordGuestOpen } from "@/lib/data/invitation";

interface InvitationPageProps {
  params: Promise<{ weddingSlug: string; guestSlug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({
  params,
}: InvitationPageProps): Promise<Metadata> {
  const { weddingSlug } = await params;
  return {
    title: `Invitation · ${weddingSlug}`,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function InvitationPage({
  params,
  searchParams,
}: InvitationPageProps) {
  const { weddingSlug, guestSlug } = await params;
  const { lang } = await searchParams;

  const invitation = await loadInvitation(weddingSlug, guestSlug);
  if (!invitation) notFound();

  void recordGuestOpen(weddingSlug, guestSlug).catch(() => {
    /* tracking is best-effort */
  });

  const locale = toLocale(
    lang ?? invitation.guest.lang,
    toLocale(invitation.wedding.defaultLang),
  );

  return <InvitationView invitation={invitation} locale={locale} />;
}
