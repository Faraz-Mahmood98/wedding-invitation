export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  reset: number;
}

interface Bucket {
  count: number;
  reset: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Fixed-window in-memory rate limiter. Adequate for a single instance;
 * swap for a shared store (Upstash/Redis) when scaling horizontally.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  const existing = buckets.get(key);
  if (!existing || existing.reset <= now) {
    const reset = now + windowMs;
    buckets.set(key, { count: 1, reset });
    return { ok: true, remaining: limit - 1, reset };
  }

  existing.count += 1;
  return {
    ok: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    reset: existing.reset,
  };
}

export function resetRateLimiter(): void {
  buckets.clear();
}
