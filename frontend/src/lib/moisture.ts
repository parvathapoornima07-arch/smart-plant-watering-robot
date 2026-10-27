/**
 * Moisture percentage calculation from calibrated dry/wet reference readings.
 *
 * The ESP32's 12-bit ADC reports values nominally in [0, 4095]. Crucially,
 * a higher ADC value does NOT universally mean wetter soil — sensor polarity
 * depends on the sensor and its conditions. We therefore map the raw reading
 * onto the measured dry→wet scale rather than assuming a direction.
 *
 * Convention:
 *   - dryReference corresponds to 0% moisture
 *   - wetReference corresponds to 100% moisture
 *
 * The single formula below works for BOTH polarities because the denominator
 * (wetReference - dryReference) carries the sign:
 *   percentage = (raw - dryReference) / (wetReference - dryReference) * 100
 *
 * Example A (resistive-style, higher = drier): dry=3200, wet=1200, raw=1200
 *   -> (1200 - 3200) / (1200 - 3200) * 100 = 100%   (wet, correct)
 * Example B (capacitive-style, higher = wetter): dry=1200, wet=3200, raw=3200
 *   -> (3200 - 1200) / (3200 - 1200) * 100 = 100%   (wet, correct)
 *
 * The result is clamped to [0, 100]. The displayed value is a calibrated
 * estimate, NOT a laboratory soil-water measurement.
 */

export interface CalibrationValues {
  dryReference?: number | null;
  wetReference?: number | null;
}

export interface MoistureResult {
  percentage: number;
  valid: boolean;
  /** Human-readable reason when the result is not valid. */
  reason?: string;
}

export const ADC_MIN = 0;
export const ADC_MAX = 4095;

/** True when the value is a finite integer-like number within the ADC range. */
export function isValidAdcValue(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= ADC_MIN &&
    value <= ADC_MAX
  );
}

/**
 * Compute a calibrated moisture percentage for a raw ADC reading.
 * Returns { valid: false } when calibration is missing, equal, or invalid.
 */
export function computeMoisturePercentage(
  raw: number,
  calibration: CalibrationValues
): MoistureResult {
  const dry = calibration.dryReference;
  const wet = calibration.wetReference;

  if (!isValidAdcValue(raw)) {
    return { percentage: 0, valid: false, reason: "Invalid ADC reading." };
  }
  if (!isValidAdcValue(dry)) {
    return { percentage: 0, valid: false, reason: "Dry reference not configured." };
  }
  if (!isValidAdcValue(wet)) {
    return { percentage: 0, valid: false, reason: "Wet reference not configured." };
  }
  if (dry === wet) {
    return {
      percentage: 0,
      valid: false,
      reason: "Dry and wet references are equal — calibration invalid.",
    };
  }

  const rawPercentage = ((raw - dry) / (wet - dry)) * 100;
  const clamped = Math.min(100, Math.max(0, rawPercentage));
  // Round to one decimal place for display.
  const percentage = Math.round(clamped * 10) / 10;

  return { percentage, valid: true };
}

/** Interpret a percentage into a coarse status label for the UI. */
export function interpretMoisture(percentage: number): {
  label: string;
  tone: "dry" | "ok" | "wet";
} {
  if (percentage < 30) return { label: "Dry", tone: "dry" };
  if (percentage <= 70) return { label: "Optimal", tone: "ok" };
  return { label: "Wet", tone: "wet" };
}
