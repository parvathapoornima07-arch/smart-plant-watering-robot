import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/errors";
import { log } from "../utils/logger";

/**
 * Centralised error handler. Always returns a consistent JSON shape:
 * { message, code?, details? }
 *
 * Secrets are never logged: HttpError messages are developer-controlled, and
 * Zod issues describe schema shape, not values (mostly). We additionally avoid
 * logging request bodies here.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    if (err.statusCode >= 500) {
      log.error("HttpError 5xx", { code: err.code, statusCode: err.statusCode });
    }
    return res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
      details: err.details,
    });
  }

  if (err instanceof ZodError) {
    return res.status(422).json({
      message: "Validation failed.",
      code: "VALIDATION_ERROR",
      details: err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }

  // Unknown error — never leak raw stack/internal messages to the client.
  log.error("Unhandled error", { name: err.name, message: err.message });
  return res.status(500).json({
    message: "Internal server error.",
    code: "INTERNAL_ERROR",
  });
};
