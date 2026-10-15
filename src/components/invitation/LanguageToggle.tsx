"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { locales, localeLabel, type Locale } from "@/lib/i18n";

interface LanguageToggleProps {
  locale: Locale;
}

/**
 * Fixed language switcher. Builds targets from the live browser URL so it
 * works identically on `{slug}.domain/{guest}` and `/w/{slug}/{guest}`.
 */
export function LanguageToggle({ locale }: LanguageToggleProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hrefFor = (value: Locale) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", value);
    return `${pathname}?${params.toString()}`;
  };

  return (
    <nav
      aria-label="Language"
      className="fixed z-40 flex items-center gap-1 rounded-full border border-blush bg-cream/90 p-1 shadow-sm backdrop-blur"
      style={{
        bottom: "calc(1rem + env(safe-area-inset-bottom))",
        right: "calc(1rem + env(safe-area-inset-right))",
      }}
    >
      {locales.map((value) => {
        const active = value === locale;
        return (
          <Link
            key={value}
            href={hrefFor(value)}
            hrefLang={value}
            aria-current={active ? "true" : undefined}
            className={
              active
                ? "rounded-full bg-deep-rose px-3 py-1 text-sm text-cream"
                : "rounded-full px-3 py-1 text-sm text-deep-rose"
            }
          >
            {localeLabel[value]}
          </Link>
        );
      })}
    </nav>
  );
}
