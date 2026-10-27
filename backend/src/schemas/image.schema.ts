import { z } from "zod";

/**
 * Image metadata ingestion. The ESP32-CAM may upload the binary via a separate
 * multipart endpoint, or may have already placed the file in Supabase Storage
 * and only report the storage path. This schema covers the metadata-only case.
 */
export const ingestImageSchema = z.object({
  device_id: z.string().min(1),
  storage_path: z.string().min(1).max(500),
  captured_at: z.string().datetime().optional(),
  // Optional pre-uploaded public URL (e.g. signed URL from Storage).
  public_url: z.string().url().optional(),
});

export type IngestImageInput = z.infer<typeof ingestImageSchema>;
