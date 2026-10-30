import type { SupabaseClient } from "@supabase/supabase-js";
import { isSuspectedFraud } from "@/lib/fraud";
import { lastMonths } from "@/lib/consumption";

// An active meter consuming this much more than the previous month is
// flagged as overheating (heating left on, faulty appliance...). Normal
// seasonal changes stay well below it.
export const OVERHEATING_THRESHOLD_PERCENT = 50;

// Rise in % over the previous month when the meter is overheating, else null.
// A suspected fraud is never also reported as overheating.
export function overheatingPercent(
  meter: { is_active: boolean; consumption: number },
  previousKwh: number | null | undefined,
) {
  if (!meter.is_active || isSuspectedFraud(meter)) return null;
  if (previousKwh == null || previousKwh <= 0) return null;
  const rise = ((Number(meter.consumption) - previousKwh) / previousKwh) * 100;
  return rise >= OVERHEATING_THRESHOLD_PERCENT ? rise : null;
}

// Previous month's kWh of every meter, keyed by meter id. Empty when the
// readings table is missing or has no history yet.
export async function previousMonthReadings(supabase: SupabaseClient) {
  const months = lastMonths();
  const { data } = await supabase
    .from("consumption_readings")
    .select("linky_meter_id, kwh")
    .eq("month", months[months.length - 2]);
  return new Map(
    (data ?? []).map((r) => [r.linky_meter_id as string, Number(r.kwh)]),
  );
}
