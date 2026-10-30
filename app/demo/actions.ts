"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSuspectedFraud } from "@/lib/fraud";
import { lastMonths } from "@/lib/consumption";

export type DemoResult = { ok: true; message?: string } | { ok: false; message: string };

type Supabase = Awaited<ReturnType<typeof createClient>>;

type DemoMeter = {
  id: string;
  apartment_name: string;
  consumption: number;
  is_active: boolean;
  baseline_consumption: number | null;
};

const round1 = (value: number) => Math.round(value * 10) / 10;

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

async function loadMeters(supabase: Supabase) {
  const { data, error } = await supabase
    .from("linky_meters")
    .select("id, apartment_name, consumption, is_active, baseline_consumption")
    .returns<DemoMeter[]>();
  if (error) {
    throw new Error(
      error.code === "42703"
        ? "Run supabase/migrations/005_live_demo.sql first."
        : `Could not load Linky meters: ${error.message}`,
    );
  }
  return data.map((m) => ({ ...m, consumption: Number(m.consumption) }));
}

// Remember the starting consumption of meters the demo is about to change
async function saveBaselines(supabase: Supabase, meters: DemoMeter[]) {
  await Promise.all(
    meters
      .filter((m) => m.baseline_consumption === null)
      .map((m) =>
        supabase
          .from("linky_meters")
          .update({ baseline_consumption: m.consumption })
          .eq("id", m.id),
      ),
  );
}

// The meter's consumption is the current month: keep that month's reading
// in step. Only an existing reading is updated, so the history of the
// consumption page is never left with a single month.
async function setConsumption(supabase: Supabase, id: string, kwh: number) {
  const { error } = await supabase
    .from("linky_meters")
    .update({ consumption: kwh })
    .eq("id", id);
  if (error) throw new Error(`Could not update the meter: ${error.message}`);

  const currentMonth = lastMonths().at(-1)!;
  await supabase
    .from("consumption_readings")
    .update({ kwh })
    .eq("linky_meter_id", id)
    .eq("month", currentMonth);
}

async function run(action: (supabase: Supabase) => Promise<string | undefined>) {
  try {
    const supabase = await createClient();
    const message = await action(supabase);
    revalidatePath("/", "layout");
    return { ok: true, message } satisfies DemoResult;
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Demo action failed.",
    } satisfies DemoResult;
  }
}

// Meters that are active and consuming normally
function healthyMeters(meters: DemoMeter[]) {
  return meters.filter((m) => m.is_active && !isSuspectedFraud(m));
}

// One step of the simulator: every healthy meter consumes a little more,
// like a Linky reporting its index. Suspected frauds stay flat.
export async function demoTick(): Promise<DemoResult> {
  return run(async (supabase) => {
    const meters = healthyMeters(await loadMeters(supabase));
    await saveBaselines(supabase, meters);
    await Promise.all(
      meters.map((m) => {
        const delta = Math.max(
          0.5,
          m.consumption * 0.004 * (0.5 + Math.random()),
        );
        return setConsumption(supabase, m.id, round1(m.consumption + delta));
      }),
    );
    return undefined;
  });
}

export async function demoFraud(): Promise<DemoResult> {
  return run(async (supabase) => {
    const meter = randomItem(healthyMeters(await loadMeters(supabase)));
    if (!meter) return "No healthy meter left to turn into a fraud.";
    await saveBaselines(supabase, [meter]);
    await setConsumption(supabase, meter.id, 15 + Math.floor(Math.random() * 70));
    return `Apartment ${meter.apartment_name} now looks like a fraud.`;
  });
}

export async function demoHeatingPeak(): Promise<DemoResult> {
  return run(async (supabase) => {
    const meter = randomItem(healthyMeters(await loadMeters(supabase)));
    if (!meter) return "No healthy meter available.";
    await saveBaselines(supabase, [meter]);
    await setConsumption(supabase, meter.id, round1(meter.consumption * 1.6));
    return `Heating peak in apartment ${meter.apartment_name}.`;
  });
}

// Put every meter the demo changed back to its starting consumption
export async function demoReset(): Promise<DemoResult> {
  return run(async (supabase) => {
    const touched = (await loadMeters(supabase)).filter(
      (m) => m.baseline_consumption !== null,
    );
    await Promise.all(
      touched.map(async (m) => {
        await setConsumption(supabase, m.id, Number(m.baseline_consumption));
        await supabase
          .from("linky_meters")
          .update({ baseline_consumption: null })
          .eq("id", m.id);
      }),
    );
    return touched.length
      ? `Demo reset: ${touched.length} meter${touched.length > 1 ? "s" : ""} restored.`
      : "Nothing to reset.";
  });
}
