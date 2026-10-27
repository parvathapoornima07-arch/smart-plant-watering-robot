import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { installMocks, bearer } from "../test/mockClient";
import { hashDeviceToken } from "../utils/deviceToken";

/**
 * Watering command tests. Covers creation, duplicate prevention, and
 * acknowledgement expiry. The create path is admin-gated, so we set an admin
 * user and enqueue the role lookup result.
 */
describe("watering commands", () => {
  let app: ReturnType<typeof createApp>;
  let mocks: ReturnType<typeof installMocks>;
  const DEVICE_TOKEN = "cmd-test-token";
  const DEVICE_HASH = hashDeviceToken(DEVICE_TOKEN);
  const DEVICE_ROW = {
    id: "dev-uuid-1",
    device_id: "esp32-robot-01",
    name: "Robot",
    status: "online",
    last_seen_at: new Date().toISOString(),
    firmware_version: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };
  const COMMAND_ROW = {
    id: "cmd-1",
    device_id: "dev-uuid-1",
    requested_by: "admin-1",
    command_type: "manual_water",
    status: "pending",
    duration_seconds: 5,
    requested_at: new Date().toISOString(),
    acknowledged_at: null,
    completed_at: null,
    expires_at: new Date(Date.now() + 5 * 60_000).toISOString(),
  };

  beforeEach(() => {
    mocks = installMocks({ authUser: { id: "admin-1", email: "a@example.com" } });
    app = createApp();
  });

  it("rejects command creation from a non-admin", async () => {
    mocks.setUser({ id: "user-1" });
    mocks.builder.enqueue({ data: null, error: null }); // role lookup → user
    const res = await request(app)
      .post("/api/devices/esp32-robot-01/commands")
      .set("Authorization", bearer())
      .send({ command_type: "manual_water", duration_seconds: 5 });
    expect(res.status).toBe(403);
  });

  it("creates a manual_water command as admin", async () => {
    // role lookup → admin
    mocks.builder.enqueue({ data: { role: "admin" }, error: null });
    // device lookup
    mocks.builder.enqueue({ data: DEVICE_ROW, error: null });
    // expireStaleCommands (awaited update)
    mocks.builder.enqueue({ data: null, error: null });
    // duplicate pending check → none pending
    mocks.builder.enqueue({ data: [], error: null });
    // insert command
    mocks.builder.enqueue({ data: COMMAND_ROW, error: null });
    // device_events insert (fire-and-forget)
    mocks.builder.enqueue({ data: null, error: null });

    const res = await request(app)
      .post("/api/devices/esp32-robot-01/commands")
      .set("Authorization", bearer())
      .send({ command_type: "manual_water", duration_seconds: 5 });
    expect(res.status).toBe(201);
    expect(res.body.commandType).toBe("manual_water");
  });

  it("prevents a duplicate manual_water while one is pending", async () => {
    mocks.builder.enqueue({ data: { role: "admin" }, error: null });
    mocks.builder.enqueue({ data: DEVICE_ROW, error: null });
    mocks.builder.enqueue({ data: null, error: null }); // expireStaleCommands
    mocks.builder.enqueue({ data: [{ id: "existing-pending" }], error: null }); // pending exists

    const res = await request(app)
      .post("/api/devices/esp32-robot-01/commands")
      .set("Authorization", bearer())
      .send({ command_type: "manual_water", duration_seconds: 5 });
    expect(res.status).toBe(409);
  });

  it("rejects manual_water without a duration", async () => {
    mocks.builder.enqueue({ data: { role: "admin" }, error: null });
    mocks.builder.enqueue({ data: DEVICE_ROW, error: null });
    mocks.builder.enqueue({ data: null, error: null }); // expireStaleCommands

    const res = await request(app)
      .post("/api/devices/esp32-robot-01/commands")
      .set("Authorization", bearer())
      .send({ command_type: "manual_water" });
    expect(res.status).toBe(422);
  });

  it("marks a command expired when the device acks past its expiry", async () => {
    const expiredCmd = { ...COMMAND_ROW, expires_at: new Date(Date.now() - 60_000).toISOString() };
    // requireDevice: device, creds, fire-and-forget update
    mocks.builder.enqueue({ data: DEVICE_ROW, error: null });
    mocks.builder.enqueue({ data: [{ token_hash: DEVICE_HASH }], error: null });
    mocks.builder.enqueue({ data: null, error: null });
    // command lookup
    mocks.builder.enqueue({ data: expiredCmd, error: null });
    // expire update
    mocks.builder.enqueue({ data: null, error: null });

    const res = await request(app)
      .post("/api/device-ingest/commands/cmd-1/ack")
      .set("X-Device-Id", "esp32-robot-01")
      .set("X-Device-Token", DEVICE_TOKEN)
      .send({ status: "acknowledged" });
    expect(res.status).toBe(422);
  });
});
