import dotenv from "dotenv";

// Load a .env file in development. In production (Render) env vars are injected.
dotenv.config();

function required(name: string, fallback = ""): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    // Warn loudly — a missing secret in prod is a deployment problem.
    console.warn(`[config] Missing environment variable ${name} in production.`);
  }
  return value ?? fallback;
}

function number(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export const config = {
  port: number("PORT", 8080),
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
  frontendUrl: required("FRONTEND_URL", "http://localhost:5173"),
  allowedOrigins: required("ALLOWED_ORIGINS", ""),
  supabaseUrl: required("SUPABASE_URL"),
  supabaseAnonKey: required("SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  supabaseJwtSecret: required("SUPABASE_JWT_SECRET", ""),
  deviceTokenPepper: required("DEVICE_TOKEN_PEPPER", ""),
  deviceOnlineThresholdMinutes: number("DEVICE_ONLINE_THRESHOLD_MINUTES", 5),
  rateLimitWindowMs: number("RATE_LIMIT_WINDOW_MS", 60_000),
  rateLimitMax: number("RATE_LIMIT_MAX", 100),
  deviceIngestRateLimitMax: number("DEVICE_INGEST_RATE_LIMIT_MAX", 60),
};

/** Comma-separated list of allowed CORS origins. */
export function getAllowedOrigins(): string[] {
  const raw = config.allowedOrigins.trim();
  if (raw) return raw.split(",").map((o) => o.trim()).filter(Boolean);
  // Dev fallback: allow the configured frontend URL.
  return [config.frontendUrl];
}
