import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { installMocks } from "../test/mockClient";

/**
 * Public contact form. Validated by Zod and stored in the contact_messages
 * table. Stricter rate limit applies.
 */
describe("contact form", () => {
  let app: ReturnType<typeof createApp>;
  let mocks: ReturnType<typeof installMocks>;

  const valid = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    subject: "Hello",
    message: "This is a long enough message for the validator.",
  };

  beforeEach(() => {
    mocks = installMocks();
    app = createApp();
  });

  it("rejects an invalid submission (bad email, short message)", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ name: "Ada", email: "no", subject: "Hi", message: "short" });
    expect(res.status).toBe(422);
  });

  it("accepts a valid submission", async () => {
    mocks.builder.enqueue({
      data: {
        id: "msg-1",
        name: valid.name,
        email: valid.email,
        subject: valid.subject,
        message: valid.message,
        created_at: new Date().toISOString(),
      },
      error: null,
    });
    const res = await request(app).post("/api/contact").send(valid);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ ok: true });
  });

  it("returns 500-style error envelope when the DB insert fails", async () => {
    mocks.builder.enqueue({ data: null, error: new Error("DB down") });
    const res = await request(app).post("/api/contact").send(valid);
    expect([500, 502, 400]).toContain(res.status);
  });
});
