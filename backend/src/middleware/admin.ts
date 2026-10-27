import type { RequestHandler } from "express";
import { forbidden, unauthorized } from "../utils/errors";
import type { AuthedRequest } from "../types";

/**
 * Requires an authenticated user with an admin role. Backend-enforced — not
 * just hidden UI. Must be used after requireUser.
 */
export const requireAdmin: RequestHandler = (req, _res, next) => {
  const ar = req as AuthedRequest;
  if (!ar.user) return next(unauthorized());
  if (ar.user.role !== "admin") return next(forbidden("Admin access required."));
  next();
};
