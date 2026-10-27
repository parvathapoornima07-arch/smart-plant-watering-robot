import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app";

/**
 * CORS behavior. The backend's config reads ALLOWED_ORIGINS / FRONTEND_URL at
 * import time; with no env set in the test environment the default allowed
 * origin is the frontend dev URL (http://localhost:5173). We test against that.
 */
const ALLOWED = "http://localhost:5173";

describe("CORS behavior", () => {
  const app = createApp();

  it("reflects an allowed origin in the response headers", async () => {
    const res = await request(app).get("/api/health").set("Origin", ALLOWED);
    expect(res.headers["access-control-allow-origin"]).toBe(ALLOWED);
  });

  it("handles preflight OPTIONS for an allowed origin and advertises custom headers", async () => {
    const res = await request(app)
      .options("/api/health")
      .set("Origin", ALLOWED)
      .set("Access-Control-Request-Method", "GET");
    expect([200, 204]).toContain(res.status);
    expect(res.headers["access-control-allow-origin"]).toBe(ALLOWED);
    expect(res.headers["access-control-allow-headers"]).toContain("Authorization");
    expect(res.headers["access-control-allow-headers"]).toContain("X-Device-Token");
  });

  it("does not set an allow-origin header for an origin not in the allowlist", async () => {
    const res = await request(app).options("/api/health").set("Origin", "https://evil.example");
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
