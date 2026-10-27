import type { RequestHandler } from "express";
import { db } from "../utils/db";
import { badRequest, forbidden, notFound, unprocessable } from "../utils/errors";
import { mapCalibration } from "../utils/mappers";
import { calibrationSchema } from "../schemas/calibration.schema";
import type { AuthedRequest, DeviceRow, SensorCalibrationRow } from "../types";

async function loadDeviceOr404(deviceId: string): Promise<DeviceRow> {
  const { data, error } = await db().from("devices").select("*").eq("device_id", deviceId).maybeSingle<DeviceRow>();
  if (error) throw error;
  if (!data) throw notFound("Device not found.");
  return data;
}

export const getCalibration: RequestHandler = async (req, res, next) => {
  try {
    const ar = req as AuthedRequest;
    const { deviceId } = req.params;
    const device = await loadDeviceOr404(deviceId);
    if (ar.user?.role !== "admin") throw forbidden("Not authorized to view this device's calibration.");

    const { data, error } = await db()
      .from("sensor_calibrations")
      .select("*")
      .eq("device_id", device.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle<SensorCalibrationRow>();
    if (error) return next(error);
    res.json(data ? mapCalibration(data) : null);
  } catch (err) {
    next(err);
  }
};

export const saveCalibration: RequestHandler = async (req, res, next) => {
  try {
    const ar = req as AuthedRequest;
    if (!ar.user) return next(badRequest("Authentication required."));
    const { deviceId } = req.params;
    const device = await loadDeviceOr404(deviceId);
    if (ar.user.role !== "admin") throw forbidden("Only admins can set calibration.");

    const parsed = calibrationSchema.safeParse(req.body);
    if (!parsed.success) return next(unprocessable("Invalid calibration.", parsed.error.issues));

    // Upsert: one calibration row per device (use device_id + created_by unique
    // by upserting on the existing row if present).
    const { data: existing } = await db()
      .from("sensor_calibrations")
      .select("id")
      .eq("device_id", device.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      const { data, error } = await db()
        .from("sensor_calibrations")
        .update({
          dry_reference: parsed.data.dry_reference,
          wet_reference: parsed.data.wet_reference,
          watering_threshold: parsed.data.watering_threshold,
          manual_entry: parsed.data.manual_entry,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select("*")
        .single<SensorCalibrationRow>();
      if (error) return next(error);
      return res.json(mapCalibration(data));
    }

    const { data, error } = await db()
      .from("sensor_calibrations")
      .insert({
        device_id: device.id,
        dry_reference: parsed.data.dry_reference,
        wet_reference: parsed.data.wet_reference,
        watering_threshold: parsed.data.watering_threshold,
        manual_entry: parsed.data.manual_entry,
        created_by: ar.user.id,
      })
      .select("*")
      .single<SensorCalibrationRow>();
    if (error) return next(error);
    res.json(mapCalibration(data));
  } catch (err) {
    next(err);
  }
};
