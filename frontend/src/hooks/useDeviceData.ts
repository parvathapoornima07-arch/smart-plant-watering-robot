import { useCallback, useEffect, useState } from "react";
import type { CameraImage, DeviceEvent, SensorCalibration, SensorReading } from "@/types";
import { useDashboard } from "@/contexts/DashboardContext";
import { usePolling } from "@/hooks/usePolling";
import { listReadings, getLatestReading } from "@/services/readings.service";
import { getCalibration } from "@/services/calibration.service";
import { listEvents } from "@/services/events.service";
import { getLatestImage } from "@/services/camera.service";
import {
  DEMO_CALIBRATION,
  DEMO_DEVICE_ID,
  DEMO_LATEST_IMAGE,
  generateDemoEvents,
  generateDemoReadings,
} from "@/lib/demoData";

interface DeviceDataState {
  readings: SensorReading[];
  latestReading: SensorReading | null;
  calibration: SensorCalibration | null;
  events: DeviceEvent[];
  latestImage: CameraImage | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const POLL_MS = 20_000;

/**
 * Fetches dashboard data for the active device. When demo mode is on, it
 * returns in-memory sample data (never persisted, never sent to the backend).
 */
export function useDeviceData(): DeviceDataState {
  const { activeDeviceId, demoMode, connectionMode } = useDashboard();
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null);
  const [calibration, setCalibration] = useState<SensorCalibration | null>(null);
  const [events, setEvents] = useState<DeviceEvent[]>([]);
  const [latestImage, setLatestImage] = useState<CameraImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    // Demo mode: in-memory sample data only.
    if (demoMode) {
      const demoReadings = generateDemoReadings();
      setReadings(demoReadings);
      setLatestReading(demoReadings[0] ?? null);
      setCalibration({
        id: "demo-cal",
        deviceId: DEMO_DEVICE_ID,
        dryReference: DEMO_CALIBRATION.dryReference,
        wetReference: DEMO_CALIBRATION.wetReference,
        wateringThreshold: DEMO_CALIBRATION.wateringThreshold,
        manualEntry: true,
        createdBy: "demo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setEvents(generateDemoEvents());
      setLatestImage(DEMO_LATEST_IMAGE);
      setLoading(false);
      setError(null);
      return;
    }

    if (!activeDeviceId) {
      setReadings([]);
      setLatestReading(null);
      setCalibration(null);
      setEvents([]);
      setLatestImage(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const [readingsRes, latest, cal, eventsRes, image] = await Promise.allSettled([
        listReadings(activeDeviceId, { pageSize: 50 }),
        getLatestReading(activeDeviceId),
        getCalibration(activeDeviceId),
        listEvents(activeDeviceId, { pageSize: 20 }),
        getLatestImage(activeDeviceId),
      ]);

      setReadings(readingsRes.status === "fulfilled" ? readingsRes.value.data : []);
      setLatestReading(latest.status === "fulfilled" ? latest.value : null);
      setCalibration(cal.status === "fulfilled" ? cal.value : null);
      setEvents(eventsRes.status === "fulfilled" ? eventsRes.value.data : []);
      setLatestImage(image.status === "fulfilled" ? image.value : null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load device data.");
    } finally {
      setLoading(false);
    }
  }, [activeDeviceId, demoMode]);

  usePolling(fetchAll, POLL_MS, connectionMode !== "offline" || demoMode);

  // Re-run immediately when device or mode changes.
  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  return {
    readings,
    latestReading,
    calibration,
    events,
    latestImage,
    loading,
    error,
    refresh: fetchAll,
  };
}
