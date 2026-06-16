interface RateLimitRecord {
  timestamps: number[];
}

const cache = new Map<string, RateLimitRecord>();

// Periodic cleanup of expired entries
if (typeof global !== 'undefined') {
  // Store the interval reference to prevent multiple intervals on hot reloads
  const globalCoerced = global as any;
  if (!globalCoerced.__rateLimitInterval) {
    globalCoerced.__rateLimitInterval = setInterval(() => {
      const now = Date.now();
      for (const [ip, record] of cache.entries()) {
        record.timestamps = record.timestamps.filter(t => now - t < 60000);
        if (record.timestamps.length === 0) {
          cache.delete(ip);
        }
      }
    }, 60000);
  }
}

/**
 * IP-based in-memory rate limiter
 * @param ip Client IP address
 * @param limit Request limit within the window
 * @param windowMs Time window in milliseconds (default 1 minute)
 */
export function rateLimit(
  ip: string,
  limit: number = 30,
  windowMs: number = 60000
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  let record = cache.get(ip);

  if (!record) {
    record = { timestamps: [] };
    cache.set(ip, record);
  }

  // Filter timestamps to only keep those within the current window
  record.timestamps = record.timestamps.filter(t => now - t < windowMs);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0] || now;
    const reset = oldestTimestamp + windowMs;
    return {
      success: false,
      limit,
      remaining: 0,
      reset,
    };
  }

  record.timestamps.push(now);
  return {
    success: true,
    limit,
    remaining: limit - record.timestamps.length,
    reset: now + windowMs,
  };
}
