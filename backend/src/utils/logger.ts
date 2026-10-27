/**
 * Minimal structured logger. Avoids logging secrets — callers must not pass
 * passwords, tokens, or keys to `log`. Request logging uses morgan with a
 * non-body format, so request/response bodies (which may contain secrets) are
 * never written out.
 */
type Level = "info" | "warn" | "error";

function emit(level: Level, message: string, meta?: Record<string, unknown>) {
  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...meta,
  };
  // Render compact JSON; fall back to string for nested objects.
  try {
    const line = JSON.stringify(entry);
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
  } catch {
    console.log(`[${level}] ${message}`);
  }
}

export const log = {
  info: (m: string, meta?: Record<string, unknown>) => emit("info", m, meta),
  warn: (m: string, meta?: Record<string, unknown>) => emit("warn", m, meta),
  error: (m: string, meta?: Record<string, unknown>) => emit("error", m, meta),
};
