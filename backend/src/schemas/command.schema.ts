import { z } from "zod";

export const createCommandSchema = z
  .object({
    command_type: z.enum(["manual_water", "auto_water_on", "auto_water_off"]),
    duration_seconds: z.number().int().positive().max(300, "Max watering duration is 300 seconds.").optional(),
  })
  .refine(
    (d) => d.command_type !== "manual_water" || d.duration_seconds !== undefined,
    { message: "manual_water requires duration_seconds.", path: ["duration_seconds"] }
  );

export type CreateCommandInput = z.infer<typeof createCommandSchema>;

export const ackCommandSchema = z.object({
  status: z.enum(["acknowledged", "completed", "failed"]),
  executed_at: z.string().datetime().optional(),
  message: z.string().max(500).optional(),
});

export type AckCommandInput = z.infer<typeof ackCommandSchema>;
