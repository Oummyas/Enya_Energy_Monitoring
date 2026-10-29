-- Enya Energy Monitoring: sample data
-- 10 apartments, each with its appliances and one Linky meter.
-- Run this once in the Supabase dashboard (SQL Editor), after the migrations.
--
-- The SQL Editor has no logged-in user, so the rows are linked to the account
-- whose email is set below. Every apartment gets the note 'Sample data'.
--
-- To remove the sample data later (appliances and meters are deleted with it):
--   delete from public.apartments where notes = 'Sample data';

do $$
declare
  owner_email constant text := 'oummy_as@yahoo.fr';
  owner_id uuid;
  apt_id uuid;
  r record;
begin
  select id into owner_id from auth.users where email = owner_email;
  if owner_id is null then
    raise exception 'No account found for %', owner_email;
  end if;

  if exists (
    select 1 from public.apartments
    where user_id = owner_id and notes = 'Sample data'
  ) then
    raise exception 'Sample data already exists for %. Nothing was added.', owner_email;
  end if;

  for r in
    select * from (values
      ('Claire Moreau',  '2024-03-15', array['tv', 'refrigerator', 'washing_machine'],                     'A01', 312, true),
      ('Julien Petit',   '2023-09-01', array['refrigerator', 'computer'],                                  'A02',  58, true),
      ('Nadia Rahmani',  '2025-01-20', array['electric_heating', 'stove', 'tv'],                           'A03', 845, true),
      ('Thomas Girard',  '2022-06-10', array['refrigerator', 'iron'],                                      'B01', 173, true),
      ('Inès Lefèvre',   '2024-11-05', array['refrigerator'],                                              'B02',  24, false),
      ('Paul Mercier',   '2023-02-28', array['tv', 'computer', 'washing_machine'],                         'B03',  91, true),
      ('Léa Fontaine',   '2025-04-12', array['electric_heating', 'refrigerator', 'stove', 'iron'],         'C01', 467, true),
      ('Mehdi Bouaziz',  '2021-12-01', array['tv', 'refrigerator', 'electric_heating', 'washing_machine'], 'C02',  12, true),
      ('Camille Roux',   '2024-07-22', array['computer', 'refrigerator'],                                  'C03', 238, true),
      ('Hugo Lambert',   '2023-05-18', array['tv', 'stove', 'washing_machine', 'computer'],                'D01', 530, true)
    ) as t(owner_name, entry_date, appliances, apartment_name, consumption, is_active)
  loop
    insert into public.apartments (user_id, owner_name, entry_date, notes)
    values (owner_id, r.owner_name, r.entry_date::date, 'Sample data')
    returning id into apt_id;

    insert into public.apartment_appliances (user_id, apartment_id, appliance)
    select owner_id, apt_id, unnest(r.appliances);

    insert into public.linky_meters (user_id, apartment_id, apartment_name, consumption, is_active)
    values (owner_id, apt_id, r.apartment_name, r.consumption, r.is_active);
  end loop;

  raise notice 'Added 10 apartments with their appliances and Linky meters for %', owner_email;
end
$$;
