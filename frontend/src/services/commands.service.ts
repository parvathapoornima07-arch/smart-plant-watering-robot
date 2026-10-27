import { apiGet, apiPost } from "./api";
import type { WateringCommand, WateringCommandType } from "@/types";

export interface CreateCommandPayload {
  commandType: WateringCommandType;
  durationSeconds?: number;
}

export function listCommands(
  deviceId: string
): Promise<{ data: WateringCommand[]; page: number; pageSize: number; total: number }> {
  return apiGet(`/api/devices/${encodeURIComponent(deviceId)}/commands`);
}

export function createCommand(
  deviceId: string,
  payload: CreateCommandPayload
): Promise<WateringCommand> {
  return apiPost(`/api/devices/${encodeURIComponent(deviceId)}/commands`, payload);
}
