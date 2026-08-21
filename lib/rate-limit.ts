import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { headers } from 'next/headers';

export interface RateLimitConfig {
  interval: number; // in seconds
  limit: number; // max requests per interval
}

export type RouteProfile =
  | 'PUBLIC_READ'
  | 'SEARCH'
  | 'QUOTE_CREATE'
  | 'ORDER_CREATE'
  | 'PDF_GENERATION'
  | 'AUTH'
  | 'ADMIN_MUTATION'
  | 'DEFAULT';

export const RATE_LIMIT_PROFILES: Record<RouteProfile, RateLimitConfig> = {
  PUBLIC_READ: { interval: 60, limit: 60 },
  SEARCH: { interval: 60, limit: 20 },
  QUOTE_CREATE: { interval: 60, limit: 5 },
  ORDER_CREATE: { interval: 60, limit: 5 },
  PDF_GENERATION: { interval: 60, limit: 10 },
  AUTH: { interval: 60, limit: 5 },
  ADMIN_MUTATION: { interval: 60, limit: 30 },
  DEFAULT: { interval: 60, limit: 30 },
};

// Only initialize Redis if tokens are present to prevent crashes in CI/build
const redis =
  env.UPSTASH_REDIS_REST_URL !== 'https://placeholder.upstash.io' &&
  env.UPSTASH_REDIS_REST_TOKEN !== 'placeholder'
    ? new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const limiters = new Map<RouteProfile, Ratelimit>();

function getLimiter(profile: RouteProfile): Ratelimit | null {
  if (!redis) return null;

  if (!limiters.has(profile)) {
    const config = RATE_LIMIT_PROFILES[profile];
    limiters.set(
      profile,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.limit, `${config.interval} s`),
        analytics: true,
      })
    );
  }

  return limiters.get(profile)!;
}

export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  // On Vercel, x-real-ip or x-forwarded-for are reliably set by their proxy.
  // We prefer x-real-ip as it's the immediate connecting client to Vercel's edge,
  // preventing arbitrary client spoofing of x-forwarded-for.
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');

  if (realIp) {
    return realIp;
  }

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  return '127.0.0.1'; // Fallback
}

const memoryStore = new Map<string, number[]>();

function checkMemoryRateLimit(
  key: string,
  limit: number,
  intervalSeconds: number
) {
  const now = Date.now();
  const windowStart = now - intervalSeconds * 1000;
  const timestamps = (memoryStore.get(key) || []).filter(
    (t) => t > windowStart
  );

  if (timestamps.length >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: (timestamps[0] || now) + intervalSeconds * 1000,
    };
  }

  timestamps.push(now);
  memoryStore.set(key, timestamps);

  return {
    success: true,
    limit,
    remaining: limit - timestamps.length,
    reset: now + intervalSeconds * 1000,
  };
}

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
  const rateLimitKey = `${profile}:${identifier}`;

  const limiter = getLimiter(profile);

  if (!limiter) {
    return checkMemoryRateLimit(rateLimitKey, config.limit, config.interval);
  }

  try {
    const result = await limiter.limit(rateLimitKey);

    if (!result.success) {
      logger.warn(
        `Rate limit exceeded for profile ${profile} (ID: ${identifier})`
      );
    }

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error: any) {
    logger.warn(
      `Upstash Redis rate limit failed (${error?.message || error?.name}), falling back to memory rate limiting.`
    );
    return checkMemoryRateLimit(rateLimitKey, config.limit, config.interval);
  }
}
