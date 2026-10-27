import type { RequestHandler } from "express";
import { db } from "../utils/db";
import { badRequest, conflict, forbidden, notFound, unauthorized, unprocessable } from "../utils/errors";
import { generateDeviceToken, hashDeviceToken } from "../utils/deviceToken";
import { mapDevice } from "../utils/mappers";
import { registerDeviceSchema, updateDeviceSchema } from "../schemas/device.schema";
import type { AuthedRequest, DeviceRow } from "../types";

/**
 * Lists the devices a user is authorized to see. For admins, all devices.
 * For regular users, none for now (per-device grants are a future enhancement);
 * they still get the authenticated user profile via /api/profile.
 */
export const listDevices: RequestHandler = async (req, res, next) => {
  try {
    const ar = req as AuthedRequest;
    const { data, error } = await db().from("devices").select("*").order("created_at", { ascending: false });
    if (error) return next(error);
    // Non-admins currently have no device grants; return empty rather than all.
    const rows = (data as DeviceRow[]) ?? [];
    const visible = ar.user?.role === "admin" ? rows : [];
    res.json(visible.map(mapDevice));
  } catch (err) {
    next(err);
  }
};

export const getDevice: RequestHandler = async (req, res, next) => {
  try {
    const ar = req as AuthedRequest;
    const { deviceId } = req.params;
    const { data, error } = await db().from("devices").select("*").eq("device_id", deviceId).maybeSingle<DeviceRow>();
    if (error) return next(error);
    if (!data) return next(notFound("Device not found."));
    if (ar.user?.role !== "admin") return next(forbidden("Not authorized to view this device."));
    res.json(mapDevice(data));
  } catch (err) {
    next(err);
  }
};

/** Admin only — registers a device and returns its one-time token. */
export const createDevice: RequestHandler = async (req, res, next) => {
  try {
    const ar = req as AuthedRequest;
    if (!ar.user) return next(unauthorized());
    const parsed = registerDeviceSchema.safeParse(req.body);
    if (!parsed.success) return next(unprocessable("Invalid device registration.", parsed.error.issues));

    // Ensure device_id is unique.
    const { data: existing } = await db().from("devices").select("id").eq("device_id", parsed.data.deviceId).maybeSingle();
    if (existing) return next(conflict("A device with that device ID already exists."));

    const token = generateDeviceToken();
    const tokenHash = hashDeviceToken(token);

    const { data, error } = await db()
      .from("devices")
      .insert({
        device_id: parsed.data.deviceId,
        name: parsed.data.name,
        status: "unknown",
      })
      .select("*")
      .single<DeviceRow>();
    if (error || !data) return next(error ?? badRequest("Could not create device."));

    // Insert the credential (hashed, not revoked).
    const { error: credErr } = await db().from("device_credentials").insert({
      device_id: data.id,
      token_hash: tokenHash,
    });
    if (credErr) return next(credErr);

    // Record an admin event.
    await db().from("device_events").insert({
      device_id: data.id,
      event_type: "device_registered",
      message: `Device ${parsed.data.deviceId} registered.`,
      metadata: { by: ar.user.id },
    });

    res.status(201).json({ device: mapDevice(data), token });
  } catch (err) {
    next(err);
  }
};

export const updateDevice: RequestHandler = async (req, res, next) => {
  try {
    const ar = req as AuthedRequest;
    if (ar.user?.role !== "admin") return next(forbidden("Admin access required."));
    const { deviceId } = req.params;
    const parsed = updateDeviceSchema.safeParse(req.body);
    if (!parsed.success) return next(unprocessable("Invalid update.", parsed.error.issues));

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (parsed.data.name !== undefined) patch.name = parsed.data.name;
    if (parsed.data.status !== undefined) patch.status = parsed.data.status;

    const { data, error } = await db()
      .from("devices")
      .update(patch)
      .eq("device_id", deviceId)
      .select("*")
      .maybeSingle<DeviceRow>();
    if (error) return next(error);
    if (!data) return next(notFound("Device not found."));
    res.json(mapDevice(data));
  } catch (err) {
    next(err);
  }
};

/** Admin only — revokes all active credentials for a device. */
export const revokeDevice: RequestHandler = async (req, res, next) => {
  try {
    const ar = req as AuthedRequest;
    if (ar.user?.role !== "admin") return next(forbidden("Admin access required."));
    const { deviceId } = req.params;

    const { data: device } = await db().from("devices").select("id, status").eq("device_id", deviceId).maybeSingle<DeviceRow>();
    if (!device) return next(notFound("Device not found."));

    const now = new Date().toISOString();
    await db().from("device_credentials").update({ revoked_at: now }).eq("device_id", device.id).is("revoked_at", null);
    await db().from("devices").update({ status: "revoked", updated_at: now }).eq("id", device.id);
    await db().from("device_events").insert({
      device_id: device.id,
      event_type: "device_revoked",
      message: `Device ${deviceId} revoked.`,
      metadata: { by: ar.user?.id },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

/** Admin only — rotates the device token: revokes old creds, issues a new one. */
export const rotateDeviceToken: RequestHandler = async (req, res, next) => {
  try {
    const ar = req as AuthedRequest;
    if (ar.user?.role !== "admin") return next(forbidden("Admin access required."));
    const { deviceId } = req.params;

    const { data: device } = await db().from("devices").select("id").eq("device_id", deviceId).maybeSingle<DeviceRow>();
    if (!device) return next(notFound("Device not found."));

    const token = generateDeviceToken();
    const { error } = await db().from("device_credentials").insert({
      device_id: device.id,
      token_hash: hashDeviceToken(token),
    });
    if (error) return next(error);

    // Revoke all prior credentials.
    await db().from("device_credentials").update({ revoked_at: new Date().toISOString() }).neq("token_hash", hashDeviceToken(token)).eq("device_id", device.id).is("revoked_at", null);

    await db().from("device_events").insert({
      device_id: device.id,
      event_type: "token_rotated",
      message: `Token rotated for device ${deviceId}.`,
      metadata: { by: ar.user?.id },
    });

    res.json({ token });
  } catch (err) {
    next(err);
  }
};
