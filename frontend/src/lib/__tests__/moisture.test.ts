import { describe, it, expect } from "vitest";
import {
  computeMoisturePercentage,
  interpretMoisture,
  isValidAdcValue,
  ADC_MIN,
  ADC_MAX,
} from "../moisture";

describe("computeMoisturePercentage", () => {
  it("exposes the 12-bit ADC range", () => {
    expect(ADC_MIN).toBe(0);
    expect(ADC_MAX).toBe(4095);
  });

  it("is invalid when calibration is missing or references are equal", () => {
    expect(computeMoisturePercentage(2000, {}).valid).toBe(false);
    expect(
      computeMoisturePercentage(2000, { dryReference: 2000, wetReference: 2000 }).valid
    ).toBe(false);
  });

  it("maps higher-when-wetter sensors correctly", () => {
    const cal = { dryReference: 1200, wetReference: 3200 };
    expect(computeMoisturePercentage(1200, cal).percentage).toBe(0);
    expect(computeMoisturePercentage(3200, cal).percentage).toBe(100);
    expect(computeMoisturePercentage(2200, cal).percentage).toBe(50);
  });

  it("maps higher-when-drier sensors correctly (polarity handled)", () => {
    const cal = { dryReference: 3200, wetReference: 1200 };
    expect(computeMoisturePercentage(3200, cal).percentage).toBe(0);
    expect(computeMoisturePercentage(1200, cal).percentage).toBe(100);
  });

  it("clamps to 0-100", () => {
    const cal = { dryReference: 1200, wetReference: 3200 };
    expect(computeMoisturePercentage(500, cal).percentage).toBe(0);
    expect(computeMoisturePercentage(4000, cal).percentage).toBe(100);
  });
});

describe("interpretMoisture", () => {
  it("labels dry/ok/wet bands", () => {
    expect(interpretMoisture(10).label).toBe("Dry");
    expect(interpretMoisture(50).label).toBe("Optimal");
    expect(interpretMoisture(85).label).toBe("Wet");
  });
});

describe("isValidAdcValue", () => {
  it("accepts in-range integers and rejects the rest", () => {
    expect(isValidAdcValue(2048)).toBe(true);
    expect(isValidAdcValue(-1)).toBe(false);
    expect(isValidAdcValue(4096)).toBe(false);
    expect(isValidAdcValue("2048")).toBe(false);
  });
});
