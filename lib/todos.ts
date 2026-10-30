import type { SupabaseClient } from "@supabase/supabase-js";

// Pending work that is not an alert: something still has to be set up
export type Todo = {
  key: string;
  kind: "no_meter" | "inactive_meter";
  title: string;
  detail: string;
  href: string;
};

type ApartmentRow = {
  id: string;
  owner_name: string;
  // One-to-one embed: an object or null (an array on older PostgREST)
  linky_meters: { id: string } | { id: string }[] | null;
};

type MeterRow = {
  id: string;
  apartment_name: string;
  apartments: { owner_name: string } | null;
};

const hasMeter = (a: ApartmentRow) =>
  Array.isArray(a.linky_meters) ? a.linky_meters.length > 0 : !!a.linky_meters;

export async function loadTodos(supabase: SupabaseClient): Promise<Todo[]> {
  const [apartments, inactive] = await Promise.all([
    supabase
      .from("apartments")
      .select("id, owner_name, linky_meters(id)")
      .order("created_at", { ascending: true })
      .returns<ApartmentRow[]>(),
    supabase
      .from("linky_meters")
      .select("id, apartment_name, apartments(owner_name)")
      .eq("is_active", false)
      .order("created_at", { ascending: true })
      .returns<MeterRow[]>(),
  ]);

  const noMeter = (apartments.data ?? []).filter((a) => !hasMeter(a));
  return [
    ...noMeter.map(
      (a): Todo => ({
        key: `no_meter:${a.id}`,
        kind: "no_meter",
        title: a.owner_name,
        detail: "Apartment without a Linky meter",
        href: `/linky/new?apartment=${a.id}`,
      }),
    ),
    ...(inactive.data ?? []).map(
      (m): Todo => ({
        key: `inactive_meter:${m.id}`,
        kind: "inactive_meter",
        title: `Apt ${m.apartment_name}`,
        detail: `Meter not active${m.apartments ? ` · ${m.apartments.owner_name}` : ""}`,
        href: `/linky/${m.id}`,
      }),
    ),
  ];
}
