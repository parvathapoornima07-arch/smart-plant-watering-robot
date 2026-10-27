import { createApp } from "./app";
import { config } from "./config/env";
import { log } from "./utils/logger";

const app = createApp();

const server = app.listen(config.port, () => {
  log.info("Backend started", { port: config.port, env: config.nodeEnv });
});

server.on("error", (err) => {
  log.error("Server error", { message: err.message });
  process.exit(1);
});

// Graceful shutdown.
let shuttingDown = false;
function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  log.info("Shutting down", { signal });
  server.close(() => {
    log.info("Server closed");
    process.exit(0);
  });
  // Force exit after 10s if connections linger.
  setTimeout(() => {
    log.warn("Forcing shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export { app, server };
