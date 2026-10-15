"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

interface Petal {
  id: number;
  x: number;
  drift: number;
  duration: number;
  size: number;
  rotate: number;
  color: string;
}

const COLORS = [
  "var(--theme-palette-rose)",
  "var(--theme-palette-gold)",
  "var(--theme-palette-blush)",
];

interface PetalLayerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps a card and showers petals from the tap point on any pointer press.
 * Respects `prefers-reduced-motion`.
 */
export function PetalLayer({ children, className }: PetalLayerProps) {
  const reduce = useReducedMotion();
  const [petals, setPetals] = useState<Petal[]>([]);
  const idRef = useRef(0);

  const spawn = useCallback((relX: number) => {
    const batch: Petal[] = Array.from({ length: 9 }, (_, index) => ({
      id: ++idRef.current,
      x: relX + (Math.random() - 0.5) * 70,
      drift: (Math.random() - 0.5) * 90,
      duration: 1.6 + Math.random() * 1.4,
      size: 8 + Math.random() * 8,
      rotate: Math.random() * 360,
      color: COLORS[index % COLORS.length],
    }));
    setPetals((previous) => [...previous, ...batch]);
    const ids = new Set(batch.map((petal) => petal.id));
    window.setTimeout(() => {
      setPetals((previous) => previous.filter((petal) => !ids.has(petal.id)));
    }, 3400);
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (reduce) return;
    const rect = event.currentTarget.getBoundingClientRect();
    spawn(event.clientX - rect.left);
  };

  return (
    <article
      onPointerDown={handlePointerDown}
      className={cn("relative overflow-hidden", className)}
    >
      {children}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {petals.map((petal) => (
          <motion.span
            key={petal.id}
            className="absolute left-0 top-0"
            style={{
              width: petal.size,
              height: petal.size,
              backgroundColor: petal.color,
              borderRadius: "0 100% 0 100%",
            }}
            initial={{ top: "-12%", x: petal.x, opacity: 0, rotate: petal.rotate, scale: 0.6 }}
            animate={{
              top: "112%",
              x: petal.x + petal.drift,
              opacity: [0, 1, 1, 0],
              rotate: petal.rotate + 240,
              scale: 1,
            }}
            transition={{ duration: petal.duration, ease: "easeIn" }}
          />
        ))}
      </div>
    </article>
  );
}
