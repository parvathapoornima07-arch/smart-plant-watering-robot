import type { RequestHandler } from "express";
import { db, normalizePage, paginationMeta } from "../utils/db";
import { forbidden, notFound } from "../utils/errors";
import { mapEvent } from "../utils/mappers";
import type { AuthedRequest, DeviceEventRow, DeviceRow } from "../types";

export const listEvents: RequestHandler = async (req, res, next) => {
  try {
    const ar = req as AuthedRequest;
    const { deviceId } = req.params;
    const { data: device, error } = await db().from("devices").select("*").eq("device_id", deviceId).maybeSingle<DeviceRow>();
    if (error) throw error;
    if (!device) throw notFound("Device not found.");
    if (ar.user?.role !== "admin") throw forbidden("Not authorized to view this device's events.");

    const { p, ps, rangeFrom, rangeTo } = normalizePage(Number(req.query.page), Number(req.query.pageSize));
    const { data, error: qErr, count } = await db()
      .from("device_events")
      .select("*", { count: "exact" })
      .eq("device_id", device.id)
      .order("created_at", { ascending: false })
      .range(rangeFrom, rangeTo);
    if (qErr) return next(qErr);
    const rows = (data as DeviceEventRow[]) ?? [];
    res.json({ data: rows.map(mapEvent), ...paginationMeta(p, ps, count ?? 0) });
  } catch (err) {
    next(err);
  }
};
