-- =============================================================================
-- Smart Plant Watering Robot — Row Level Security
-- =============================================================================
-- Policy model:
--   - The Express backend uses the SERVICE ROLE key, which bypasses RLS, and
--     enforces authorization in application code.
--   - Clients (browser) use the anon key. RLS restricts what they can touch:
--       * profiles: a user may read/update ONLY their own row.
--       * user_roles: a user may read ONLY their own role. NEVER insert/update
--         from clients (roles are assigned server-side).
--       * all device/reading/calibration/command/image/event/contact tables:
--         NO anonymous or client access. The backend mediates everything.
--   - Anonymous users may do nothing except what the backend performs for the
--     public contact endpoint (handled server-side with the service role key).
-- =============================================================================

-- Enable RLS on every table.
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.devices enable row level security;
alter table public.device_credentials enable row level security;
alter table public.sensor_calibrations enable row level security;
alter table public.sensor_readings enable row level security;
alter table public.device_events enable row level security;
alter table public.watering_commands enable row level security;
alter table public.camera_images enable row level security;
alter table public.contact_messages enable row level security;

-- ---------------------------------------------------------------------------
-- profiles: own-row access only
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- A user may insert only their own profile row (handled by trigger, but allow
-- defensively).
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- user_roles: read own role only. No client writes.
-- ---------------------------------------------------------------------------
drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own" on public.user_roles
  for select using (auth.uid() = user_id);

-- No insert/update/delete policies: only the service role (backend) can modify
-- roles, which it does via the service role key (RLS bypassed).

-- ---------------------------------------------------------------------------
-- All device-related tables: NO direct client access.
-- (No policies = no access for anon/authenticated via the anon key. The backend
--  accesses these via the service role key.)
-- ---------------------------------------------------------------------------
-- devices, device_credentials, sensor_calibrations, sensor_readings,
-- device_events, watering_commands, camera_images, contact_messages:
-- intentionally no permissive policies.

-- Optional: allow an authenticated user to read a boolean "am I an admin?" via a
-- SECURITY DEFINER function without exposing the whole table.
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'
  );
$$;
