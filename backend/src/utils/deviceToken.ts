import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { config } from "../config/env";

/**
 * Device token utilities.
 *
 * Device tokens are long-lived, high-entropy credentials issued once at device
 * registration or rotation. We store only an HMAC-SHA256 digest, keyed by a
 * server-side pepper (DEVICE_TOKEN_PEPPER). The plaintext token is shown to
 * the operator exactly once and never stored.
 *
 * - Deterministic: the same token always hashes to the same digest, so we can
 *   compare an incoming token against stored digests.
 * - Non-reversible: the digest cannot be turned back into the token.
 * - Peppered: a database leak alone is not enough to forge tokens.
 *
 * Note: for password-style secrets you'd use a salted slow hash (scrypt/argon2).
 * For high-entropy tokens a peppered HMAC is appropriate and lets us compare
 * in constant time.
 */

/** Generate a new random device token (URL-safe base64). */
export function generateDeviceToken(): string {
  return randomBytes(32).toString("base64url");
}

function getPepper(): string {
  // In test/dev without a configured pepper we fall back to a fixed string so
  // verification still works within a single process. Production MUST set
  // DEVICE_TOKEN_PEPPER.
  return config.deviceTokenPepper || "dev-pepper-do-not-use-in-prod";
}

/** HMAC-SHA256(token, pepper) as hex. */
export function hashDeviceToken(token: string): string {
  if (!token) throw new Error("Token must not be empty.");
  return createHmac("sha256", getPepper()).update(token).digest("hex");
}

/** Constant-time comparison of two hex digests. */
export function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

/** True if the incoming token matches the stored digest. */
export function verifyDeviceToken(token: string, storedHash: string): boolean {
  if (!token || !storedHash) return false;
  return safeEqualHex(hashDeviceToken(token), storedHash);
}
