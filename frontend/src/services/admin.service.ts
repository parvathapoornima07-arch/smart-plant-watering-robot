import { apiGet } from "./api";
import type { AdminOverview, ContactMessage, Device, DeviceEvent, SensorReading } from "@/types";

export function getAdminOverview(): Promise<AdminOverview> {
  return apiGet<AdminOverview>("/api/admin/overview");
}

export function getAdminDevices(): Promise<Device[]> {
  return apiGet<Device[]>("/api/admin/devices");
}

export function getAdminEvents(
  query: { page?: number; pageSize?: number } = {}
): Promise<{ data: DeviceEvent[]; page: number; pageSize: number; total: number }> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiGet(`/api/admin/events${qs}`);
}

export function getAdminContactMessages(): Promise<ContactMessage[]> {
  return apiGet<ContactMessage[]>("/api/admin/contact-messages");
}

export function getAdminReadings(
  deviceId: string,
  query: { page?: number; pageSize?: number } = {}
): Promise<{ data: SensorReading[]; page: number; pageSize: number; total: number }> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiGet(`/api/admin/devices/${encodeURIComponent(deviceId)}/readings${qs}`);
}
