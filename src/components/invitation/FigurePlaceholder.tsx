import { cn } from "@/lib/cn";

/** Decorative illustrated-figure placeholder for a family column. */
export function FigurePlaceholder({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 140"
      className={className}
      role="img"
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M60 12c-14 0-24 10-24 24 0 7 3 13 7 17-11 5-20 15-23 30-2 9-3 20-3 33h86c0-13-1-24-3-33-3-15-12-25-23-30 4-4 7-10 7-17 0-14-10-24-24-24z"
        fill="currentColor"
        opacity="0.75"
      />
      <path
        d="M60 130c-16 0-29-4-38-11h76c-9 7-22 11-38 11z"
        fill="currentColor"
        opacity="0.45"
      />
    </svg>
  );
}

export function SideHeading({
  children,
  className,
  urdu,
}: {
  children: React.ReactNode;
  className?: string;
  urdu?: boolean;
}) {
  return (
    <h3
      dir={urdu ? "rtl" : undefined}
      lang={urdu ? "ur" : undefined}
      className={cn(
        "text-center font-display text-2xl text-deep-rose",
        urdu && "text-urdu",
        className,
      )}
    >
      {children}
    </h3>
  );
}
