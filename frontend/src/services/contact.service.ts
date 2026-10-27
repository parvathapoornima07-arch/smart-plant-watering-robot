import { apiPost } from "./api";

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/** Public contact form submission. Rate-limited on the backend. */
export async function submitContact(payload: ContactPayload): Promise<{ ok: true }> {
  return apiPost("/api/contact", payload);
}
