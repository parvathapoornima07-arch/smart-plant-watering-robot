import type { RequestHandler } from "express";
import { db, normalizePage, paginationMeta } from "../utils/db";
import { badRequest, forbidden, notFound, unprocessable } from "../utils/errors";
import { mapReading } from "../utils/mappers";
import { ingestReadingSchema } from "../schemas/reading.schema";
import { computeMoisturePercentage } from "../utils/moisture";
import { config } from "../config/env";
import { isOnline } from "../utils/time";
import type { AuthedRequest, DeviceRow, SensorReadingRow, SensorCalibrationRow } from "../types";

async function loadDeviceAndAuthorize(req: AuthedRequest, deviceId: string) {
  const { data: device, error } = await db().from("devices").select("*").eq("device_id", deviceId).maybeSingle<DeviceRow>();
  if (error) throw error;
  if (!device) throw notFound("Device not found.");
  // For now only admins can read raw readings; users see the dashboard via the
  // same endpoint gated by role. This can be relaxed per-device grants later.
  if (req.user?.role !== "admin") throw forbidden("Not authorized to view this device's readings.");
  return device;
}

export const listReadings: RequestHandler = async (req, res, next) => {
  try {
    const ar = req as AuthedRequest;
    const { deviceId } = req.params;
    await loadDeviceAndAuthorize(ar, deviceId);

    const { p, ps, rangeFrom, rangeTo } = normalizePage(Number(req.query.page), Number(req.query.pageSize));
    let query = db().from("sensor_readings").select("*", { count: "exact" }).eq("device_id", deviceId);
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    if (from) query = query.gte("received_at", from);
    if (to) query = query.lte("received_at", to);
    query = query.order("received_at", { ascending: false }).range(rangeFrom, rangeTo);

    const { data, error, count } = await query;
    if (error) return next(error);
    const rows = (data as SensorReadingRow[]) ?? [];
    res.json({
      data: rows.map(mapReading),
      ...paginationMeta(p, ps, count ?? 0),
    });
  } catch (err) {
    next(err);
  }
};

export const getLatestReading: RequestHandler = async (req, res, next) => {
  try {
    const ar = req as AuthedRequest;
    const { deviceId } = req.params;
    await loadDeviceAndAuthorize(ar, deviceId);

    const { data, error } = await db()
      .from("sensor_readings")
      .select("*")
      .eq("device_id", deviceId)
      .order("received_at", { ascending: false })
      .limit(1)
      .maybeSingle<SensorReadingRow>();
    if (error) return next(error);
    res.json(data ? mapReading(data) : null);
  } catch (err) {
    next(err);
  }
};

/** Device-authenticated ingestion. */
export const ingestReading: RequestHandler = async (req, res, next) => {
  try {
    const ar = req as AuthedRequest;
    if (!ar.device) return next(badRequest("Device context missing."));
    const parsed = ingestReadingSchema.safeParse(req.body);
    if (!parsed.success) return next(unprocessable("Invalid reading payload.", parsed.error.issues));

    const input = parsed.data;
    // Recompute the moisture percentage server-side from calibration, ignoring
    // the device-supplied value, so the stored percentage is trustworthy.
    let moisturePercentage: number | null = input.moisture_percentage ?? null;
    const { data: cal } = await db()
      .from("sensor_calibrations")
      .select("*")
      .eq("device_id", ar.device.deviceIdInternal)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle<SensorCalibrationRow>();
    if (cal) {
      const result = computeMoisturePercentage(input.raw_moisture_value, {
        dryReference: cal.dry_reference,
        wetReference: cal.wet_reference,
      });
      moisturePercentage = result.valid ? result.percentage : null;
    }

    const receivedAt = new Date().toISOString();
    const row = {
      device_id: ar.device.deviceIdInternal,
      raw_moisture_value: input.raw_moisture_value,
      moisture_percentage: moisturePercentage,
      pump_state: input.pump_state ?? null,
      motor_state: input.motor_state ?? null,
      device_timestamp: input.device_timestamp ?? null,
      received_at: receivedAt,
    };

    const { data, error } = await db().from("sensor_readings").insert(row).select("*").single<SensorReadingRow>();
    if (error) return next(error);

    // Update device status/last_seen + log an event (best effort).
    db().from("devices").update({ last_seen_at: receivedAt, status: "online", updated_at: receivedAt }).eq("id", ar.device.deviceIdInternal).then(() => undefined, () => undefined);
    db().from("device_events").insert({
      device_id: ar.device.deviceIdInternal,
      event_type: "reading",
      message: `Reading received: ADC ${input.raw_moisture_value}${moisturePercentage !== null ? `, ${moisturePercentage}%` : ""}.`,
      metadata: { source: "device" },
    }).then(() => undefined, () => undefined);

    res.status(201).json(mapReading(data));
  } catch (err) {
    next(err);
  }
};

// Re-export for the heartbeat convenience endpoint.
export const heartbeat: RequestHandler = async (req, res, next) => {
  try {
    const ar = req as AuthedRequest;
    if (!ar.device) return next(badRequest("Device context missing."));
    const now = new Date().toISOString();
    await db().from("devices").update({ last_seen_at: now, status: "online", updated_at: now }).eq("id", ar.device.deviceIdInternal);
    await db().from("device_events").insert({
      device_id: ar.device.deviceIdInternal,
      event_type: "heartbeat",
      message: "Heartbeat received.",
      metadata: { source: "device" },
    });
    res.json({ ok: true, received_at: now, threshold_minutes: config.deviceOnlineThresholdMinutes, isOnline: isOnline(now, config.deviceOnlineThresholdMinutes) });
  } catch (err) {
    next(err);
  }
};
