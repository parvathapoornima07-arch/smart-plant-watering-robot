import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { installMocks } from "../test/mockClient";
import { hashDeviceToken } from "../utils/deviceToken";

/**
 * Image metadata ingestion validation. Device-authenticated.
 */
describe("image ingestion", () => {
  let app: ReturnType<typeof createApp>;
  let mocks: ReturnType<typeof installMocks>;
  const DEVICE_TOKEN = "img-test-token";
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

  beforeEach(() => {
    mocks = installMocks();
    app = createApp();
  });

  it("rejects image metadata without a storage_path", async () => {
    mocks.builder.enqueue({ data: DEVICE_ROW, error: null });
    mocks.builder.enqueue({ data: [{ token_hash: DEVICE_HASH }], error: null });
    mocks.builder.enqueue({ data: null, error: null }); // fire-and-forget update

    const res = await request(app)
      .post("/api/device-ingest/images")
      .set("X-Device-Token", DEVICE_TOKEN)
      .send({ device_id: "esp32-robot-01", storage_path: "" });
    expect(res.status).toBe(422);
  });

  it("rejects an invalid public_url", async () => {
    mocks.builder.enqueue({ data: DEVICE_ROW, error: null });
    mocks.builder.enqueue({ data: [{ token_hash: DEVICE_HASH }], error: null });
    mocks.builder.enqueue({ data: null, error: null });

    const res = await request(app)
      .post("/api/device-ingest/images")
      .set("X-Device-Token", DEVICE_TOKEN)
      .send({ device_id: "esp32-robot-01", storage_path: "x.jpg", public_url: "not-a-url" });
    expect(res.status).toBe(422);
  });

  it("accepts valid image metadata", async () => {
    mocks.builder.enqueue({ data: DEVICE_ROW, error: null });
    mocks.builder.enqueue({ data: [{ token_hash: DEVICE_HASH }], error: null });
    mocks.builder.enqueue({ data: null, error: null }); // last_seen update (fire-and-forget)
    mocks.builder.enqueue({
      data: {
        id: "img-1",
        device_id: "dev-uuid-1",
        storage_path: "images/dev1/img1.jpg",
        public_url: "https://cdn.example.com/img1.jpg",
        captured_at: new Date().toISOString(),
        received_at: new Date().toISOString(),
      },
      error: null,
    });
    mocks.builder.enqueue({ data: null, error: null }); // device_events (fire-and-forget)

    const res = await request(app)
      .post("/api/device-ingest/images")
      .set("X-Device-Token", DEVICE_TOKEN)
      .send({
        device_id: "esp32-robot-01",
        storage_path: "images/dev1/img1.jpg",
        captured_at: new Date().toISOString(),
        public_url: "https://cdn.example.com/img1.jpg",
      });
    expect(res.status).toBe(201);
    expect(res.body.storagePath).toBe("images/dev1/img1.jpg");
  });
});
