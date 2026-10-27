import { z } from "zod";

export const registerDeviceSchema = z.object({
  deviceId: z
    .string()
    .trim()
    .min(3, "Device ID is too short.")
    .max(80, "Device ID is too long.")
    .regex(/^[A-Za-z0-9_-]+$/, "Device ID may contain letters, numbers, hyphens, underscores."),
  name: z.string().trim().min(2, "Name is too short.").max(120),
});

export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;

export const updateDeviceSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  status: z.enum(["online", "offline", "unknown"]).optional(),
});

export type UpdateDeviceInput = z.infer<typeof updateDeviceSchema>;

export const deviceIdParamSchema = z.object({
  deviceId: z.string().min(1),
});
