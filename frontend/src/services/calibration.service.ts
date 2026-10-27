import { apiGet, apiPut } from "./api";
import type { SensorCalibration } from "@/types";

export interface CalibrationPayload {
  dryReference: number;
  wetReference: number;
  wateringThreshold: number;
  manualEntry: boolean;
}

export function getCalibration(deviceId: string): Promise<SensorCalibration | null> {
  return apiGet<SensorCalibration | null>(
    `/api/devices/${encodeURIComponent(deviceId)}/calibration`
  );
}

export function saveCalibration(
  deviceId: string,
  payload: CalibrationPayload
): Promise<SensorCalibration> {
  return apiPut(`/api/devices/${encodeURIComponent(deviceId)}/calibration`, payload);
}
