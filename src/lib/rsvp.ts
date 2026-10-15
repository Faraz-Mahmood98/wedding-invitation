/** Upper bound applied when a guest has unlimited (full-family) seats. */
export const MAX_FAMILY_SEATS = 20;

/**
 * Constrains a requested seat count to what the guest is allowed for an event.
 * `seatsAllowed === null` means a full-family invitation and is capped at
 * `MAX_FAMILY_SEATS`.
 */
export function clampSeats(requested: number, seatsAllowed: number | null): number {
  const max = seatsAllowed ?? MAX_FAMILY_SEATS;
  const value = Number.isFinite(requested) ? Math.floor(requested) : 0;
  return Math.max(0, Math.min(value, Math.max(0, max)));
}
