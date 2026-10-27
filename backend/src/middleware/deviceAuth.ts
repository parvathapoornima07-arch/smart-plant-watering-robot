import type { RequestHandler } from "express";
import { db } from "../utils/db";
import { badRequest, unauthorized, forbidden } from "../utils/errors";
import { hashDeviceToken, verifyDeviceToken } from "../utils/deviceToken";
import { config } from "../config/env";
import { isOnline } from "../utils/time";
import type { AuthedRequest, DeviceCredentialRow, DeviceRow } from "../types";

/**
 * Device authentication for ingestion endpoints.
 *
 * The request carries:
 *   - device_id in the JSON body (or `X-Device-Id` header for GETs), and
 *   - a device token in the `X-Device-Token` header.
 *
 * We look up the device, find a non-revoked credential row whose HMAC digest
 * matches the provided token (constant-time), and attach the device to the
 * request. Revoked credentials are rejected. Unknown devices are rejected.
 *
 * We deliberately do NOT log the token value.
 */
export const requireDevice: RequestHandler = async (req, _res, next) => {
  try {
    const ar = req as AuthedRequest;
    const deviceIdHeader = ar.headers["x-device-id"];
    const deviceId = (ar.body?.device_id ?? (Array.isArray(deviceIdHeader) ? deviceIdHeader[0] : deviceIdHeader)) as
      | string
      | undefined;
    const token = ar.headers["x-device-token"] as string | undefined;

    if (!deviceId || typeof deviceId !== "string") {
      return next(badRequest("device_id is required."));
    }
    if (!token || typeof token !== "string") {
      return next(unauthorized("Device token missing."));
    }

    // Look up the device by its public device_id.
    const { data: device, error: devErr } = await db()
      .from("devices")
      .select("*")
      .eq("device_id", deviceId)
      .maybeSingle<DeviceRow>();

    if (devErr || !device) return next(unauthorized("Unknown device."));
    if (device.status === "revoked") return next(forbidden("Device is revoked."));

    // Fetch non-revoked credential rows for this device and compare hashes.
    const { data: creds, error: credErr } = await db()
      .from("device_credentials")
      .select("*")
      .eq("device_id", device.id)
      .is("revoked_at", null);

    if (credErr || !creds || creds.length === 0) {
      return next(unauthorized("No active credentials for this device."));
    }

    let matched: DeviceCredentialRow | null = null;
    const incomingHash = hashDeviceToken(token);
    for (const cred of creds as DeviceCredentialRow[]) {
      if (verifyDeviceToken(token, cred.token_hash) || cred.token_hash === incomingHash) {
        matched = cred;
        break;
      }
    }
    if (!matched) return next(unauthorized("Invalid device token."));

    // Update last_seen_at as a heartbeat (fire and forget; swallow errors).
    const online = isOnline(device.last_seen_at, config.deviceOnlineThresholdMinutes);
    const newStatus = online ? "online" : device.status === "revoked" ? "revoked" : "online";
    db()
      .from("devices")
      .update({ last_seen_at: new Date().toISOString(), status: newStatus })
      .eq("id", device.id)
      .then(() => undefined, () => undefined);

    ar.device = { deviceId: device.device_id, deviceIdInternal: device.id };
    next();
  } catch (err) {
    next(err);
  }
};
