"use client";

import { Reveal } from "./Reveal";
import { useInvitationUI } from "../InvitationProvider";

/** Reveal that waits until the opening gate has been dismissed. */
export function IntroReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { opened } = useInvitationUI();
  return (
    <Reveal className={className} active={opened}>
      {children}
    </Reveal>
  );
}
