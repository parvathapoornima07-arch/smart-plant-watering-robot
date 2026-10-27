import { z } from "zod";

export const calibrationSchema = z
  .object({
    dry_reference: z.number().int().min(0).max(4095),
    wet_reference: z.number().int().min(0).max(4095),
    watering_threshold: z.number().min(0).max(100),
    manual_entry: z.boolean().default(true),
  })
  .refine((d) => d.dry_reference !== d.wet_reference, {
    message: "Dry and wet references must differ.",
    path: ["wet_reference"],
  });

export type CalibrationInput = z.infer<typeof calibrationSchema>;
