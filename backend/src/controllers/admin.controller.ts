import type { RequestHandler } from "express";
import { db, normalizePage, paginationMeta } from "../utils/db";
import { mapDevice, mapEvent, mapContactMessage } from "../utils/mappers";
import type { DeviceEventRow, DeviceRow, ContactMessageRow } from "../types";
import { config } from "../config/env";
import { isOnline } from "../utils/time";

export const getOverview: RequestHandler = async (_req, res, next) => {
  try {
    const [devs, readings, cmds, messages] = await Promise.all([
      db().from("devices").select("id, status, last_seen_at"),
      db().from("sensor_readings").select("id, received_at", { count: "exact" }),
      db().from("watering_commands").select("id, status", { count: "exact" }),
      db().from("contact_messages").select("id", { count: "exact" }),
    ]);

    const devices = (devs.data ?? []) as Pick<DeviceRow, "id" | "status" | "last_seen_at">[];
    let online = 0;
    let offline = 0;
    for (const d of devices) {
      if (isOnline(d.last_seen_at, config.deviceOnlineThresholdMinutes)) online++;
      else offline++;
    }

    const readingsRows = (readings.data ?? []) as { received_at: string }[];
    const dayAgo = Date.now() - 24 * 60 * 60_000;
    const last24h = readingsRows.filter((r) => new Date(r.received_at).getTime() >= dayAgo).length;

    const commands = (cmds.data ?? []) as { status: string }[];
    const pending = commands.filter((c) => c.status === "pending" || c.status === "acknowledged").length;

    res.json({
      devices: { total: devices.length, online, offline },
      readings: { total: readings.count ?? 0, last24h },
      commands: { total: cmds.count ?? 0, pending },
      contactMessages: messages.count ?? 0,
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminDevices: RequestHandler = async (_req, res, next) => {
  try {
    const { data, error } = await db().from("devices").select("*").order("created_at", { ascending: false });
    if (error) return next(error);
    res.json(((data as DeviceRow[]) ?? []).map(mapDevice));
  } catch (err) {
    next(err);
  }
};

export const getAdminEvents: RequestHandler = async (req, res, next) => {
  try {
    const { p, ps, rangeFrom, rangeTo } = normalizePage(Number(req.query.page), Number(req.query.pageSize));
    const { data, error, count } = await db()
      .from("device_events")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(rangeFrom, rangeTo);
    if (error) return next(error);
    const rows = (data as DeviceEventRow[]) ?? [];
    res.json({ data: rows.map(mapEvent), ...paginationMeta(p, ps, count ?? 0) });
  } catch (err) {
    next(err);
  }
};

export const getAdminContactMessages: RequestHandler = async (_req, res, next) => {
  try {
    const { data, error } = await db().from("contact_messages").select("*").order("created_at", { ascending: false });
    if (error) return next(error);
    res.json(((data as ContactMessageRow[]) ?? []).map(mapContactMessage));
  } catch (err) {
    next(err);
  }
};
