import { apiGet } from "./api";
import type { CameraImage } from "@/types";

export interface ImageQuery {
  page?: number;
  pageSize?: number;
}

export function listImages(
  deviceId: string,
  query: ImageQuery = {}
): Promise<{ data: CameraImage[]; page: number; pageSize: number; total: number }> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiGet(`/api/devices/${encodeURIComponent(deviceId)}/images${qs}`);
}

export function getLatestImage(deviceId: string): Promise<CameraImage | null> {
  return apiGet<CameraImage | null>(`/api/devices/${encodeURIComponent(deviceId)}/latest-image`);
}
