import type { Request } from "express";

/** Row shapes mirrored from the Supabase migrations. Snake_case from Postgres. */
export interface DeviceRow {
  id: string;
  device_id: string;
  name: string;
  status: string;
  last_seen_at: string | null;
  firmware_version: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeviceCredentialRow {
  id: string;
  device_id: string;
  token_hash: string;
  revoked_at: string | null;
  created_at: string;
}

export interface SensorReadingRow {
  id: string;
  device_id: string;
  raw_moisture_value: number;
  moisture_percentage: number | null;
  pump_state: boolean | null;
  motor_state: boolean | null;
  device_timestamp: string | null;
  received_at: string;
}

export interface SensorCalibrationRow {
  id: string;
  device_id: string;
  dry_reference: number;
  wet_reference: number;
  watering_threshold: number;
  manual_entry: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceEventRow {
  id: string;
  device_id: string;
  event_type: string;
  message: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface WateringCommandRow {
  id: string;
  device_id: string;
  requested_by: string;
  command_type: string;
  status: string;
  duration_seconds: number | null;
  requested_at: string;
  acknowledged_at: string | null;
  completed_at: string | null;
  expires_at: string;
}

export interface CameraImageRow {
  id: string;
  device_id: string;
  storage_path: string;
  public_url: string | null;
  captured_at: string | null;
  received_at: string;
}

export interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

/** The authenticated user attached to a request after token verification. */
export interface AuthUser {
  id: string;
  email: string | null;
  role: "user" | "admin";
}

export interface AuthedRequest extends Request {
  user?: AuthUser;
  device?: {
    deviceId: string;
    deviceIdInternal: string; // devices.id (uuid)
  };
}

/** Paginated response envelope used across list endpoints. */
export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}
