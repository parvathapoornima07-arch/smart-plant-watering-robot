import { vi } from "vitest";
import { setSupabaseClientOverrides } from "../config/supabase";
import { createQueryBuilder, type QueryBuilder } from "./queryMock";

/**
 * Installs fake Supabase clients for testing:
 *  - admin: a fake client whose `.from()` returns a shared chainable builder.
 *  - anon: a fake client whose `auth.getUser(token)` returns the provided user
 *    (or an error).
 *
 * Tests configure query results via `builder.enqueue(...)` and auth via the
 * `authUser` option. The auth middleware verifies identity via the anon client
 * and reads the role from user_roles via the admin builder.
 */

export interface MockAuthUser {
  id: string;
  email?: string | null;
}

export interface MockClients {
  builder: QueryBuilder;
  /** Controls what `auth.getUser(token)` resolves to. */
  setUser(user: MockAuthUser | null, error?: unknown): void;
  clear(): void;
}

export function installMocks(opts: { authUser?: MockAuthUser | null; authError?: unknown } = {}): MockClients {
  const builder = createQueryBuilder();

  let currentUser: MockAuthUser | null = opts.authUser ?? null;
  let currentError: unknown = opts.authError ?? undefined;

  const anonClient = {
    auth: {
      getUser: vi.fn(async (_token: string) => {
        if (currentError) return { data: { user: null }, error: currentError };
        return { data: { user: currentUser ? { id: currentUser.id, email: currentUser.email ?? null } : null }, error: null };
      }),
    },
  };

  const adminClient = {
    from: () => builder,
  };

  setSupabaseClientOverrides({
    anon: anonClient as unknown as import("@supabase/supabase-js").SupabaseClient,
    admin: adminClient as unknown as import("@supabase/supabase-js").SupabaseClient,
  });

  return {
    builder,
    setUser: (user, error) => {
      currentUser = user;
      currentError = error;
    },
    clear: () => {
      builder.reset();
      currentUser = null;
      currentError = undefined;
      setSupabaseClientOverrides(null);
    },
  };
}

/** Helper to make a valid Authorization header value for a test user. */
export function bearer(token = "test-token"): string {
  return `Bearer ${token}`;
}
