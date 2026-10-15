import type { ElementType } from "react";
import type { Locale } from "@/lib/i18n";
import { pick, type LocalizedTextPartial } from "@/lib/types";
import { cn } from "@/lib/cn";

interface LocalizedTextProps {
  value: LocalizedTextPartial | null | undefined;
  locale: Locale;
  as?: ElementType;
  className?: string;
  /** Force RTL even when locale is English (rarely needed). */
  forceRtl?: boolean;
}

/**
 * Renders a bilingual text block. Urdu gets `dir="rtl"`, `lang="ur"` and the
 * Nastaliq font, but the surrounding layout is never mirrored.
 */
export function LocalizedText({
  value,
  locale,
  as,
  className,
  forceRtl,
}: LocalizedTextProps) {
  const text = pick(value, locale);
  if (!text) return null;
  const Component = (as ?? "span") as ElementType;
  const rtl = forceRtl || locale === "ur";
  return (
    <Component
      dir={rtl ? "rtl" : undefined}
      lang={rtl ? "ur" : undefined}
      className={cn(rtl && "text-urdu", className)}
    >
      {text}
    </Component>
  );
}
