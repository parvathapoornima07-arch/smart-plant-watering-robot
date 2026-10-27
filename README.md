# Smart Plant Watering Robot — Web Platform

A production-ready, responsive website and IoT monitoring dashboard for an
ESP32-based plant watering robot. The system uses an **ESP32 DevKit V1 /
ESP-WROOM-32** as the main controller and an **ESP32-CAM** for camera
communication, with a soil moisture sensor read on **GPIO 36**.

This repository contains:

- `frontend/` — React + Vite + TypeScript + Tailwind dashboard and public site (deploys to **Netlify**)
- `backend/` — Node.js + Express + TypeScript REST API (deploys to **Render**)
- `supabase/migrations/` — SQL schema + Row Level Security policies

The platform is designed to integrate with the hardware later. It never
fabricates live hardware data: the dashboard clearly distinguishes **Live
device**, **Demo data**, and **Offline** states.

---

## Table of contents

- [Features](#features)
- [Technology stack](#technology-stack)
- [System architecture](#system-architecture)
- [Directory structure](#directory-structure)
- [Local installation](#local-installation)
- [Supabase setup](#supabase-setup)
- [Database migrations](#database-migrations)
- [Environment variables](#environment-variables)
- [Frontend startup](#frontend-startup)
- [Backend startup](#backend-startup)
- [Test commands](#test-commands)
- [Netlify deployment](#netlify-frontend-deployment)
- [Render deployment](#render-backend-deployment)
- [Hardware integration guide](#hardware-integration-guide)
- [Device authentication setup](#device-authentication-setup)
- [Moisture calibration guide](#moisture-calibration-guide)
- [Camera integration requirements](#camera-integration-requirements)
- [Watering control](#watering-control)
- [Troubleshooting](#troubleshooting)
- [Known limitations](#known-limitations)
- [Future improvements](#future-improvements)

---

## Features

**Public website:** Home, How It Works, Hardware, Documentation, and a validated
Contact form.

**Authentication:** Supabase Auth registration, login, logout, password reset,
protected dashboard routes, session persistence, and a user profile page. Admin
roles are assigned server-side only — users cannot make themselves admins.

**Dashboard:** soil moisture monitoring, dry/wet calibration, camera section,
robot status, and a clearly-labeled demo mode. Status pills distinguish live,
demo, and offline.

**Secure device integration:** per-device tokens (hashed, peppered, revocable,
rotatable), HTTPS ingest endpoints, server-recomputed moisture percentage, and
heartbeat-based online/offline calculation.

**Watering control (safe):** command queue with duplicate prevention, expiry,
and device acknowledgement. The UI never claims the pump started until the device
acknowledges.

**Admin console:** device registration/revocation, token rotation, event log,
contact messages, and platform overview. Every admin operation is enforced by
the backend.

## Technology stack

| Layer | Stack |
| --- | --- |
| Frontend | React, Vite, TypeScript, Tailwind CSS, Lucide React, Recharts, React Router, Axios |
| Backend | Node.js, Express, TypeScript, Zod, Supabase JS client, Helmet, rate limiting |
| Database | Supabase PostgreSQL, Supabase Auth, Supabase Storage (for camera images) |
| Deployment | Netlify (frontend), Render Web Service (backend) |

MongoDB and Firebase are not used. Supabase is the only database platform.

## System architecture

```
ESP32 firmware  ──HTTPS──▶  Express API (Render)  ──▶  Supabase Postgres
   (device token)             (validates, stores,         (RLS-protected)
                              authorizes)                       │
                                                                ▼
                                              React dashboard (Netlify)
                                              (polling now; Realtime later)
```

- The frontend uses only the public Supabase **anon key** for Auth; RLS governs access.
- The backend uses the **service role key** (server-only, never shipped to clients
  or firmware) and enforces authorization in code.
- Devices authenticate with a per-device token sent in the `X-Device-Token`
  header; only the token hash is stored.

## Directory structure

```
.
├── frontend/
│   ├── src/
│   │   ├── components/   # UI + common + dashboard + layout components
│   │   ├── contexts/     # AuthContext, ToastContext, DashboardContext
│   │   ├── hooks/        # usePolling, useDeviceData
│   │   ├── layouts/      # PublicLayout, DashboardLayout, AdminLayout
│   │   ├── lib/          # env, supabase client, cn, moisture calc, demo data
│   │   ├── pages/        # public, auth, dashboard, admin
│   │   ├── services/     # typed API client + per-domain services
│   │   ├── styles/       # Tailwind + base styles
│   │   └── types/        # shared API types
│   ├── netlify config via root netlify.toml
│   └── .env.example
├── backend/
│   ├── src/
│   │   ├── config/       # env, supabase clients
│   │   ├── controllers/   # route handlers
│   │   ├── middleware/    # auth, admin, deviceAuth, cors, rateLimit, errors
│   │   ├── routes/        # all API routes
│   │   ├── schemas/       # Zod validation schemas
│   │   ├── services/      # (thin — DB access via utils/db)
│   │   ├── test/          # mock helpers
│   │   ├── types/         # DB row + request types
│   │   └── utils/         # device tokens, moisture, errors, db, logger, time
│   ├── vitest.config.ts
│   └── .env.example
├── supabase/migrations/  # 0001 schema + 0002 RLS
├── netlify.toml
├── render.yaml
└── README.md
```

## Local installation

Requirements: Node.js 18+ and npm.

```bash
# from the repo root (npm workspaces)
npm install
```

You need a Supabase project (free tier works). Create one at
https://supabase.com and note the **Project URL**, **anon key**, and
**service role key** from *Project Settings → API*.

## Supabase setup

1. Create a Supabase project.
2. In the SQL Editor, run `supabase/migrations/0001_init_schema.sql`, then
   `supabase/migrations/0002_rls_policies.sql`.
3. (Optional) To make yourself an admin, run in the SQL Editor:

```sql
insert into public.user_roles (user_id, role)
values ('YOUR-AUTH-USER-UUID', 'admin')
on conflict (user_id) do update set role = 'admin';
```

Roles are never assignable through the public UI or API.

## Database migrations

Migrations are plain SQL files in `supabase/migrations/`. Apply them in order
via the Supabase SQL Editor, or with the Supabase CLI:

```bash
supabase db push
```

The schema auto-creates a `profiles` row and a `user` role for every new
auth user via a trigger on `auth.users`.

## Environment variables

Copy each `.env.example` to `.env` and fill in the values. **Never commit
`.env` files** (they are gitignored).

**Frontend** (`frontend/.env.example`):

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Netlify / local | Backend base URL |
| `VITE_SUPABASE_URL` | Netlify / local | Public Supabase URL (Auth client) |
| `VITE_SUPABASE_ANON_KEY` | Netlify / local | Public anon key (browser-safe) |

**Backend** (`backend/.env.example`): see the file. Critical ones:

| Variable | Purpose |
| --- | --- |
| `PORT` | Express port (Render injects this) |
| `NODE_ENV` | `production` on Render |
| `FRONTEND_URL` | Default CORS origin (dev) |
| `ALLOWED_ORIGINS` | Comma-separated production origins (your Netlify URL) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only.** Never ship to frontend/device |
| `DEVICE_TOKEN_PEPPER` | Secret used to hash device tokens |

> `SUPABASE_JWT_SECRET` is optional and only used if you choose the legacy
> shared-secret JWT verification path. The recommended approach verifies
> tokens via the Supabase client (`auth.getUser(token)`), which is what this
> backend does.

## Frontend startup

```bash
cd frontend
cp .env.example .env      # then edit values
npm run dev                # http://localhost:5173
```

Build: `npm run build`. Preview the production build: `npm run preview`.

## Backend startup

```bash
cd backend
cp .env.example .env       # then edit values (needs Supabase keys)
npm run dev                # http://localhost:8080
```

Build: `npm run build`. Start the compiled server: `npm start` (runs
`node dist/index.js`, listens on `PORT`).

## Test commands

```bash
# from the repo root
npm run test           # runs backend then frontend tests
npm run test:backend
npm run test:frontend

# type checking
npm run typecheck      # both workspaces

# lint (frontend)
npm run lint:frontend
```

Backend tests use Vitest + Supertest with an in-process mock for Supabase, so
they run without a live database. They cover: health, CORS, auth middleware,
admin authorization, device token verification, invalid/valid sensor reading
ingestion, calibration validation, moisture calculation, command creation +
duplicate prevention + expiry, image upload validation, and contact form
validation. Frontend tests cover loading, error, empty, and demo states.

## Netlify frontend deployment

1. Push the repository to GitHub.
2. In Netlify, **Add new site → Import an existing project** and pick the repo.
3. Set the **base directory** to `frontend` (the monorepo layout).
4. Build command: `npm run build`. Publish directory: `dist` (these are already
   in `netlify.toml`).
5. Add environment variables in Netlify (Site settings → Environment):
   `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
6. Deploy and test the public site. The SPA redirect in `netlify.toml` keeps
   React Router routes working on refresh.

## Render backend deployment

1. In Render, **New → Web Service** and connect the GitHub repo (or use the
   included `render.yaml` Blueprint).
2. Set the **root directory** to `backend`.
3. Build command: `npm install && npm run build`.
   Start command: `npm start`.
4. Add the environment variables from `backend/.env.example`. Set
   `ALLOWED_ORIGINS` to your Netlify URL and `NODE_ENV=production`.
5. Deploy. Render exposes `GET /api/health` as the health check.
6. Copy the Render URL (e.g. `https://your-backend.onrender.com`) into
   Netlify's `VITE_API_BASE_URL` and **redeploy the frontend**.
7. Test frontend→backend communication (e.g. the contact form or `/api/health`).

## Hardware integration guide

The firmware you already have and the firmware required for cloud connectivity
are different. See **`docs/HARDWARE_INTEGRATION.md`** for the full explanation.

Summary of what exists vs. what's needed:

- **Existing:** soil moisture test sketch (reads GPIO 36, averages 20 readings
  with a 300 ms delay, prints ADC to Serial Monitor); dry/wet reference
  commands; an ESP32↔ESP32-CAM serial bridge that forwards bytes.
- **Required for cloud:** HTTPS POST of authenticated JSON to the backend
  ingest endpoint, sending the `X-Device-Token` header, periodic heartbeats,
  and (separately) camera capture + image upload to Supabase Storage.

The serial bridge only forwards bytes — it does **not** capture or upload
images, and it does **not** send JSON to a server.

## Device authentication setup

1. Sign in as an admin and open the Admin console → Devices.
2. Register a device (device ID + name). The **token is shown once** — copy
   it immediately. The backend stores only a peppered HMAC hash.
3. Put the token in the ESP32 firmware as a secret (not in the public repo).
   Send it in the `X-Device-Token` header on every ingest request.
4. To revoke a device: use **Revoke** (all its tokens stop working immediately).
5. To issue a new credential: use **Rotate token** (old tokens are revoked,
   a new one-time token is issued).

Device tokens are long-lived, high-entropy, and never embedded in the browser
or stored in plaintext. Use HTTPS in production.

## Moisture calibration guide

1. In the Arduino Serial Monitor, send `D` with **dry** sand to record the dry
   average (20 readings, 300 ms apart).
2. Send `W` with **wet** sand to record the wet average.
3. In the dashboard → Calibration, enter the two averages and a watering
   threshold (%). Save. These are recorded as **manually entered**.
4. The percentage is a **calibrated estimate**, not a lab soil-water measurement.
   The formula handles both sensor polarities automatically (higher-when-dry
   and higher-when-wet), and clamps to 0–100%.

> A browser button cannot run the Arduino `D`/`W` Serial commands on the ESP32
> directly. Until a local serial integration exists, enter the printed averages
> manually.

## Camera integration requirements

The intended mode is periodic photo capture (~30–60 s). The serial bridge does
**not** capture or upload images. Implement, separately:

1. Camera capture in ESP32-CAM firmware.
2. Image transfer to the backend (or direct upload to Supabase Storage with a
   presigned path).
3. An authenticated call to `POST /api/device-ingest/images` with the
   `X-Device-Token` header and the image metadata (storage path, captured time).

The dashboard shows a clear **empty state** until images arrive — it never
fabricates a camera feed.

## Watering control

- Configure the moisture threshold in calibration.
- Requesting water creates a **command** in the database; the UI does **not**
  claim the pump started until the device acknowledges.
- The ESP32 firmware must enforce max pump runtime and a safe default state
  independently of the website (fail-safe on connectivity loss).
- Do **not** enable automatic watering until calibration, control logic, pump
  wiring, and firmware safety behavior are verified.

## Troubleshooting

- **`npm` fails with a script-execution error on Windows:** use `npm.cmd`
  instead of `npm`, or relax the PowerShell execution policy for your user.
- **Backend returns 401 on protected routes:** the Supabase access token is
  missing or expired; sign in again. The frontend auto-attaches the token.
- **CORS errors in the browser:** set `ALLOWED_ORIGINS` to your exact Netlify
  URL on Render and redeploy the backend.
- **Health shows `degraded`:** the backend can't reach Supabase (missing keys).
  Check `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`.
- **Device shows offline:** no heartbeat within the threshold
  (`DEVICE_ONLINE_THRESHOLD_MINUTES`, default 5). Update the firmware to call
  `POST /api/device-ingest/heartbeat` with the device token.
- **Moisture shows "Uncalibrated":** set dry/wet references in Calibration.

## Known limitations

- Camera capture/upload is not yet implemented in firmware.
- Cloud reporting from the ESP32 is not yet implemented in firmware.
- Battery level is not reported (no measurement circuit in this build).
- The moisture percentage is a calibrated estimate, not a lab measurement.
- Polling is used to refresh the dashboard; Supabase Realtime is a future item.
- The frontend currently lets admins read device data; per-user device grants
  are a future enhancement.

## Future improvements

- Supabase Realtime subscriptions instead of polling.
- Periodic ESP32-CAM capture and image history.
- Automatic watering with firmware-enforced safety limits.
- Device command polling/ack channel on the ESP32.
- Battery monitoring with a measurement circuit.
- Per-user device grants and a public device-sharing model.

---

See `docs/HARDWARE_INTEGRATION.md` for the firmware-vs-cloud guide and
`DEPLOYMENT.md`-style sections above for Netlify/Render. Environment variables
to configure in each service are listed in the [Environment variables](#environment-variables)
section.
