import type { NextFunction, Request, Response } from "express";

const windowMs = 60_000;
const max = 120;
const buckets = new Map<string, { count: number; reset: number }>();

/** In-memory limiter (scaffold). Swap for Redis in multi-instance production. */
export function rateLimit(opts?: { max?: number }) {
  const limit = opts?.max ?? max;
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.user?.sub ?? req.ip ?? "anon";
    const now = Date.now();
    const b = buckets.get(key);
    if (!b || now > b.reset) {
      buckets.set(key, { count: 1, reset: now + windowMs });
      next();
      return;
    }
    if (b.count >= limit) {
      res.status(429).json({ message: "Too many requests" });
      return;
    }
    b.count += 1;
    next();
  };
}
