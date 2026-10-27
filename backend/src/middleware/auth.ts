import type { RequestHandler } from "express";
import { getAnonClient, isSupabaseConfigured } from "../config/supabase";
import { db } from "../utils/db";
import { unauthorized } from "../utils/errors";
import type { AuthedRequest, AuthUser } from "../types";

function extractBearer(req: AuthedRequest): string | null {
  const header = req.headers.authorization;
  if (!header || !header.toLowerCase().startsWith("bearer ")) return null;
  const token = header.slice(7).trim();
  return token || null;
}

/**
 * Verifies a Supabase-issued access token. We use the Supabase client's
 * auth.getUser(token), which validates the token server-side (the recommended
 * approach). We do NOT rely on a shared JWT secret assumption.
 *
 * After verifying identity, we look up the server-assigned role from the
 * user_roles table via the service-role client. Roles are NEVER settable by
 * clients.
 */
export const requireUser: RequestHandler = async (req, _res, next) => {
  try {
    const ar = req as AuthedRequest;
    if (!isSupabaseConfigured()) return next(unauthorized("Authentication is not configured."));

    const token = extractBearer(ar);
    if (!token) return next(unauthorized("Missing bearer token."));

    const { data, error } = await getAnonClient().auth.getUser(token);
    if (error || !data.user) return next(unauthorized("Invalid or expired token."));

    // Load role from the DB (service-role client). Default to "user".
    let role: "user" | "admin" = "user";
    try {
      const { data: roleRow } = await db()
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (roleRow && roleRow.role === "admin") role = "admin";
    } catch {
      // Role table missing in some test setups — treat as regular user.
    }

    ar.user = { id: data.user.id, email: data.user.email ?? null, role } satisfies AuthUser;
    next();
  } catch (err) {
    next(err);
  }
};
