import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "./env";

/**
 * Two Supabase clients:
 *
 * - anonClient: uses the public anon key. Used to VERIFY user access tokens via
 *   supabase.auth.getUser(token). It bypasses nothing — RLS still applies.
 *
 * - adminClient: uses the SERVICE ROLE key. Server-only. Used for privileged
 *   DB operations the backend authorizes in code (creating devices, reading
 *   admin overviews, ingesting device data, etc.). NEVER expose this key to
 *   the frontend or embed it in firmware.
 *
 * If the service-role key is not configured (e.g. some test scenarios), we
 * return null and callers surface a clear error rather than silently degrading.
 */

let anonClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

// Test/runtime injection seam. When set, db() and auth verification use these
// clients instead of constructing real Supabase clients. Production leaves
// these null so real credentials are used.
let overrides: { anon?: SupabaseClient; admin?: SupabaseClient } | null = null;

export function setSupabaseClientOverrides(next: { anon?: SupabaseClient; admin?: SupabaseClient } | null) {
  overrides = next;
}

export function getAnonClient(): SupabaseClient {
  if (overrides?.anon) return overrides.anon;
  if (anonClient) return anonClient;
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error("Supabase URL / anon key not configured.");
  }
  anonClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return anonClient;
}

export function getAdminClient(): SupabaseClient {
  if (overrides?.admin) return overrides.admin;
  if (adminClient) return adminClient;
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    throw new Error("Supabase URL / service role key not configured.");
  }
  adminClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}

/** Whether the backend has the credentials it needs for authed requests. */
export function isSupabaseConfigured(): boolean {
  if (overrides) return true;
  return Boolean(config.supabaseUrl && config.supabaseAnonKey);
}
