import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is too short.").max(100, "Name is too long."),
  email: z.string().trim().email("Enter a valid email.").max(200),
  subject: z.string().trim().min(3, "Subject is too short.").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters.").max(5000),
});

export type ContactInput = z.infer<typeof contactSchema>;
