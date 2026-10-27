import type { RequestHandler } from "express";
import { db, normalizePage, paginationMeta } from "../utils/db";
import { badRequest, conflict, forbidden, notFound, unauthorized, unprocessable } from "../utils/errors";
import { mapCommand } from "../utils/mappers";
import { createCommandSchema, ackCommandSchema } from "../schemas/command.schema";
import type { AuthedRequest, DeviceRow, WateringCommandRow } from "../types";

const COMMAND_TTL_MINUTES = 5;

async function loadDeviceOr404(deviceId: string): Promise<DeviceRow> {
  const { data, error } = await db().from("devices").select("*").eq("device_id", deviceId).maybeSingle<DeviceRow>();
  if (error) throw error;
  if (!data) throw notFound("Device not found.");
  return data;
}

/** Expire stale pending/acknowledged commands past their expires_at. */
async function expireStaleCommands(): Promise<void> {
  const now = new Date().toISOString();
  await db()
    .from("watering_commands")
    .update({ status: "expired" })
    .in("status", ["pending", "acknowledged"])
    .lt("expires_at", now)
    .then(() => undefined, () => undefined);
}

export const listCommands: RequestHandler = async (req, res, next) => {
  try {
    const ar = req as AuthedRequest;
    const { deviceId } = req.params;
    const device = await loadDeviceOr404(deviceId);
    if (ar.user?.role !== "admin") throw forbidden("Not authorized to view this device's commands.");

    await expireStaleCommands();
    const { p, ps, rangeFrom, rangeTo } = normalizePage(Number(req.query.page), Number(req.query.pageSize));
    const { data, error, count } = await db()
      .from("watering_commands")
      .select("*", { count: "exact" })
      .eq("device_id", device.id)
      .order("requested_at", { ascending: false })
      .range(rangeFrom, rangeTo);
    if (error) return next(error);
    const rows = (data as WateringCommandRow[]) ?? [];
    res.json({ data: rows.map(mapCommand), ...paginationMeta(p, ps, count ?? 0) });
  } catch (err) {
    next(err);
  }
};

export const createCommand: RequestHandler = async (req, res, next) => {
  try {
    const ar = req as AuthedRequest;
    if (!ar.user) return next(unauthorized());
    // Check authorization BEFORE the device lookup so non-admins cannot learn
    // whether a given device exists.
    if (ar.user.role !== "admin") throw forbidden("Only admins can issue watering commands.");
    const { deviceId } = req.params;
    const device = await loadDeviceOr404(deviceId);

    const parsed = createCommandSchema.safeParse(req.body);
    if (!parsed.success) return next(unprocessable("Invalid command.", parsed.error.issues));

    await expireStaleCommands();

    // Duplicate prevention: reject a new manual_water while one is pending.
    if (parsed.data.command_type === "manual_water") {
      const { data: pending } = await db()
        .from("watering_commands")
        .select("id")
        .eq("device_id", device.id)
        .in("status", ["pending", "acknowledged"])
        .limit(1);
      if (pending && pending.length > 0) {
        return next(conflict("A watering command is already pending for this device."));
      }
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + COMMAND_TTL_MINUTES * 60_000);
    const { data, error } = await db()
      .from("watering_commands")
      .insert({
        device_id: device.id,
        requested_by: ar.user.id,
        command_type: parsed.data.command_type,
        status: "pending",
        duration_seconds: parsed.data.duration_seconds ?? null,
        requested_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .select("*")
      .single<WateringCommandRow>();
    if (error) return next(error);

    // Record an event for the command (best effort).
    db().from("device_events").insert({
      device_id: device.id,
      event_type: "command_requested",
      message: `Command '${parsed.data.command_type}' requested.`,
      metadata: { by: ar.user.id, command_id: data.id },
    }).then(() => undefined, () => undefined);

    res.status(201).json(mapCommand(data));
  } catch (err) {
    next(err);
  }
};

/** Device-authenticated acknowledgement. */
export const ackCommand: RequestHandler = async (req, res, next) => {
  try {
    const ar = req as AuthedRequest;
    if (!ar.device) return next(badRequest("Device context missing."));
    const { commandId } = req.params;

    const parsed = ackCommandSchema.safeParse(req.body ?? {});
    if (!parsed.success) return next(unprocessable("Invalid acknowledgement.", parsed.error.issues));

    const { data: cmd, error } = await db()
      .from("watering_commands")
      .select("*")
      .eq("id", commandId)
      .maybeSingle<WateringCommandRow>();
    if (error) return next(error);
    if (!cmd) return next(notFound("Command not found."));

    // Only the device that owns the command may acknowledge it.
    if (cmd.device_id !== ar.device.deviceIdInternal) {
      return next(forbidden("This command does not belong to your device."));
    }

    // Reject if already completed/expired/failed.
    if (cmd.status === "completed" || cmd.status === "expired" || cmd.status === "failed") {
      return next(unprocessable(`Command already ${cmd.status}.`));
    }
    // Reject if past expiry.
    if (new Date(cmd.expires_at).getTime() < Date.now()) {
      await db().from("watering_commands").update({ status: "expired" }).eq("id", cmd.id);
      return next(unprocessable("Command has expired."));
    }

    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { status: parsed.data.status };
    if (parsed.data.status === "acknowledged") patch.acknowledged_at = now;
    if (parsed.data.status === "completed") {
      patch.acknowledged_at = patch.acknowledged_at ?? cmd.acknowledged_at ?? now;
      patch.completed_at = now;
    }
    const { data, error: updErr } = await db().from("watering_commands").update(patch).eq("id", cmd.id).select("*").single<WateringCommandRow>();
    if (updErr) return next(updErr);

    db().from("device_events").insert({
      device_id: cmd.device_id,
      event_type: "command_ack",
      message: `Command '${cmd.command_type}' ${parsed.data.status}.`,
      metadata: { command_id: cmd.id, message: parsed.data.message ?? null },
    }).then(() => undefined, () => undefined);

    res.json(mapCommand(data));
  } catch (err) {
    next(err);
  }
};
