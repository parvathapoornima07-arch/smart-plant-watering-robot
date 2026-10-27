/**
 * Centralised access to frontend environment variables.
 *
 * Only VITE_-prefixed variables are exposed to the browser by Vite.
 * Backend-only secrets must NEVER appear here — they would be visible to
 * anyone who inspects the bundle.
 */

function required(name: keyof ImportMetaEnv, fallback = ""): string {
  const value = import.meta.env[name];
  if (!value && import.meta.env.PROD) {
    // In production a missing public config is a misconfiguration worth surfacing.
    // We do not throw at import time (would break the whole app); callers handle it.
    console.warn(`[env] Missing ${String(name)} in production build.`);
  }
  return (value as string | undefined) ?? fallback;
}

export const env = {
  apiBaseUrl: required("VITE_API_BASE_URL"),
  supabaseUrl: required("VITE_SUPABASE_URL"),
  supabaseAnonKey: required("VITE_SUPABASE_ANON_KEY"),
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
};
