/**
 * Fixed-window in-memory rate limiter.
 *
 * Suitable for a single-node deployment (the current runtime). The public API
 * is intentionally storage-agnostic so it can be backed by Redis
 * (`INCR` + `PEXPIRE`) when the platform scales horizontally — call-sites
 * will not change.
 */

type Bucket = { count: number; resetAt: number };

const globalForRl = globalThis as typeof globalThis & {
  __ilToolsRateLimitBuckets?: Map<string, Bucket>;
};

const buckets = (globalForRl.__ilToolsRateLimitBuckets ??= new Map());

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }
  bucket.count += 1;
  const allowed = bucket.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
  };
}

/** Best-effort client IP extraction for rate-limit keys. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "local";
}
