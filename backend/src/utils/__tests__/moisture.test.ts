import { describe, it, expect } from "vitest";
import { computeMoisturePercentage, isValidAdc, ADC_MIN, ADC_MAX } from "../moisture";

describe("isValidAdc", () => {
  it("accepts integers within the ADC range", () => {
    expect(isValidAdc(0)).toBe(true);
    expect(isValidAdc(2048)).toBe(true);
    expect(isValidAdc(4095)).toBe(true);
  });
  it("rejects out-of-range and non-numbers", () => {
    expect(isValidAdc(-1)).toBe(false);
    expect(isValidAdc(4096)).toBe(false);
    expect(isValidAdc(NaN)).toBe(false);
    expect(isValidAdc("1200")).toBe(false);
    expect(isValidAdc(null)).toBe(false);
  });
  it("exposes the documented 12-bit ADC range", () => {
    expect(ADC_MIN).toBe(0);
    expect(ADC_MAX).toBe(4095);
  });
});

describe("computeMoisturePercentage", () => {
  it("returns invalid when calibration is missing", () => {
    expect(computeMoisturePercentage(2000, {}).valid).toBe(false);
    expect(computeMoisturePercentage(2000, { dryReference: 1200 }).valid).toBe(false);
  });
  it("returns invalid when dry and wet are equal", () => {
    const r = computeMoisturePercentage(2000, { dryReference: 2000, wetReference: 2000 });
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/equal/i);
  });
  it("returns invalid when the raw reading is out of range", () => {
    const r = computeMoisturePercentage(5000, { dryReference: 1200, wetReference: 3200 });
    expect(r.valid).toBe(false);
  });

  it("maps correctly for a higher-when-wetter sensor (wet > dry)", () => {
    const cal = { dryReference: 1200, wetReference: 3200 };
    expect(computeMoisturePercentage(1200, cal).percentage).toBe(0);
    expect(computeMoisturePercentage(3200, cal).percentage).toBe(100);
    expect(computeMoisturePercentage(2200, cal).percentage).toBe(50);
  });

  it("maps correctly for a higher-when-drier sensor (dry > wet)", () => {
    // Resistive-style: higher ADC = drier.
    const cal = { dryReference: 3200, wetReference: 1200 };
    expect(computeMoisturePercentage(3200, cal).percentage).toBe(0); // dry -> 0%
    expect(computeMoisturePercentage(1200, cal).percentage).toBe(100); // wet -> 100%
    expect(computeMoisturePercentage(2200, cal).percentage).toBe(50);
  });

  it("clamps readings outside the calibrated range to 0-100", () => {
    const cal = { dryReference: 1200, wetReference: 3200 };
    expect(computeMoisturePercentage(500, cal).percentage).toBe(0);
    expect(computeMoisturePercentage(4000, cal).percentage).toBe(100);
  });

  it("rounds to one decimal place", () => {
    const cal = { dryReference: 1200, wetReference: 3200 };
    const r = computeMoisturePercentage(1234, cal);
    // (1234-1200)/(3200-1200)*100 = 34/2000*100 = 1.7
    expect(r.percentage).toBe(1.7);
  });
});
