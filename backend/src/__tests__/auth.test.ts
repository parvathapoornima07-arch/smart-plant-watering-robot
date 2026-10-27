import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { installMocks, bearer } from "../test/mockClient";

/**
 * Authentication / authorization tests. Verifies that protected routes reject
 * unauthenticated requests and that the admin guard enforces roles.
 */
describe("authentication", () => {
  let app: ReturnType<typeof createApp>;
  let mocks: ReturnType<typeof installMocks>;

  beforeEach(() => {
    mocks = installMocks();
    app = createApp();
  });

  it("rejects unauthenticated requests to /api/profile", async () => {
    const res = await request(app).get("/api/profile");
    expect(res.status).toBe(401);
  });

  it("rejects a request with an invalid token", async () => {
    mocks.setUser(null, { message: "invalid token" });
    const res = await request(app).get("/api/profile").set("Authorization", bearer("bad"));
    expect(res.status).toBe(401);
  });

  it("accepts a verified token for /api/profile and returns the role", async () => {
    mocks.setUser({ id: "user-1", email: "u@example.com" });
    // user_roles lookup returns a regular user (no admin row).
    mocks.builder.enqueue({ data: null, error: null });
    // profile lookup
    mocks.builder.enqueue({ data: { id: "user-1", display_name: "User", created_at: "2024-01-01T00:00:00Z" }, error: null });

    const res = await request(app).get("/api/profile").set("Authorization", bearer("good"));
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("user-1");
    expect(res.body.role).toBe("user");
  });

  it("rejects admin routes for a non-admin user", async () => {
    mocks.setUser({ id: "user-1" });
    mocks.builder.enqueue({ data: null, error: null }); // role lookup returns no admin row

    const res = await request(app).get("/api/admin/overview").set("Authorization", bearer("good"));
    expect(res.status).toBe(403);
  });

  it("allows admin routes for a user with the admin role", async () => {
    mocks.setUser({ id: "admin-1", email: "a@example.com" });
    // user_roles lookup returns admin
    mocks.builder.enqueue({ data: { role: "admin" }, error: null });
    // overview queries: devices, readings, commands, messages
    mocks.builder.enqueue({ data: [{ id: "d1", status: "online", last_seen_at: new Date().toISOString() }], error: null });
    mocks.builder.enqueue({ data: [{ received_at: new Date().toISOString() }], error: null, count: 1 });
    mocks.builder.enqueue({ data: [{ status: "pending" }], error: null, count: 1 });
    mocks.builder.enqueue({ data: [{ id: "m1" }], error: null, count: 1 });

    const res = await request(app).get("/api/admin/overview").set("Authorization", bearer("good"));
    expect(res.status).toBe(200);
    expect(res.body.devices.total).toBe(1);
  });
});
