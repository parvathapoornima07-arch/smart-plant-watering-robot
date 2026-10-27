/**
 * Moisture percentage calculation — backend mirror of the frontend util.
 *
 * Convention: dryReference -> 0%, wetReference -> 100%. The single formula
 * handles both sensor polarities because (wetReference - dryReference) carries
 * the sign. The result is clamped to [0, 100].
 */

export const ADC_MIN = 0;
export const ADC_MAX = 4095;

export function isValidAdc(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= ADC_MIN && value <= ADC_MAX;
}

export interface CalibrationRefs {
  dryReference?: number | null;
  wetReference?: number | null;
}

export interface MoistureResult {
  percentage: number | null;
  valid: boolean;
  reason?: string;
}

export function computeMoisturePercentage(raw: number, cal: CalibrationRefs): MoistureResult {
  const dry = cal.dryReference;
  const wet = cal.wetReference;
  if (!isValidAdc(raw)) return { percentage: null, valid: false, reason: "Invalid ADC reading." };
  if (!isValidAdc(dry)) return { percentage: null, valid: false, reason: "Dry reference not configured." };
  if (!isValidAdc(wet)) return { percentage: null, valid: false, reason: "Wet reference not configured." };
  if (dry === wet) return { percentage: null, valid: false, reason: "Dry and wet references are equal." };

  const rawPct = ((raw - dry) / (wet - dry)) * 100;
  const clamped = Math.min(100, Math.max(0, rawPct));
  return { percentage: Math.round(clamped * 10) / 10, valid: true };
}
