"use client";

import { motion, useReducedMotion } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** When provided, the reveal is controlled by this flag instead of scroll. */
  active?: boolean;
}

export function Reveal({ children, className, delay = 0, y = 24, active }: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  const transition = { duration: 0.6, delay, ease: "easeOut" as const };
  const initial = { opacity: 0, y };
  const shown = { opacity: 1, y: 0 };

  if (typeof active === "boolean") {
    return (
      <motion.div
        className={className}
        initial={initial}
        animate={active ? shown : initial}
        transition={transition}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={shown}
      viewport={{ once: true, amount: 0.2 }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
