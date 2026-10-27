import { vi, beforeEach } from "vitest";

/**
 * Test setup. We silence console noise from the logger/morgan during tests by
 * default, but allow tests to re-enable it when needed.
 */
beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "info").mockImplementation(() => undefined);
});
