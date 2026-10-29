-- Rename linky_meters.apartment_number to apartment_name.
-- Run this once in the Supabase dashboard (SQL Editor).
-- Existing values and the "not empty" check are kept.
alter table public.linky_meters rename column apartment_number to apartment_name;
