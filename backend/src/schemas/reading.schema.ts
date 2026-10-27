import { z } from "zod";

/**
 * Device ingestion payload. The current ESP32 sensor test sketch only prints
 * ADC values to Serial — it does not send JSON. This schema describes the
 * future device-reported shape, validated on ingest.
 */
export const ingestReadingSchema = z.object({
  device_id: z.string().min(1),
  // Raw ADC reading (12-bit). Required.
  raw_moisture_value: z.number().int().min(0).max(4095),
  // Optional pre-calculated percentage from the device.
  moisture_percentage: z.number().min(0).max(100).nullable().optional(),
  pump_state: z.boolean().nullable().optional(),
  motor_state: z.boolean().nullable().optional(),
  // Device-reported timestamp (ISO 8601). Validated and kept separate from the
  // server receipt time.
  device_timestamp: z.string().datetime().optional(),
  // Optional battery voltage, only if hardware measures it.
  battery_voltage: z.number().positive().optional(),
});

export type IngestReadingInput = z.infer<typeof ingestReadingSchema>;
