import { describe, expect, it } from "vitest";
import { clampSeats, MAX_FAMILY_SEATS } from "./rsvp";

describe("clampSeats", () => {
  it("returns the requested count when within the cap", () => {
    expect(clampSeats(2, 4)).toBe(2);
  });

  it("clamps to seatsAllowed", () => {
    expect(clampSeats(9, 2)).toBe(2);
  });

  it("clamps unlimited (null) seats to MAX_FAMILY_SEATS", () => {
    expect(clampSeats(999, null)).toBe(MAX_FAMILY_SEATS);
  });

  it("never returns a negative or fractional count", () => {
    expect(clampSeats(-5, 4)).toBe(0);
    expect(clampSeats(2.9, 4)).toBe(2);
  });

  it("treats non-finite input as zero", () => {
    expect(clampSeats(Number.NaN, 4)).toBe(0);
  });
});
