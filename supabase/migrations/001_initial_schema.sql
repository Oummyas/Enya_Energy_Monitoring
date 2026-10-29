-- Enya Energy Monitoring: initial schema
-- Run this once in the Supabase dashboard (SQL Editor).

-- ---------------------------------------------------------------------------
-- Apartments
-- ---------------------------------------------------------------------------
create table public.apartments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  owner_name text not null check (length(trim(owner_name)) > 0),
  entry_date date,
  notes text,
  created_at timestamptz not null default now()
);

create index apartments_user_id_idx on public.apartments (user_id);

-- ---------------------------------------------------------------------------
-- Appliances selected for each apartment
-- ---------------------------------------------------------------------------
create table public.apartment_appliances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  apartment_id uuid not null references public.apartments (id) on delete cascade,
  appliance text not null check (
    appliance in (
      'tv',
      'refrigerator',
      'stove',
      'washing_machine',
      'computer',
      'iron',
      'electric_heating'
    )
  ),
  created_at timestamptz not null default now(),
  unique (apartment_id, appliance)
);

create index apartment_appliances_user_id_idx on public.apartment_appliances (user_id);

-- ---------------------------------------------------------------------------
-- Linky meters (one per apartment)
-- ---------------------------------------------------------------------------
create table public.linky_meters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  apartment_id uuid not null unique references public.apartments (id) on delete cascade,
  apartment_number text not null check (length(trim(apartment_number)) > 0),
  consumption numeric(12, 2) not null default 0 check (consumption >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index linky_meters_user_id_idx on public.linky_meters (user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security: a user can only ever read and write their own rows
-- ---------------------------------------------------------------------------
alter table public.apartments enable row level security;
alter table public.apartment_appliances enable row level security;
alter table public.linky_meters enable row level security;

-- Apartments
create policy "apartments_select_own" on public.apartments
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "apartments_insert_own" on public.apartments
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "apartments_update_own" on public.apartments
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "apartments_delete_own" on public.apartments
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Appliances: the row must be yours AND point to one of your apartments
create policy "apartment_appliances_select_own" on public.apartment_appliances
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "apartment_appliances_insert_own" on public.apartment_appliances
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.apartments a
      where a.id = apartment_id and a.user_id = (select auth.uid())
    )
  );

create policy "apartment_appliances_update_own" on public.apartment_appliances
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.apartments a
      where a.id = apartment_id and a.user_id = (select auth.uid())
    )
  );

create policy "apartment_appliances_delete_own" on public.apartment_appliances
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Linky meters: the row must be yours AND point to one of your apartments
create policy "linky_meters_select_own" on public.linky_meters
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "linky_meters_insert_own" on public.linky_meters
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.apartments a
      where a.id = apartment_id and a.user_id = (select auth.uid())
    )
  );

create policy "linky_meters_update_own" on public.linky_meters
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.apartments a
      where a.id = apartment_id and a.user_id = (select auth.uid())
    )
  );

create policy "linky_meters_delete_own" on public.linky_meters
  for delete to authenticated
  using ((select auth.uid()) = user_id);
