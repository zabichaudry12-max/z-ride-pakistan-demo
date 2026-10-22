-- Z Ride Pakistan SQL schema for Supabase
-- This file is safe to run in a fresh Supabase project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role text not null default 'passenger' check (role in ('passenger', 'driver', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.driver_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  applicant_name text not null,
  phone text not null,
  vehicle_make text,
  vehicle_model text,
  vehicle_number text,
  license_number text,
  id_document_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.profiles(id) on delete cascade,
  make text not null,
  model text not null,
  registration_number text not null,
  color text,
  insured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.ride_requests (
  id uuid primary key default gen_random_uuid(),
  passenger_id uuid not null references public.profiles(id) on delete cascade,
  pickup_location text not null,
  destination_location text not null,
  proposed_fare numeric(10,2) not null check (proposed_fare > 0),
  status text not null default 'new' check (status in ('new', 'offers', 'accepted', 'driver_arrived', 'trip_started', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  assigned_driver_offer_id uuid
);

create table if not exists public.ride_offers (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.ride_requests(id) on delete cascade,
  driver_id uuid not null references public.profiles(id) on delete cascade,
  offered_fare numeric(10,2) not null check (offered_fare > 0),
  driver_comment text,
  eta_minutes integer not null default 10,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.rides (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.ride_requests(id) on delete cascade,
  driver_id uuid not null references public.profiles(id) on delete cascade,
  passenger_id uuid not null references public.profiles(id) on delete cascade,
  accepted_fare numeric(10,2) not null,
  status text not null default 'accepted' check (status in ('accepted', 'driver_arrived', 'trip_started', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  passenger_id uuid not null references public.profiles(id) on delete cascade,
  driver_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null check (score between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  ride_id uuid references public.rides(id) on delete set null,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.driver_applications enable row level security;
alter table public.vehicles enable row level security;
alter table public.ride_requests enable row level security;
alter table public.ride_offers enable row level security;
alter table public.rides enable row level security;
alter table public.ratings enable row level security;
alter table public.complaints enable row level security;

create or replace function public.assign_ride_offer(request_id uuid, offer_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_status text;
  existing_offer uuid;
begin
  select status into current_status from public.ride_requests where id = request_id for update;

  if current_status is null then
    raise exception 'Ride request not found';
  end if;

  if current_status in ('accepted', 'driver_arrived', 'trip_started', 'completed', 'cancelled') then
    raise exception 'Ride is already assigned or closed';
  end if;

  select id into existing_offer
  from public.ride_offers
  where request_id = request_id and status = 'accepted'
  limit 1;

  if existing_offer is not null and existing_offer <> offer_id then
    raise exception 'Another driver has already been assigned to this ride';
  end if;

  update public.ride_requests
  set status = 'accepted', assigned_driver_offer_id = offer_id
  where id = request_id and status in ('new', 'offers');

  update public.ride_offers
  set status = case when id = offer_id then 'accepted' else 'rejected' end
  where request_id = request_id;
end;
$$;

create policy "profiles_select_own_or_admin"
on public.profiles
for select
using (
  auth.uid() = id
  or exists (
    select 1 from public.profiles admin
    where admin.id = auth.uid() and admin.role = 'admin'
  )
);

create policy "profiles_update_own_or_admin"
on public.profiles
for update
using (
  auth.uid() = id
  or exists (
    select 1 from public.profiles admin
    where admin.id = auth.uid() and admin.role = 'admin'
  )
);

create policy "driver_applications_select_own_or_admin"
on public.driver_applications
for select
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.profiles admin
    where admin.id = auth.uid() and admin.role = 'admin'
  )
);

create policy "driver_applications_insert_own"
on public.driver_applications
for insert
with check (auth.uid() = user_id);

create policy "driver_applications_update_admin_only"
on public.driver_applications
for update
using (
  exists (
    select 1 from public.profiles admin
    where admin.id = auth.uid() and admin.role = 'admin'
  )
);

create policy "vehicles_select_driver_or_admin"
on public.vehicles
for select
using (
  auth.uid() = driver_id
  or exists (
    select 1 from public.profiles admin
    where admin.id = auth.uid() and admin.role = 'admin'
  )
);

create policy "vehicles_insert_driver_only"
on public.vehicles
for insert
with check (auth.uid() = driver_id);

create policy "ride_requests_select_owner_or_admin"
on public.ride_requests
for select
using (
  auth.uid() = passenger_id
  or exists (
    select 1 from public.profiles admin
    where admin.id = auth.uid() and admin.role = 'admin'
  )
);

create policy "ride_requests_insert_passenger_only"
on public.ride_requests
for insert
with check (auth.uid() = passenger_id);

create policy "ride_requests_update_owner_or_admin"
on public.ride_requests
for update
using (
  auth.uid() = passenger_id
  or exists (
    select 1 from public.profiles admin
    where admin.id = auth.uid() and admin.role = 'admin'
  )
);

create policy "ride_offers_select_driver_or_owner_or_admin"
on public.ride_offers
for select
using (
  auth.uid() = driver_id
  or exists (
    select 1 from public.ride_requests r
    where r.id = request_id and r.passenger_id = auth.uid()
  )
  or exists (
    select 1 from public.profiles admin
    where admin.id = auth.uid() and admin.role = 'admin'
  )
);

create policy "ride_offers_insert_driver_only"
on public.ride_offers
for insert
with check (auth.uid() = driver_id);

create policy "ride_offers_update_driver_or_admin"
on public.ride_offers
for update
using (
  auth.uid() = driver_id
  or exists (
    select 1 from public.profiles admin
    where admin.id = auth.uid() and admin.role = 'admin'
  )
);

create policy "rides_select_participant_or_admin"
on public.rides
for select
using (
  auth.uid() = passenger_id
  or auth.uid() = driver_id
  or exists (
    select 1 from public.profiles admin
    where admin.id = auth.uid() and admin.role = 'admin'
  )
);

create policy "rides_insert_driver_or_passenger"
on public.rides
for insert
with check (
  auth.uid() = passenger_id or auth.uid() = driver_id
);

create policy "ratings_select_ride_participant_or_admin"
on public.ratings
for select
using (
  auth.uid() = passenger_id
  or auth.uid() = driver_id
  or exists (
    select 1 from public.profiles admin
    where admin.id = auth.uid() and admin.role = 'admin'
  )
);

create policy "complaints_insert_any_authenticated_user"
on public.complaints
for insert
with check (auth.uid() = created_by);

create policy "complaints_admin_access"
on public.complaints
for select
using (
  exists (
    select 1 from public.profiles admin
    where admin.id = auth.uid() and admin.role = 'admin'
  )
);

create policy "complaints_update_admin_only"
on public.complaints
for update
using (
  exists (
    select 1 from public.profiles admin
    where admin.id = auth.uid() and admin.role = 'admin'
  )
);

create index if not exists idx_ride_requests_status on public.ride_requests(status);
create index if not exists idx_ride_offers_request on public.ride_offers(request_id);
create index if not exists idx_rides_driver on public.rides(driver_id);
create index if not exists idx_complaints_status on public.complaints(status);

comment on table public.driver_applications is 'Driver application records. Identity documents should remain private and never be exposed publicly.';
comment on function public.assign_ride_offer is 'Prevents a ride from being assigned to more than one driver by using a guarded transaction-like guard.';
