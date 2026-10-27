/**
 * Shared types between frontend and backend API contracts.
 * Keep these in sync with backend/src/types and the Zod schemas.
 */

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface Device {
  id: string;
  deviceId: string;
  name: string;
  status: "online" | "offline" | "unknown";
  lastSeenAt: string | null;
  firmwareVersion: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SensorReading {
  id: string;
  deviceId: string;
  rawMoistureValue: number;
  moisturePercentage: number | null;
  pumpState: boolean | null;
  motorState: boolean | null;
  deviceTimestamp: string | null;
  receivedAt: string;
}

export interface SensorCalibration {
  id: string;
  deviceId: string;
  dryReference: number;
  wetReference: number;
  wateringThreshold: number;
  manualEntry: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceEvent {
  id: string;
  deviceId: string;
  eventType: string;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface CameraImage {
  id: string;
  deviceId: string;
  storagePath: string;
  publicUrl: string | null;
  capturedAt: string | null;
  receivedAt: string;
}

export type WateringCommandType = "manual_water" | "auto_water_on" | "auto_water_off";
export type WateringCommandStatus =
  | "pending"
  | "acknowledged"
  | "completed"
  | "expired"
  | "failed";

export interface WateringCommand {
  id: string;
  deviceId: string;
  requestedBy: string;
  commandType: WateringCommandType;
  status: WateringCommandStatus;
  durationSeconds: number | null;
  requestedAt: string;
  acknowledgedAt: string | null;
  completedAt: string | null;
  expiresAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface HealthResponse {
  status: "ok" | "degraded";
  service: string;
  time: string;
  version?: string;
}

export interface AdminOverview {
  devices: {
    total: number;
    online: number;
    offline: number;
  };
  readings: {
    total: number;
    last24h: number;
  };
  commands: {
    total: number;
    pending: number;
  };
  contactMessages: number;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  role: "user" | "admin";
  createdAt: string;
}

// Dashboard connection mode — clearly distinguishes live vs demo vs offline.
export type ConnectionMode = "live" | "demo" | "offline";

export interface DeviceConnectionStatus {
  deviceId: string;
  mode: ConnectionMode;
  lastSeenAt: string | null;
}
