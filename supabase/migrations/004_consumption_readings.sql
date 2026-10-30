-- Monthly consumption history for each Linky meter.
-- Run this once in the Supabase dashboard (SQL Editor).

create table public.consumption_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  linky_meter_id uuid not null references public.linky_meters (id) on delete cascade,
  -- First day of the month the reading covers, e.g. 2026-10-01
  month date not null check (extract(day from month) = 1),
  kwh numeric(12, 2) not null check (kwh >= 0),
  created_at timestamptz not null default now(),
  unique (linky_meter_id, month)
);

create index consumption_readings_user_id_idx on public.consumption_readings (user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security: the row must be yours AND point to one of your meters
-- ---------------------------------------------------------------------------
alter table public.consumption_readings enable row level security;

create policy "consumption_readings_select_own" on public.consumption_readings
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "consumption_readings_insert_own" on public.consumption_readings
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.linky_meters m
      where m.id = linky_meter_id and m.user_id = (select auth.uid())
    )
  );

create policy "consumption_readings_update_own" on public.consumption_readings
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.linky_meters m
      where m.id = linky_meter_id and m.user_id = (select auth.uid())
    )
  );

create policy "consumption_readings_delete_own" on public.consumption_readings
  for delete to authenticated
  using ((select auth.uid()) = user_id);
