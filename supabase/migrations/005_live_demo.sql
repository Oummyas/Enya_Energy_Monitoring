-- Live demo: real-time updates and a resettable starting point.
-- Run this once in the Supabase dashboard (SQL Editor), after migration 004.

-- Consumption saved when the demo first changes a meter, so "Reset demo"
-- can put it back. Null when the meter has not been touched by the demo.
alter table public.linky_meters
  add column baseline_consumption numeric(12, 2)
  check (baseline_consumption >= 0);

-- Send row changes to the app over Supabase Realtime (RLS still applies:
-- each user only receives changes to their own rows)
alter publication supabase_realtime
  add table public.linky_meters, public.consumption_readings;
