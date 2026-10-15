export interface RateLimiter {
  allow(key: string, now?: number): boolean;
}

const WINDOW_MS = 60_000;

export function createRateLimiter(limitPerMinute: number): RateLimiter {
  const windows = new Map<string, { count: number; resetAt: number }>();
  return {
    allow(key, now = Date.now()) {
      if (windows.size > 10_000) {
        for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k);
      }
      const current = windows.get(key);
      if (!current || current.resetAt <= now) {
        windows.set(key, { count: 1, resetAt: now + WINDOW_MS });
        return true;
      }
      current.count += 1;
      return current.count <= limitPerMinute;
    },
  };
}
