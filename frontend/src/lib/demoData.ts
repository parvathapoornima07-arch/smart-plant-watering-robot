/**
 * In-memory DEMO data for the dashboard.
 *
 * IMPORTANT: This is sample data ONLY. It is never persisted, never sent to the
 * backend, and never displayed without a clear "Demo" label. The real device API
 * implementation does not depend on any of this. It exists purely so the
 * dashboard UX can be exercised before hardware integration is complete.
 */

import type { CameraImage, DeviceEvent, SensorReading } from "@/types";

export const DEMO_DEVICE_ID = "demo-device-001";

export function generateDemoReadings(count = 24): SensorReading[] {
  const now = Date.now();
  const readings: SensorReading[] = [];
  // A plausible-looking but synthetic moisture curve over the last ~24 readings.
  for (let i = count - 1; i >= 0; i--) {
    const phase = (count - i) / count;
    // Raw ADC: resistive-style sensor where higher = drier.
    const base = 2800 - Math.round(700 * Math.sin(phase * Math.PI));
    const noise = Math.round((Math.random() - 0.5) * 120);
    const raw = Math.max(0, Math.min(4095, base + noise));
    const deviceTimestamp = new Date(now - i * 60 * 1000).toISOString();
    readings.push({
      id: `demo-reading-${i}`,
      deviceId: DEMO_DEVICE_ID,
      rawMoistureValue: raw,
      // Calibrated against demo refs: dry=3100, wet=1300.
      moisturePercentage: Math.round(((raw - 3100) / (1300 - 3100)) * 1000) / 10,
      pumpState: raw > 3000,
      motorState: false,
      deviceTimestamp,
      receivedAt: deviceTimestamp,
    });
  }
  return readings.reverse();
}

export function generateDemoEvents(): DeviceEvent[] {
  const now = Date.now();
  return [
    {
      id: "demo-event-1",
      deviceId: DEMO_DEVICE_ID,
      eventType: "reading",
      message: "Sensor reading received (demo data).",
      metadata: { source: "demo" },
      createdAt: new Date(now - 60_000).toISOString(),
    },
    {
      id: "demo-event-2",
      deviceId: DEMO_DEVICE_ID,
      eventType: "pump",
      message: "Pump activated for 5 seconds (demo data).",
      metadata: { source: "demo" },
      createdAt: new Date(now - 2 * 60_000).toISOString(),
    },
    {
      id: "demo-event-3",
      deviceId: DEMO_DEVICE_ID,
      eventType: "heartbeat",
      message: "Heartbeat received (demo data).",
      metadata: { source: "demo" },
      createdAt: new Date(now - 3 * 60_000).toISOString(),
    },
  ];
}

export const DEMO_LATEST_IMAGE: CameraImage | null = null; // empty state by design

export const DEMO_CALIBRATION = {
  dryReference: 3100,
  wetReference: 1300,
  wateringThreshold: 35,
};
