import { apiGet, apiPost, apiPatch } from "./api";
import type { Device, Paginated } from "@/types";

export function listDevices(): Promise<Device[]> {
  return apiGet<Device[]>("/api/devices");
}

export function getDevice(deviceId: string): Promise<Device> {
  return apiGet<Device>(`/api/devices/${encodeURIComponent(deviceId)}`);
}

/** Admin only. */
export function registerDevice(payload: { deviceId: string; name: string }): Promise<{
  device: Device;
  /** Returned ONCE at creation. Never stored in plaintext by the backend. */
  token: string;
}> {
  return apiPost("/api/devices", payload);
}

/** Admin only. */
export function updateDevice(
  deviceId: string,
  patch: Partial<Pick<Device, "name" | "status">>
): Promise<Device> {
  return apiPatch(`/api/devices/${encodeURIComponent(deviceId)}`, patch);
}

export function revokeDevice(deviceId: string): Promise<{ ok: true }> {
  return apiPost(`/api/devices/${encodeURIComponent(deviceId)}/revoke`);
}

export function rotateDeviceToken(deviceId: string): Promise<{ token: string }> {
  return apiPost(`/api/devices/${encodeURIComponent(deviceId)}/rotate-token`);
}

export type { Paginated };
