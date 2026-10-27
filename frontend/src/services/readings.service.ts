import { apiGet } from "./api";
import type { SensorReading } from "@/types";

export interface ReadingsQuery {
  page?: number;
  pageSize?: number;
  from?: string; // ISO date
  to?: string; // ISO date
}

export function listReadings(
  deviceId: string,
  query: ReadingsQuery = {}
): Promise<{ data: SensorReading[]; page: number; pageSize: number; total: number }> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiGet(`/api/devices/${encodeURIComponent(deviceId)}/readings${qs}`);
}

export function getLatestReading(deviceId: string): Promise<SensorReading | null> {
  return apiGet<SensorReading | null>(
    `/api/devices/${encodeURIComponent(deviceId)}/latest-reading`
  );
}
