import { InvitationView } from "@/components/invitation/InvitationView";
import { toLocale } from "@/lib/i18n";
import { DEMO_DEFAULT_GUEST, getDemoInvitation } from "@/lib/fixtures/demo-invitation";

export const metadata = {
  title: "Invitation preview",
  robots: { index: false, follow: false },
};

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ guest?: string; lang?: string }>;
}) {
  const params = await searchParams;
  const guestSlug = params.guest ?? DEMO_DEFAULT_GUEST;
  const invitation = getDemoInvitation(guestSlug);
  const locale = toLocale(params.lang ?? invitation.guest.lang);

  return <InvitationView invitation={invitation} locale={locale} />;
}
