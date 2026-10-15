import { cn } from "@/lib/cn";

export function Ornament({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center justify-center gap-3 text-gold", className)}
      aria-hidden="true"
    >
      <span className="h-px w-10 bg-current opacity-60 sm:w-16" />
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M7 0l3.5 3.5L14 7l-3.5 3.5L7 14l-3.5-3.5L0 7l3.5-3.5z"
          fill="currentColor"
        />
      </svg>
      <span className="h-px w-10 bg-current opacity-60 sm:w-16" />
    </div>
  );
}
