import { describe, it, expect } from "vitest";
import { contactSchema } from "../contact.schema";
import { ingestReadingSchema } from "../reading.schema";
import { calibrationSchema } from "../calibration.schema";
import { createCommandSchema, ackCommandSchema } from "../command.schema";
import { ingestImageSchema } from "../image.schema";

describe("contactSchema", () => {
  it("accepts a valid submission", () => {
    const r = contactSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      subject: "Hello",
      message: "This is a long enough message.",
    });
    expect(r.success).toBe(true);
  });
  it("rejects an invalid email", () => {
    const r = contactSchema.safeParse({
      name: "Ada",
      email: "not-an-email",
      subject: "Hello",
      message: "This is a long enough message.",
    });
    expect(r.success).toBe(false);
  });
  it("rejects a short message", () => {
    const r = contactSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      subject: "Hello",
      message: "short",
    });
    expect(r.success).toBe(false);
  });
});

describe("ingestReadingSchema", () => {
  it("accepts a valid reading with only required fields", () => {
    const r = ingestReadingSchema.safeParse({ device_id: "dev-1", raw_moisture_value: 1500 });
    expect(r.success).toBe(true);
  });
  it("rejects an out-of-range ADC value", () => {
    const r = ingestReadingSchema.safeParse({ device_id: "dev-1", raw_moisture_value: 5000 });
    expect(r.success).toBe(false);
  });
  it("rejects a non-integer ADC value", () => {
    const r = ingestReadingSchema.safeParse({ device_id: "dev-1", raw_moisture_value: 15.5 });
    expect(r.success).toBe(false);
  });
  it("rejects an invalid datetime", () => {
    const r = ingestReadingSchema.safeParse({
      device_id: "dev-1",
      raw_moisture_value: 1500,
      device_timestamp: "not-a-date",
    });
    expect(r.success).toBe(false);
  });
});

describe("calibrationSchema", () => {
  it("accepts valid distinct references and a 0-100 threshold", () => {
    const r = calibrationSchema.safeParse({
      dry_reference: 3100,
      wet_reference: 1300,
      watering_threshold: 35,
    });
    expect(r.success).toBe(true);
  });
  it("rejects equal dry and wet references", () => {
    const r = calibrationSchema.safeParse({
      dry_reference: 2000,
      wet_reference: 2000,
      watering_threshold: 35,
    });
    expect(r.success).toBe(false);
  });
  it("rejects an out-of-range threshold", () => {
    const r = calibrationSchema.safeParse({
      dry_reference: 3100,
      wet_reference: 1300,
      watering_threshold: 150,
    });
    expect(r.success).toBe(false);
  });
  it("defaults manual_entry to true", () => {
    const r = calibrationSchema.parse({
      dry_reference: 3100,
      wet_reference: 1300,
      watering_threshold: 35,
    });
    expect(r.manual_entry).toBe(true);
  });
});

describe("createCommandSchema", () => {
  it("accepts manual_water with a duration", () => {
    const r = createCommandSchema.safeParse({ command_type: "manual_water", duration_seconds: 5 });
    expect(r.success).toBe(true);
  });
  it("rejects manual_water without a duration", () => {
    const r = createCommandSchema.safeParse({ command_type: "manual_water" });
    expect(r.success).toBe(false);
  });
  it("rejects a duration over the max", () => {
    const r = createCommandSchema.safeParse({ command_type: "manual_water", duration_seconds: 400 });
    expect(r.success).toBe(false);
  });
  it("accepts auto_water_on without a duration", () => {
    const r = createCommandSchema.safeParse({ command_type: "auto_water_on" });
    expect(r.success).toBe(true);
  });
  it("rejects an unknown command type", () => {
    const r = createCommandSchema.safeParse({ command_type: "explode" });
    expect(r.success).toBe(false);
  });
});

describe("ackCommandSchema", () => {
  it("accepts a valid status", () => {
    expect(ackCommandSchema.safeParse({ status: "acknowledged" }).success).toBe(true);
    expect(ackCommandSchema.safeParse({ status: "completed" }).success).toBe(true);
  });
  it("rejects an invalid status", () => {
    expect(ackCommandSchema.safeParse({ status: "running" }).success).toBe(false);
  });
});

describe("ingestImageSchema", () => {
  it("accepts valid metadata", () => {
    const r = ingestImageSchema.safeParse({ device_id: "dev-1", storage_path: "images/dev1/x.jpg" });
    expect(r.success).toBe(true);
  });
  it("requires a storage_path", () => {
    const r = ingestImageSchema.safeParse({ device_id: "dev-1", storage_path: "" });
    expect(r.success).toBe(false);
  });
  it("rejects an invalid public_url", () => {
    const r = ingestImageSchema.safeParse({ device_id: "dev-1", storage_path: "x", public_url: "not-a-url" });
    expect(r.success).toBe(false);
  });
});
