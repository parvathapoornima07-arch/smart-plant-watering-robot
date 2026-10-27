-- =============================================================================
-- Smart Plant Watering Robot — initial schema
-- =============================================================================
-- Run via Supabase SQL editor or `supabase db push`. This migration creates all
-- tables, indexes, and constraints. RLS policies live in 0002_rls_policies.sql.
-- The backend uses the SERVICE ROLE key to read/write these tables and enforces
-- authorization in code; RLS protects direct client access via the anon key.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: one row per authenticated user (mirrors auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- user_roles: server-assigned roles. Never client-writable.
-- ---------------------------------------------------------------------------
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','admin')),
  created_at timestamptz not null default now(),
  unique (user_id)
);

-- ---------------------------------------------------------------------------
-- devices: registered physical devices
-- ---------------------------------------------------------------------------
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  device_id text not null unique,
  name text not null,
  status text not null default 'unknown' check (status in ('online','offline','unknown','revoked')),
  last_seen_at timestamptz,
  firmware_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists devices_status_idx on public.devices(status);

-- ---------------------------------------------------------------------------
-- device_credentials: hashed device tokens. Plaintext is never stored.
-- ---------------------------------------------------------------------------
create table if not exists public.device_credentials (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  token_hash text not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists device_credentials_device_idx on public.device_credentials(device_id);
create index if not exists device_credentials_active_idx on public.device_credentials(device_id) where revoked_at is null;

-- ---------------------------------------------------------------------------
-- sensor_calibrations: dry/wet references + threshold per device
-- ---------------------------------------------------------------------------
create table if not exists public.sensor_calibrations (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  dry_reference int not null check (dry_reference between 0 and 4095),
  wet_reference int not null check (wet_reference between 0 and 4095),
  watering_threshold numeric(5,2) not null check (watering_threshold between 0 and 100),
  manual_entry boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (dry_reference <> wet_reference)
);
create index if not exists sensor_calibrations_device_idx on public.sensor_calibrations(device_id);

-- ---------------------------------------------------------------------------
-- sensor_readings: device-reported ADC readings
-- ---------------------------------------------------------------------------
create table if not exists public.sensor_readings (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  raw_moisture_value int not null check (raw_moisture_value between 0 and 4095),
  moisture_percentage numeric(5,1),
  pump_state boolean,
  motor_state boolean,
  device_timestamp timestamptz,
  received_at timestamptz not null default now()
);
create index if not exists sensor_readings_device_received_idx on public.sensor_readings(device_id, received_at desc);
create index if not exists sensor_readings_received_idx on public.sensor_readings(received_at desc);

-- ---------------------------------------------------------------------------
-- device_events: append-only event log per device
-- ---------------------------------------------------------------------------
create table if not exists public.device_events (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  event_type text not null,
  message text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists device_events_device_created_idx on public.device_events(device_id, created_at desc);

-- ---------------------------------------------------------------------------
-- watering_commands: queued watering commands with acknowledgement + expiry
-- ---------------------------------------------------------------------------
create table if not exists public.watering_commands (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  requested_by uuid references auth.users(id) on delete set null,
  command_type text not null check (command_type in ('manual_water','auto_water_on','auto_water_off')),
  status text not null default 'pending' check (status in ('pending','acknowledged','completed','expired','failed')),
  duration_seconds int check (duration_seconds is null or (duration_seconds between 1 and 300)),
  requested_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz not null
);
create index if not exists watering_commands_device_idx on public.watering_commands(device_id, requested_at desc);
create index if not exists watering_commands_pending_idx on public.watering_commands(device_id) where status in ('pending','acknowledged');

-- ---------------------------------------------------------------------------
-- camera_images: metadata for ESP32-CAM captures
-- ---------------------------------------------------------------------------
create table if not exists public.camera_images (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  storage_path text not null,
  public_url text,
  captured_at timestamptz,
  received_at timestamptz not null default now()
);
create index if not exists camera_images_device_received_idx on public.camera_images(device_id, received_at desc);

-- ---------------------------------------------------------------------------
-- contact_messages: public contact form submissions
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);
create index if not exists contact_messages_created_idx on public.contact_messages(created_at desc);

-- ---------------------------------------------------------------------------
-- Auto-create a profile row when a new auth user signs up. Display name comes
-- from the user_metadata captured at registration (display_name).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', new.email))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'user')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
