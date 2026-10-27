# Hardware Integration Guide — existing firmware vs. cloud firmware

This guide explains how the ESP32 firmware you already have differs from the
firmware required to connect the Smart Plant Watering Robot to this web
platform. Read this before wiring anything to the cloud.

## What you have today

### 1. Soil moisture sensor test sketch
- Reads the soil moisture sensor on **GPIO 36** using the ESP32's 12-bit ADC
  (nominally 0–4095).
- Takes **20 readings with a 300 ms delay** between each and prints the
  **average** to the Arduino Serial Monitor.
- Accepts `D` (dry) and `W` (wet) commands to capture dry/wet reference
  averages for calibration.

### 2. ESP32 ↔ ESP32-CAM serial bridge
- Forwards bytes between the computer's USB serial connection and the
  ESP32-CAM over **UART2**.
- Moves bytes only. It does **not** capture images and does **not** send JSON
  to a server.

## What cloud connectivity requires

The test sketch only prints ADC values to Serial Monitor. It does **not** POST
JSON to a server. To connect the robot to this backend you need firmware that
does the following, none of which exists yet:

### Required firmware changes

1. **Wi-Fi connection.** Join a network and (ideally) keep a reconnect loop.
2. **HTTPS client.** Use `WiFiClientSecure` (or `HTTPClient` with TLS) to POST
   to `https://<your-backend>/api/device-ingest/readings`.
3. **Device token.** Store the per-device token as a firmware secret and send
   it in the `X-Device-Token` request header. Never embed the Supabase
   service-role key in firmware — the device token is the only credential the
   ESP32 should hold.
4. **Device identity.** Send `device_id` in the JSON body (or the
   `X-Device-Id` header).
5. **Reading payload.** POST a body like:
   ```json
   {
     "device_id": "esp32-robot-01",
     "raw_moisture_value": 2148,
     "pump_state": false,
     "motor_state": false,
     "device_timestamp": "2026-10-27T09:00:00Z"
   }
   ```
   `raw_moisture_value` is required (integer 0–4095). The backend **recomputes**
   the moisture percentage from your saved calibration, so you don't need to
   send it.
6. **Heartbeats.** Call `POST /api/device-ingest/heartbeat` (same device
   header) periodically so the dashboard can compute online/offline.
7. **Optional fields.** Send `battery_voltage` only if your hardware actually
   measures voltage. Do not invent it.

### What you must NOT do
- Do not embed the Supabase service-role key in firmware.
- Do not expose the device token in the browser or commit it to a public repo.
- Do not label simulated/Serial-only data as "live" on the dashboard.
- Do not enable automatic watering until calibration, control logic, pump
   wiring, and firmware safety behavior are verified.

## Camera (ESP32-CAM)

The serial bridge does not capture or upload images. To show camera images on
the dashboard you need, separately:

1. **Capture:** firmware that periodically takes a photo (intended ~30–60 s).
2. **Transfer:** upload the JPEG to Supabase Storage (or send it to the
   backend, which places it in Storage).
3. **Metadata ingest:** call `POST /api/device-ingest/images` with the device
   token and the image metadata:
   ```json
   {
     "device_id": "esp32-robot-01",
     "storage_path": "images/esp32-robot-01/2026-10-27T090000.jpg",
     "captured_at": "2026-10-27T09:00:00Z",
     "public_url": "https://<supabase-storage>/<signed-url>"
   }
   ```

Until this is implemented, the dashboard shows a clear **empty state** — never
a fabricated feed.

## Watering control (pump)

The website can request watering, but a website button does **not** imply the
physical pump started. The flow is:

1. An admin/user requests a command → the backend stores it as `pending` with
   an `expires_at` (default 5 minutes).
2. The ESP32 must **poll** `GET /api/devices/<id>/commands` (authenticated as
   the device, or via a future secure command channel) to pick up pending
   commands.
3. On receipt, the firmware runs the pump **with a firmware-enforced max
   runtime** and safe default state, then calls
   `POST /api/device-ingest/commands/<commandId>/ack` with
   `{"status": "acknowledged"}` and finally `{"status": "completed"}`.
4. If the device never acknowledges before `expires_at`, the backend marks the
   command `expired`.

The ESP32 firmware must enforce maximum pump runtime and fail-safe shutdown
independently of the website. Do not enable automatic watering until the
sensor calibration, control logic, pump wiring, and firmware safety behavior
are verified.

## Mapping: existing feature → required work

| Existing | Required for cloud |
| --- | --- |
| Reads GPIO 36, averages 20 readings | Same, plus POST the average to the backend |
| `D` / `W` Serial commands for references | Keep for calibration; enter averages in the dashboard (manual entry) |
| Serial bridge forwards bytes | Not used for cloud reporting; separate HTTPS client needed |
| — | Wi-Fi + HTTPS + device token + heartbeats |
| — | Camera capture + Storage upload + metadata ingest |
| — | Command polling + acknowledgement + firmware fail-safe |

## Endpoint reference (device-authenticated)

All device endpoints require the `X-Device-Token` header and a `device_id`
(in the body or the `X-Device-Id` header).

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/device-ingest/readings` | Report a sensor reading |
| POST | `/api/device-ingest/heartbeat` | Liveness ping (updates last_seen) |
| POST | `/api/device-ingest/images` | Report a captured image's metadata |
| POST | `/api/device-ingest/commands/:id/ack` | Acknowledge a watering command |

See the backend `src/routes/index.ts` for the full route list and the Zod
schemas in `backend/src/schemas/` for exact payload shapes.
