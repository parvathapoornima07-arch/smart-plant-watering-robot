import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

/**
 * Frontend Supabase client.
 *
 * Uses ONLY the public anon key. The anon key is safe for the browser but is
 * NOT an authorization bypass — access is governed by RLS policies. The
 * service-role key is server-only and must never appear in this bundle.
 *
 * If the env vars are not configured (e.g. before the operator has set them up),
 * we return null and the app surfaces a clear configuration message rather than
 * crashing. Auth-dependent features degrade gracefully.
 */
let client: SupabaseClient | null = null;
let initialized = false;

export function getSupabase(): SupabaseClient | null {
  if (initialized) return client;
  initialized = true;

  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    console.warn(
      "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not configured. Auth features will be unavailable."
    );
    return null;
  }

  client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return client;
}

export const supabase = getSupabase();
