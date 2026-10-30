import type { SupabaseClient } from "@supabase/supabase-js";
import { isSuspectedFraud } from "@/lib/fraud";
import { overheatingPercent, previousMonthReadings } from "@/lib/overheating";

export type Alert = {
  meterId: string;
  apartmentId: string;
  apartmentName: string;
  ownerName: string | null;
  kind: "fraud" | "overheating";
  consumption: number;
  // Rise over the previous month, for overheating alerts
  rise: number | null;
};

type MeterRow = {
  id: string;
  apartment_id: string;
  apartment_name: string;
  consumption: number;
  is_active: boolean;
  apartments: { owner_name: string } | null;
};

// Every meter needing attention: suspected frauds first, then overheating
export async function loadAlerts(supabase: SupabaseClient): Promise<Alert[]> {
  const [{ data }, previous] = await Promise.all([
    supabase
      .from("linky_meters")
      .select(
        "id, apartment_id, apartment_name, consumption, is_active, apartments(owner_name)",
      )
      .order("created_at", { ascending: true })
      .returns<MeterRow[]>(),
    previousMonthReadings(supabase),
  ]);

  const alerts = (data ?? []).flatMap((m): Alert[] => {
    const base = {
      meterId: m.id,
      apartmentId: m.apartment_id,
      apartmentName: m.apartment_name,
      ownerName: m.apartments?.owner_name ?? null,
      consumption: Number(m.consumption),
    };
    if (isSuspectedFraud(m)) return [{ ...base, kind: "fraud", rise: null }];
    const rise = overheatingPercent(m, previous.get(m.id));
    return rise === null ? [] : [{ ...base, kind: "overheating", rise }];
  });
  return alerts.sort(
    (a, b) => Number(b.kind === "fraud") - Number(a.kind === "fraud"),
  );
}
