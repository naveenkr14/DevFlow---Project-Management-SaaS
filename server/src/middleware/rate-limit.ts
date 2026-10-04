import type { RequestHandler } from "express";

type RateLimitOptions = {
  windowMs: number;
  max: number;
  code?: string;
  message?: string;
};

type Hit = {
  count: number;
  resetAt: number;
};

export const createRateLimiter = ({
  windowMs,
  max,
  code = "AUTH_RATE_LIMITED",
  message = "Too many authentication attempts. Please try again later.",
}: RateLimitOptions): RequestHandler => {
  // Extension point: replace this process-local store with a shared store
  // when the API is scaled beyond one backend instance.
  const hits = new Map<string, Hit>();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const existingHit = hits.get(key);
    const hit = existingHit && existingHit.resetAt > now
      ? existingHit
      : { count: 0, resetAt: now + windowMs };

    hit.count += 1;
    hits.set(key, hit);

    if (hits.size > 10_000) {
      for (const [entryKey, entry] of hits) {
        if (entry.resetAt <= now) {
          hits.delete(entryKey);
        }
      }
    }

    if (hit.count > max) {
      res.setHeader(
        "Retry-After",
        Math.max(1, Math.ceil((hit.resetAt - now) / 1000)),
      );
      res.status(429).json({
        success: false,
        error: {
          code,
          message,
        },
      });
      return;
    }

    next();
  };
};
