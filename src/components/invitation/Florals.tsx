import { cn } from "@/lib/cn";

/**
 * Decorative floral motifs used across the invitation. Every shape is drawn
 * with `currentColor`, so the surrounding Tailwind `text-*` utility (mapped to
 * the wedding palette) recolours it automatically per tenant.
 */

interface MotifProps {
  className?: string;
}

interface Point {
  x: number;
  y: number;
}

function Bloom({
  cx,
  cy,
  r,
  className,
}: {
  cx: number;
  cy: number;
  r: number;
  className?: string;
}) {
  return (
    <g className={className}>
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx={cx}
          cy={cy - r * 0.55}
          rx={r * 0.42}
          ry={r * 0.72}
          transform={`rotate(${angle} ${cx} ${cy})`}
          fill="currentColor"
          opacity={0.9}
        />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.26} fill="currentColor" />
    </g>
  );
}

function Leaf({
  x,
  y,
  angle,
  length,
  className,
}: Point & { angle: number; length: number; className?: string }) {
  return (
    <ellipse
      cx={x}
      cy={y}
      rx={length * 0.5}
      ry={length * 0.2}
      transform={`rotate(${angle} ${x} ${y})`}
      fill="currentColor"
      className={className}
    />
  );
}

function Vine({ d, className }: { d: string; className?: string }) {
  return (
    <path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      className={className}
    />
  );
}

/** A floral cluster for a page/section corner. Flip with Tailwind `scale-x-[-1]` etc. */
export function FloralCorner({ className }: MotifProps) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={cn("text-gold", className)}
      aria-hidden="true"
      fill="none"
    >
      <Vine d="M10 10 C 46 26, 78 34, 104 54 C 124 70, 136 92, 144 120" />
      <Leaf x={34} y={22} angle={28} length={34} className="text-gold" />
      <Leaf x={60} y={34} angle={34} length={30} className="text-rose/70" />
      <Leaf x={88} y={50} angle={40} length={32} className="text-gold" />
      <Leaf x={116} y={76} angle={46} length={30} className="text-rose/70" />
      <Leaf x={130} y={104} angle={52} length={26} className="text-gold" />
      <Bloom cx={24} cy={24} r={17} className="text-rose" />
      <Bloom cx={100} cy={54} r={13} className="text-deep-rose/80" />
      <Bloom cx={140} cy={122} r={11} className="text-rose" />
    </svg>
  );
}

/** A symmetric rose garland that arches over the top of a panel. */
export function FloralArch({ className }: MotifProps) {
  const half = (
    <>
      <Vine d="M160 34 C 120 34, 74 44, 40 74 C 22 90, 12 106, 8 126" />
      <Leaf x={132} y={36} angle={196} length={30} className="text-gold" />
      <Leaf x={98} y={44} angle={210} length={30} className="text-rose/70" />
      <Leaf x={66} y={62} angle={222} length={30} className="text-gold" />
      <Leaf x={38} y={88} angle={232} length={28} className="text-rose/70" />
      <Leaf x={18} y={112} angle={240} length={26} className="text-gold" />
      <Bloom cx={40} cy={74} r={13} className="text-rose" />
      <Bloom cx={8} cy={126} r={11} className="text-deep-rose/80" />
    </>
  );

  return (
    <svg
      viewBox="0 0 320 140"
      className={cn("text-gold", className)}
      aria-hidden="true"
      fill="none"
    >
      {half}
      <g transform="translate(320 0) scale(-1 1)">{half}</g>
      <Bloom cx={160} cy={36} r={19} className="text-deep-rose" />
      <Leaf x={160} y={70} angle={90} length={30} className="text-gold" />
    </svg>
  );
}

/** A divider: gold rule with leaves and a central rose. */
export function FloralDivider({ className }: MotifProps) {
  return (
    <svg
      viewBox="0 0 280 34"
      className={cn("text-gold", className)}
      aria-hidden="true"
      fill="none"
    >
      <path d="M6 17 H108" stroke="currentColor" strokeWidth={1.2} opacity={0.7} />
      <path d="M172 17 H274" stroke="currentColor" strokeWidth={1.2} opacity={0.7} />
      <Leaf x={126} y={17} angle={-18} length={30} className="text-gold" />
      <Leaf x={154} y={17} angle={18} length={30} className="text-gold" />
      <Leaf x={112} y={24} angle={20} length={22} className="text-rose/70" />
      <Leaf x={168} y={24} angle={-20} length={22} className="text-rose/70" />
      <Bloom cx={140} cy={17} r={15} className="text-rose" />
    </svg>
  );
}

/** A thin ring with floral ticks; used behind the monogram. */
export function FloralRing({ className }: MotifProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn("text-gold", className)}
      aria-hidden="true"
      fill="none"
    >
      <circle cx={60} cy={60} r={51} stroke="currentColor" strokeWidth={1.2} opacity={0.8} />
      <circle cx={60} cy={60} r={44} stroke="currentColor" strokeWidth={0.6} opacity={0.45} />
      <Leaf x={60} y={8} angle={90} length={20} className="text-gold" />
      <Leaf x={112} y={60} angle={0} length={20} className="text-gold" />
      <Leaf x={60} y={112} angle={90} length={20} className="text-gold" />
      <Leaf x={8} y={60} angle={0} length={20} className="text-gold" />
      <Bloom cx={60} cy={8} r={7} className="text-rose" />
      <Bloom cx={60} cy={112} r={7} className="text-rose" />
    </svg>
  );
}

/** Circular monogram medallion: initials framed by a floral ring. */
export function Monogram({
  initials,
  className,
  labelClassName,
}: MotifProps & { initials: string[]; labelClassName?: string }) {
  return (
    <div className={cn("relative grid place-items-center", className)}>
      <FloralRing className="absolute inset-0 h-full w-full" />
      <span
        className={cn(
          "font-display leading-none text-cream drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]",
          labelClassName,
        )}
      >
        {initials.join(" · ")}
      </span>
    </div>
  );
}
