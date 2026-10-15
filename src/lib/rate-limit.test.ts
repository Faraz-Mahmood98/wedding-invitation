import { beforeEach, describe, expect, it } from "vitest";
import { rateLimit, resetRateLimiter } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => resetRateLimiter());

  it("allows up to the limit within the window", () => {
    const now = 1_000;
    expect(rateLimit("k", 3, 1_000, now).ok).toBe(true);
    expect(rateLimit("k", 3, 1_000, now).ok).toBe(true);
    expect(rateLimit("k", 3, 1_000, now).ok).toBe(true);
    const blocked = rateLimit("k", 3, 1_000, now);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("resets after the window elapses", () => {
    expect(rateLimit("k", 1, 1_000, 0).ok).toBe(true);
    expect(rateLimit("k", 1, 1_000, 500).ok).toBe(false);
    expect(rateLimit("k", 1, 1_000, 1_001).ok).toBe(true);
  });

  it("tracks keys independently", () => {
    expect(rateLimit("a", 1, 1_000, 0).ok).toBe(true);
    expect(rateLimit("b", 1, 1_000, 0).ok).toBe(true);
    expect(rateLimit("a", 1, 1_000, 0).ok).toBe(false);
  });
});
