import type { RequestHandler } from "express";
import { isSupabaseConfigured } from "../config/supabase";
import { config } from "../config/env";

export const getHealth: RequestHandler = (_req, res) => {
  const status = isSupabaseConfigured() ? "ok" : "degraded";
  res.json({
    status,
    service: "smart-plant-watering-backend",
    time: new Date().toISOString(),
    version: config.nodeEnv,
  });
};
