export interface RateLimitConfig {
  interval: number; // in seconds
  limit: number; // max requests per interval
}

export type RouteProfile =
  'AUTH' | 'API' | 'ADMIN' | 'QUOTE' | 'ORDER' | 'DEFAULT';

export const RATE_LIMIT_PROFILES: Record<RouteProfile, RateLimitConfig> = {
  AUTH: { interval: 60, limit: 5 }, // 5 requests per minute
  API: { interval: 60, limit: 60 }, // 60 requests per minute
  ADMIN: { interval: 60, limit: 120 }, // 120 requests per minute
  QUOTE: { interval: 60, limit: 20 }, // 20 requests per minute
  ORDER: { interval: 60, limit: 10 }, // 10 requests per minute
  DEFAULT: { interval: 60, limit: 30 }, // 30 requests per minute
};

// In-memory store for development/preparation.
// Can be replaced with Redis/Upstash later.
const ipCache = new Map<string, { count: number; expiresAt: number }>();

export async function rateLimit(
  identifier: string, // IP or User ID
  profile: RouteProfile = 'DEFAULT'
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const config = RATE_LIMIT_PROFILES[profile];
  const now = Date.now();

  const record = ipCache.get(identifier);

  if (!record || record.expiresAt < now) {
    ipCache.set(identifier, {
      count: 1,
      expiresAt: now + config.interval * 1000,
    });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: now + config.interval * 1000,
    };
  }

  if (record.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: record.expiresAt,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - record.count,
    reset: record.expiresAt,
  };
}
