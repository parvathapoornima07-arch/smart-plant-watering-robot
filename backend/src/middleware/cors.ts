import cors, { type CorsOptions } from "cors";
import { getAllowedOrigins } from "../config/env";
import { log } from "../utils/logger";

/**
 * CORS configuration. Only explicitly configured origins are allowed. In
 * production ALLOWED_ORIGINS must contain the deployed Netlify domain(s).
 * Unrestricted CORS is never used.
 */
export function corsOptions(): CorsOptions {
  const allowed = getAllowedOrigins();
  log.info("CORS allowed origins", { origins: allowed });
  return {
    origin: (origin, callback) => {
      // Allow same-origin/no-origin requests (server-to-server, curl, tests).
      if (!origin) return callback(null, true);
      if (allowed.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Device-Token"],
  };
}

export const corsMiddleware = cors(corsOptions());
