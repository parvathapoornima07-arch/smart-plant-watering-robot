import express, { type Express } from "express";
import helmet from "helmet";
import { corsMiddleware } from "./middleware/cors";
import { requestLogger } from "./middleware/requestLogger";
import { notFoundHandler } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";
import { config } from "./config/env";

export function createApp(): Express {
  const app = express();

  // Trust proxy headers from Render's load balancer (for req.ip, rate-limit IP).
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  // Security headers.
  app.use(helmet());

  // CORS (explicitly configured origins, never unrestricted in prod).
  app.use(corsMiddleware);
  app.options("*", corsMiddleware);

  // Request logging (no bodies, so no secrets).
  app.use(requestLogger(config.isTest));

  // Body parsing with a sane size limit (rejects oversized requests).
  app.use(express.json({ limit: "256kb" }));
  app.use(express.urlencoded({ extended: true, limit: "256kb" }));

  // API routes.
  app.use("/api", routes);

  // 404 + centralized error handler.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
