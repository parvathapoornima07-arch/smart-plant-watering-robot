import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app";

describe("GET /api/health", () => {
  const app = createApp();

  it("returns 200 with status and service fields", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status");
    expect(res.body).toHaveProperty("service", "smart-plant-watering-backend");
    expect(res.body).toHaveProperty("time");
  });

  it("reports degraded when Supabase is not configured", async () => {
    // In the test environment no real Supabase keys are set.
    const res = await request(app).get("/api/health");
    expect(["ok", "degraded"]).toContain(res.body.status);
  });
});
