-- Enya Energy Monitoring: sample monthly readings
-- 12 months of history (the current month and the 11 before it) for every
-- Linky meter of the account. Run this once in the Supabase dashboard
-- (SQL Editor), after migration 004. Months that already have a reading
-- are left unchanged.
--
-- Replace you@example.com with the email you signed up with in the app.
-- The current month equals the meter's consumption; earlier months follow
-- the seasonal profile of a French household (heating in winter) with a
-- per-apartment amplitude and a little monthly noise. This mirrors
-- simulateReadings() in lib/consumption.ts.
--
-- Readings are deleted with their meter. To remove them all:
--   delete from public.consumption_readings;

do $$
declare
  owner_email constant text := 'you@example.com';
  -- January first, 1 = October level
  season constant numeric[] := array[1.45, 1.35, 1.2, 1.0, 0.85, 0.75, 0.72, 0.68, 0.8, 1.0, 1.2, 1.4];
  owner_id uuid;
  inserted integer;
begin
  select id into owner_id from auth.users where email = owner_email;
  if owner_id is null then
    raise exception 'No account found for %', owner_email;
  end if;

  insert into public.consumption_readings (user_id, linky_meter_id, month, kwh)
  select
    owner_id,
    m.id,
    x.month,
    greatest(0, round(
      m.consumption * (
        1
        + (season[extract(month from x.month)::int]
            / season[extract(month from now())::int] - 1)
          * (1 + (x.char_sum % 5 - 2) * 0.2)
        + case when i = 11 then 0 else ((x.char_sum + i * 7) % 7 - 3) * 0.01 end
      )
    ))
  from public.linky_meters m
  cross join generate_series(0, 11) i
  cross join lateral (
    select
      (date_trunc('month', now()) - make_interval(months => 11 - i))::date as month,
      (select coalesce(sum(ascii(c)), 0) from regexp_split_to_table(m.apartment_name, '') c) as char_sum
  ) x
  where m.user_id = owner_id
  on conflict (linky_meter_id, month) do nothing;

  get diagnostics inserted = row_count;
  raise notice 'Added % monthly readings for %', inserted, owner_email;
end
$$;
