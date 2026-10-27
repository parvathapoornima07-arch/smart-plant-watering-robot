import { Router } from "express";

// Controllers
import { getHealth } from "../controllers/health.controller";
import { getProfile, updateProfile } from "../controllers/profile.controller";
import {
  listDevices,
  getDevice,
  createDevice,
  updateDevice,
  revokeDevice,
  rotateDeviceToken,
} from "../controllers/devices.controller";
import {
  listReadings,
  getLatestReading,
  ingestReading,
  heartbeat,
} from "../controllers/readings.controller";
import { getCalibration, saveCalibration } from "../controllers/calibration.controller";
import { listCommands, createCommand, ackCommand } from "../controllers/commands.controller";
import { listImages, getLatestImage, ingestImage } from "../controllers/camera.controller";
import { listEvents } from "../controllers/events.controller";
import { submitContact } from "../controllers/contact.controller";
import {
  getOverview,
  getAdminDevices,
  getAdminEvents,
  getAdminContactMessages,
} from "../controllers/admin.controller";

// Middleware
import { requireUser } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";
import { requireDevice } from "../middleware/deviceAuth";
import { apiLimiter, contactLimiter, deviceIngestLimiter } from "../middleware/rateLimit";

const router = Router();

// Health (public, no rate limit concerns beyond default)
router.get("/health", getHealth);

// Auth / profile (require an authenticated user)
router.get("/profile", requireUser, getProfile);
router.patch("/profile", requireUser, updateProfile);

// Devices
router.get("/devices", apiLimiter, requireUser, listDevices);
router.get("/devices/:deviceId", apiLimiter, requireUser, getDevice);
router.post("/devices", apiLimiter, requireUser, requireAdmin, createDevice);
router.patch("/devices/:deviceId", apiLimiter, requireUser, requireAdmin, updateDevice);
router.post("/devices/:deviceId/revoke", apiLimiter, requireUser, requireAdmin, revokeDevice);
router.post("/devices/:deviceId/rotate-token", apiLimiter, requireUser, requireAdmin, rotateDeviceToken);

// Sensor readings (user-facing reads, device-authenticated ingest)
router.get("/devices/:deviceId/readings", apiLimiter, requireUser, listReadings);
router.get("/devices/:deviceId/latest-reading", apiLimiter, requireUser, getLatestReading);
router.post(
  "/device-ingest/readings",
  deviceIngestLimiter,
  requireDevice,
  ingestReading
);
router.post("/device-ingest/heartbeat", deviceIngestLimiter, requireDevice, heartbeat);

// Calibration
router.get("/devices/:deviceId/calibration", apiLimiter, requireUser, getCalibration);
router.put("/devices/:deviceId/calibration", apiLimiter, requireUser, saveCalibration);

// Commands
router.get("/devices/:deviceId/commands", apiLimiter, requireUser, listCommands);
router.post("/devices/:deviceId/commands", apiLimiter, requireUser, createCommand);
router.post(
  "/device-ingest/commands/:commandId/ack",
  deviceIngestLimiter,
  requireDevice,
  ackCommand
);

// Camera
router.get("/devices/:deviceId/images", apiLimiter, requireUser, listImages);
router.get("/devices/:deviceId/latest-image", apiLimiter, requireUser, getLatestImage);
router.post("/device-ingest/images", deviceIngestLimiter, requireDevice, ingestImage);

// Events
router.get("/devices/:deviceId/events", apiLimiter, requireUser, listEvents);

// Contact (public, stricter limiter)
router.post("/contact", contactLimiter, submitContact);

// Admin
router.get("/admin/overview", apiLimiter, requireUser, requireAdmin, getOverview);
router.get("/admin/devices", apiLimiter, requireUser, requireAdmin, getAdminDevices);
router.get("/admin/events", apiLimiter, requireUser, requireAdmin, getAdminEvents);
router.get("/admin/contact-messages", apiLimiter, requireUser, requireAdmin, getAdminContactMessages);

export default router;
