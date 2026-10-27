import type {
  DeviceRow,
  SensorReadingRow,
  SensorCalibrationRow,
  DeviceEventRow,
  CameraImageRow,
  WateringCommandRow,
  ContactMessageRow,
} from "../types";

/** DB rows are snake_case; API responses are camelCase. These map between them. */

export const mapDevice = (d: DeviceRow) => ({
  id: d.id,
  deviceId: d.device_id,
  name: d.name,
  status: d.status as "online" | "offline" | "unknown" | "revoked",
  lastSeenAt: d.last_seen_at,
  firmwareVersion: d.firmware_version,
  createdAt: d.created_at,
  updatedAt: d.updated_at,
});

export const mapReading = (r: SensorReadingRow) => ({
  id: r.id,
  deviceId: r.device_id,
  rawMoistureValue: r.raw_moisture_value,
  moisturePercentage: r.moisture_percentage,
  pumpState: r.pump_state,
  motorState: r.motor_state,
  deviceTimestamp: r.device_timestamp,
  receivedAt: r.received_at,
});

export const mapCalibration = (c: SensorCalibrationRow) => ({
  id: c.id,
  deviceId: c.device_id,
  dryReference: c.dry_reference,
  wetReference: c.wet_reference,
  wateringThreshold: c.watering_threshold,
  manualEntry: c.manual_entry,
  createdBy: c.created_by,
  createdAt: c.created_at,
  updatedAt: c.updated_at,
});

export const mapEvent = (e: DeviceEventRow) => ({
  id: e.id,
  deviceId: e.device_id,
  eventType: e.event_type,
  message: e.message,
  metadata: e.metadata,
  createdAt: e.created_at,
});

export const mapImage = (i: CameraImageRow) => ({
  id: i.id,
  deviceId: i.device_id,
  storagePath: i.storage_path,
  publicUrl: i.public_url,
  capturedAt: i.captured_at,
  receivedAt: i.received_at,
});

export const mapCommand = (c: WateringCommandRow) => ({
  id: c.id,
  deviceId: c.device_id,
  requestedBy: c.requested_by,
  commandType: c.command_type as "manual_water" | "auto_water_on" | "auto_water_off",
  status: c.status as "pending" | "acknowledged" | "completed" | "expired" | "failed",
  durationSeconds: c.duration_seconds,
  requestedAt: c.requested_at,
  acknowledgedAt: c.acknowledged_at,
  completedAt: c.completed_at,
  expiresAt: c.expires_at,
});

export const mapContactMessage = (m: ContactMessageRow) => ({
  id: m.id,
  name: m.name,
  email: m.email,
  subject: m.subject,
  message: m.message,
  createdAt: m.created_at,
});
