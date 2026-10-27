import { apiGet } from "./api";
import type { DeviceEvent } from "@/types";

export function listEvents(
  deviceId: string,
  query: { page?: number; pageSize?: number } = {}
): Promise<{ data: DeviceEvent[]; page: number; pageSize: number; total: number }> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiGet(`/api/devices/${encodeURIComponent(deviceId)}/events${qs}`);
}
