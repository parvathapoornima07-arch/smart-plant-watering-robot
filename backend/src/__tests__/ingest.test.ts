import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { installMocks } from "../test/mockClient";
import { hashDeviceToken } from "../utils/deviceToken";

/**
 * Device ingestion tests. The mock builder is chainable AND thenable; each
 * `await` (including fire-and-forget `.then(...)` calls) pops the next queued
 * result, so we enqueue results in the exact execution order.
 *
 * requireDevice order: (1) devices lookup, (2) device_credentials lookup,
 * (3) fire-and-forget last_seen update.
 */
describe("device ingestion", () => {
  let app: ReturnType<typeof createApp>;
  let mocks: ReturnType<typeof installMocks>;
  const DEVICE_TOKEN = "a-real-test-token";
  const DEVICE_HASH = hashDeviceToken(DEVICE_TOKEN);
  const DEVICE_ROW = {
    id: "dev-uuid-1",
    device_id: "esp32-robot-01",
    name: "Robot",
    status: "online",
    last_seen_at: new Date().toISOString(),
    firmware_version: "0.1.0",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    mocks = installMocks();
    app = createApp();
  });

  it("rejects requests without a device token", async () => {
    const res = await request(app)
      .post("/api/device-ingest/readings")
      .send({ device_id: "esp32-robot-01", raw_moisture_value: 1500 });
    expect(res.status).toBe(401);
  });

  it("rejects requests for an unknown device", async () => {
    mocks.builder.enqueue({ data: null, error: null }); // devices lookup → none
    const res = await request(app)
      .post("/api/device-ingest/readings")
      .set("X-Device-Token", DEVICE_TOKEN)
      .send({ device_id: "ghost", raw_moisture_value: 1500 });
    expect(res.status).toBe(401);
  });

  it("rejects an invalid device token", async () => {
    mocks.builder.enqueue({ data: DEVICE_ROW, error: null }); // device found
    mocks.builder.enqueue({ data: [{ token_hash: hashDeviceToken("a-different-token") }], error: null });
    mocks.builder.enqueue({ data: null, error: null }); // fire-and-forget update
    const res = await request(app)
      .post("/api/device-ingest/readings")
      .set("X-Device-Token", "wrong-token")
      .send({ device_id: "esp32-robot-01", raw_moisture_value: 1500 });
    expect(res.status).toBe(401);
  });

  it("rejects an invalid reading payload (out-of-range ADC)", async () => {
    mocks.builder.enqueue({ data: DEVICE_ROW, error: null }); // device lookup
    mocks.builder.enqueue({ data: [{ token_hash: DEVICE_HASH }], error: null }); // creds
    mocks.builder.enqueue({ data: null, error: null }); // fire-and-forget update
    const res = await request(app)
      .post("/api/device-ingest/readings")
      .set("X-Device-Token", DEVICE_TOKEN)
      .send({ device_id: "esp32-robot-01", raw_moisture_value: 99999 });
    expect(res.status).toBe(422);
  });

  it("accepts a valid reading and stores it (server recomputes percentage)", async () => {
    mocks.builder.enqueue({ data: DEVICE_ROW, error: null }); // device lookup
    mocks.builder.enqueue({ data: [{ token_hash: DEVICE_HASH }], error: null }); // creds
    mocks.builder.enqueue({ data: null, error: null }); // last_seen update (fire-and-forget)
    mocks.builder.enqueue({ data: null, error: null }); // calibration lookup (none)
    mocks.builder.enqueue({
      data: {
        id: "r1",
        device_id: "dev-uuid-1",
        raw_moisture_value: 1500,
        moisture_percentage: null,
        pump_state: null,
        motor_state: null,
        device_timestamp: null,
        received_at: "2024-01-01T00:00:00Z",
      },
      error: null,
    }); // sensor_readings insert
    mocks.builder.enqueue({ data: null, error: null }); // devices update (fire-and-forget)
    mocks.builder.enqueue({ data: null, error: null }); // device_events insert (fire-and-forget)

    const res = await request(app)
      .post("/api/device-ingest/readings")
      .set("X-Device-Token", DEVICE_TOKEN)
      .send({
        device_id: "esp32-robot-01",
        raw_moisture_value: 1500,
        pump_state: false,
        device_timestamp: new Date().toISOString(),
      });
    expect(res.status).toBe(201);
    expect(res.body.rawMoistureValue).toBe(1500);
    expect(res.body.deviceId).toBe("dev-uuid-1");
  });
});
