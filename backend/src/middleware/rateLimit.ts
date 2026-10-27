import rateLimit from "express-rate-limit";
import { config } from "../config/env";
import { tooMany } from "../utils/errors";

const windowMs = config.rateLimitWindowMs;

/** Default limiter for general API routes. */
export const apiLimiter = rateLimit({
  windowMs,
  limit: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw tooMany("Too many requests. Please slow down.");
  },
});

/** Stricter limiter for the public contact form (anti-spam). */
export const contactLimiter = rateLimit({
  windowMs,
  limit: 10, // 10 contact submissions per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw tooMany("Too many contact submissions. Try again shortly.");
  },
});

/** Limiter for device data ingestion endpoints. Keyed by IP because device
 * authentication happens after this limiter in the route stack. */
export const deviceIngestLimiter = rateLimit({
  windowMs,
  limit: config.deviceIngestRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.ip ?? "unknown") as string,
  handler: () => {
    throw tooMany("Device ingest rate limit exceeded.");
  },
});
