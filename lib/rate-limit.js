import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

/**
 * Rate limiter for the cron endpoint
 * Allows 10 requests per hour per IP to prevent abuse while allowing legitimate retries
 */
export const cronRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  analytics: true,
  prefix: "@upstash/ratelimit:cron",
});

/**
 * Rate limiter for server actions (data fetching)
 * Allows 60 requests per minute per IP to handle normal user traffic
 */
export const serverActionRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit:server-action",
});
