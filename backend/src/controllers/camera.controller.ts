import type { RequestHandler } from "express";
import { db, normalizePage, paginationMeta } from "../utils/db";
import { badRequest, forbidden, notFound, unprocessable } from "../utils/errors";
import { mapImage } from "../utils/mappers";
import { ingestImageSchema } from "../schemas/image.schema";
import type { AuthedRequest, DeviceRow, CameraImageRow } from "../types";

async function loadDeviceOr404(deviceId: string): Promise<DeviceRow> {
  const { data, error } = await db().from("devices").select("*").eq("device_id", deviceId).maybeSingle<DeviceRow>();
  if (error) throw error;
  if (!data) throw notFound("Device not found.");
  return data;
}

export const listImages: RequestHandler = async (req, res, next) => {
  try {
    const ar = req as AuthedRequest;
    const { deviceId } = req.params;
    const device = await loadDeviceOr404(deviceId);
    if (ar.user?.role !== "admin") throw forbidden("Not authorized to view this device's images.");

    const { p, ps, rangeFrom, rangeTo } = normalizePage(Number(req.query.page), Number(req.query.pageSize));
    const { data, error, count } = await db()
      .from("camera_images")
      .select("*", { count: "exact" })
      .eq("device_id", device.id)
      .order("received_at", { ascending: false })
      .range(rangeFrom, rangeTo);
    if (error) return next(error);
    const rows = (data as CameraImageRow[]) ?? [];
    res.json({ data: rows.map(mapImage), ...paginationMeta(p, ps, count ?? 0) });
  } catch (err) {
    next(err);
  }
};

export const getLatestImage: RequestHandler = async (req, res, next) => {
  try {
    const ar = req as AuthedRequest;
    const { deviceId } = req.params;
    const device = await loadDeviceOr404(deviceId);
    if (ar.user?.role !== "admin") throw forbidden("Not authorized to view this device's images.");

    const { data, error } = await db()
      .from("camera_images")
      .select("*")
      .eq("device_id", device.id)
      .order("received_at", { ascending: false })
      .limit(1)
      .maybeSingle<CameraImageRow>();
    if (error) return next(error);
    res.json(data ? mapImage(data) : null);
  } catch (err) {
    next(err);
  }
};

/**
 * Device-authenticated image metadata ingestion. The binary itself should be
 * uploaded to Supabase Storage (with the device's credentials or a presigned
 * path) and this endpoint records the metadata. We do NOT assume the camera
 * can upload directly to Supabase without that being implemented.
 */
export const ingestImage: RequestHandler = async (req, res, next) => {
  try {
    const ar = req as AuthedRequest;
    if (!ar.device) return next(badRequest("Device context missing."));
    const parsed = ingestImageSchema.safeParse(req.body);
    if (!parsed.success) return next(unprocessable("Invalid image metadata.", parsed.error.issues));

    const receivedAt = new Date().toISOString();
    const { data, error } = await db()
      .from("camera_images")
      .insert({
        device_id: ar.device.deviceIdInternal,
        storage_path: parsed.data.storage_path,
        public_url: parsed.data.public_url ?? null,
        captured_at: parsed.data.captured_at ?? null,
        received_at: receivedAt,
      })
      .select("*")
      .single<CameraImageRow>();
    if (error) return next(error);

    db().from("device_events").insert({
      device_id: ar.device.deviceIdInternal,
      event_type: "image",
      message: "Camera image received.",
      metadata: { source: "device", storage_path: parsed.data.storage_path },
    }).then(() => undefined, () => undefined);

    res.status(201).json(mapImage(data));
  } catch (err) {
    next(err);
  }
};
