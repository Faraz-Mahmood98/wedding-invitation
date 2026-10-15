import Image from "next/image";
import type { Locale, Messages } from "@/lib/i18n";
import type { InvitationFamily } from "@/lib/invitation";
import { cn } from "@/lib/cn";
import { LocalizedText } from "./LocalizedText";
import { FigurePlaceholder, SideHeading } from "./FigurePlaceholder";

interface FamiliesProps {
  dict: Messages;
  locale: Locale;
  families: InvitationFamily[];
}

const SIDE_LABEL: Record<InvitationFamily["side"], keyof Messages["families"]> = {
  groom: "groomSide",
  bride: "brideSide",
};

export function Families({ dict, locale, families }: FamiliesProps) {
  if (families.length === 0) return null;

  return (
    <section className="px-6 py-12">
      <div className="mx-auto grid max-w-3xl gap-10 sm:grid-cols-2">
        {families.map((family) => (
          <article
            key={family.id}
            className="flex flex-col items-center rounded-3xl border border-blush bg-white/50 px-6 py-8 text-center"
          >
            <SideHeading urdu={locale === "ur"}>
              {dict.families[SIDE_LABEL[family.side]]}
            </SideHeading>
            {family.figureImage ? (
              <Image
                src={family.figureImage}
                alt=""
                width={160}
                height={160}
                className="mt-5 h-28 w-auto object-contain"
              />
            ) : (
              <FigurePlaceholder className="mt-5 h-28 w-auto text-rose" />
            )}
            <LocalizedText
              as="p"
              value={family.headName}
              locale={locale}
              className={cn("mt-4 font-display text-xl text-ink")}
            />
            <ul className="mt-3 flex flex-col gap-1 text-sm text-ink/70">
              {family.memberNames.map((member, index) => (
                <li key={index}>
                  <LocalizedText value={member} locale={locale} />
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
