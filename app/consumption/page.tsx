import { Suspense } from "react";
import { House } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { FormMessage } from "@/components/form-message";
import { PirateIcon } from "@/components/pirate-icon";
import { ThermometerIcon } from "@/components/thermometer-icon";
import { errorState } from "@/lib/form-state";
import { isSuspectedFraud } from "@/lib/fraud";
import { overheatingPercent } from "@/lib/overheating";
import {
  MONTHLY_SUBSCRIPTION_EUR,
  PRICE_PER_KWH_EUR,
  formatEuro,
  monthlyCost,
} from "@/lib/tariffs";
import {
  type MeterHistory,
  HISTORY_MONTHS,
  average,
  formatKwh,
  formatMonth,
  formatPercent,
  formatShortMonth,
  knownReadings,
  lastMonths,
  monthlyAverage,
  simulateReadings,
} from "@/lib/consumption";
import { cn } from "@/lib/utils";

type MeterRow = {
  id: string;
  apartment_name: string;
  consumption: number;
  is_active: boolean;
  apartments: { owner_name: string } | null;
};

type ReadingRow = { linky_meter_id: string; month: string; kwh: number };

// PostgREST / Postgres codes for "this table does not exist"
const MISSING_TABLE_CODES = ["PGRST205", "42P01"];

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border bg-card/80 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
        {value}
      </p>
      {hint && (
        <p className="truncate text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

function MonthlyChart({
  months,
  totals,
}: {
  months: string[];
  totals: number[];
}) {
  const mean = average(totals);
  const scale = Math.max(...totals, 1) * 1.15;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border bg-card/80 p-5 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-semibold">Total consumption per month</h2>
          <p className="text-xs text-muted-foreground">
            {formatMonth(months[0])} – {formatMonth(months[months.length - 1])}
            , in kWh
          </p>
        </div>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-block w-5 border-t-2 border-dashed border-foreground/50" />
          Average: {formatKwh(mean)} kWh
        </p>
      </div>
      <div className="relative flex h-56 items-end gap-1.5 border-b border-foreground/15 sm:gap-3">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-dashed border-foreground/50"
          style={{ bottom: `${(mean / scale) * 100}%` }}
        />
        {totals.map((total, i) => (
          <div
            key={months[i]}
            className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
          >
            <span className="text-[10px] font-medium tabular-nums sm:text-xs">
              {formatKwh(total)}
            </span>
            <div
              className={cn(
                "w-full max-w-14 rounded-t-md bg-gradient-to-t transition-opacity group-hover:opacity-80",
                total > mean
                  ? "from-emerald-700 to-emerald-500"
                  : "from-emerald-600 to-emerald-400",
              )}
              style={{ height: `${(total / scale) * 100}%` }}
              title={`${formatMonth(months[i])}: ${formatKwh(total)} kWh · ${formatEuro(total * PRICE_PER_KWH_EUR)}`}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 sm:gap-3">
        {months.map((m) => (
          <p
            key={m}
            className="min-w-0 flex-1 text-center text-[10px] text-muted-foreground sm:text-xs"
          >
            {formatShortMonth(m)}
          </p>
        ))}
      </div>
    </section>
  );
}

// One month of an apartment, shaded by its share of that apartment's peak
function HeatCell({
  kwh,
  peak,
  month,
}: {
  kwh: number | null;
  peak: number;
  month: string;
}) {
  if (kwh === null) {
    return (
      <td className="px-0.5 py-3">
        <div className="rounded-md py-1.5 text-center text-xs text-muted-foreground">
          —
        </div>
      </td>
    );
  }
  const ratio = peak > 0 ? kwh / peak : 0;
  return (
    <td className="px-0.5 py-3">
      <div
        className={cn(
          "rounded-md py-1.5 text-center text-xs tabular-nums",
          ratio > 0.85 && "font-medium text-white",
        )}
        style={{ backgroundColor: `rgb(5 150 105 / ${0.06 + ratio * 0.89})` }}
        title={`${formatMonth(month)}: ${formatKwh(kwh)} kWh · ${formatEuro(monthlyCost(kwh))}`}
      >
        {formatKwh(kwh)}
      </div>
    </td>
  );
}

function VsOthers({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        value > 10 && "text-red-700 dark:text-red-400",
        value < -10 && "text-emerald-700 dark:text-emerald-400",
        Math.abs(value) <= 10 && "text-muted-foreground",
      )}
    >
      {formatPercent(value)}
    </span>
  );
}

async function ConsumptionReport() {
  // Read the request (cookies) before the current date, as Cache Components requires
  const supabase = await createClient();
  const months = lastMonths();

  const [metersResult, readingsResult] = await Promise.all([
    supabase
      .from("linky_meters")
      .select("id, apartment_name, consumption, is_active, apartments(owner_name)")
      .order("created_at", { ascending: true })
      .returns<MeterRow[]>(),
    supabase
      .from("consumption_readings")
      .select("linky_meter_id, month, kwh")
      .gte("month", months[0])
      .returns<ReadingRow[]>(),
  ]);

  if (metersResult.error) {
    return (
      <FormMessage
        state={errorState(
          `Could not load Linky meters: ${metersResult.error.message}`,
        )}
      />
    );
  }
  const readingsError = readingsResult.error;
  if (readingsError && !MISSING_TABLE_CODES.includes(readingsError.code)) {
    return (
      <FormMessage
        state={errorState(
          `Could not load consumption readings: ${readingsError.message}`,
        )}
      />
    );
  }

  // Without any stored history, fall back to simulated readings until
  // migration 004 and its seed are run
  const readings = readingsResult.data ?? [];
  const simulated = readings.length === 0;

  const meters: MeterHistory[] = metersResult.data.map((m) => ({
    id: m.id,
    apartment_name: m.apartment_name,
    owner_name: m.apartments?.owner_name ?? null,
    consumption: Number(m.consumption),
    is_active: m.is_active,
    readings: simulated
      ? simulateReadings(m, months)
      : months.map((month) => {
          const r = readings.find(
            (r) => r.linky_meter_id === m.id && r.month === month,
          );
          return r ? Number(r.kwh) : null;
        }),
  }));

  if (meters.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-card/70 p-10 text-center text-muted-foreground backdrop-blur">
        No Linky meters yet. Add one to see its consumption here.
      </div>
    );
  }

  // Totals, averages and comparisons cover active meters only
  const active = meters.filter((m) => m.is_active);
  const totals = months.map((_, i) =>
    active.reduce((sum, m) => sum + (m.readings[i] ?? 0), 0),
  );
  const totalKwh = totals.reduce((sum, t) => sum + t, 0);

  const rows = meters
    .map((m) => {
      const known = knownReadings(m.readings);
      const avg = average(known);
      const others = active
        .filter((o) => o.id !== m.id)
        .map((o) => monthlyAverage(o.readings));
      const othersAvg = average(others);
      return {
        ...m,
        avg,
        peak: Math.max(...known, 0),
        yearKwh: known.reduce((sum, r) => sum + r, 0),
        yearCost: known.reduce((sum, r) => sum + monthlyCost(r), 0),
        vsOthers:
          m.is_active && others.length && othersAvg > 0
            ? ((avg - othersAvg) / othersAvg) * 100
            : null,
        suspect: isSuspectedFraud(m),
        overheating: overheatingPercent(m, m.readings.at(-2)),
      };
    })
    // Active meters first, biggest consumers at the top
    .sort(
      (a, b) => Number(b.is_active) - Number(a.is_active) || b.avg - a.avg,
    );

  const activeRows = rows.filter((r) => r.is_active);
  const totalCost = activeRows.reduce((sum, r) => sum + r.yearCost, 0);
  const perApartment = average(activeRows.map((r) => r.avg));
  const top = activeRows[0];
  const maxAvg = Math.max(...rows.map((r) => r.avg), 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label={`Total (${HISTORY_MONTHS} months)`}
          value={`${formatKwh(totalKwh)} kWh`}
          hint={`${active.length} active meter${active.length > 1 ? "s" : ""}`}
        />
        <Stat
          label="Average per apartment"
          value={`${formatKwh(perApartment)} kWh`}
          hint={`per month · ${formatEuro(monthlyCost(perApartment))}`}
        />
        <Stat
          label={`Estimated cost (${HISTORY_MONTHS} months)`}
          value={formatEuro(totalCost)}
          hint="subscription included"
        />
        <Stat
          label="Highest consumer"
          value={top ? `Apt ${top.apartment_name}` : "—"}
          hint={top ? `${formatKwh(top.avg)} kWh / month` : undefined}
        />
      </div>

      <MonthlyChart months={months} totals={totals} />

      <section className="flex flex-col gap-3 rounded-2xl border bg-card/80 p-5 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold">Comparison by apartment</h2>
          <p className="text-xs text-muted-foreground">
            “vs others” compares an apartment with the average of the other
            active ones.
          </p>
        </div>
        <div className="-mx-5 overflow-x-auto px-5">
          <table className="w-full min-w-[72rem] text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Apartment</th>
                {months.map((m) => (
                  <th
                    key={m}
                    className="px-0.5 py-2 text-center font-medium"
                    title={formatMonth(m)}
                  >
                    {formatShortMonth(m)}
                  </th>
                ))}
                <th className="px-2 py-2 text-right font-medium">Year total</th>
                <th className="px-2 py-2 font-medium">Average / month</th>
                <th className="px-2 py-2 text-right font-medium">
                  Cost / month
                </th>
                <th className="px-2 py-2 text-right font-medium">Cost / year</th>
                <th className="py-2 pl-2 text-right font-medium">vs others</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className={cn(
                    "border-b last:border-0",
                    !r.is_active && "text-muted-foreground opacity-70",
                    r.suspect && "bg-red-50/80 dark:bg-red-950/30",
                    r.overheating !== null &&
                      "bg-orange-50/80 dark:bg-orange-950/30",
                  )}
                >
                  <td className="py-3 pr-3">
                    <p
                      className={cn(
                        "flex items-center gap-1.5 whitespace-nowrap font-medium",
                        r.suspect && "text-red-700 dark:text-red-400",
                        r.overheating !== null &&
                          "text-orange-700 dark:text-orange-400",
                      )}
                    >
                      Apt {r.apartment_name}
                      {r.suspect && (
                        <PirateIcon
                          className="h-5 w-5"
                          label="Suspected fraud"
                        />
                      )}
                      {r.overheating !== null && (
                        <ThermometerIcon
                          className="h-5 w-5"
                          label={`Overheating: ${formatPercent(r.overheating)} vs last month`}
                        />
                      )}
                      {!r.is_active && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-normal">
                          Not active
                        </span>
                      )}
                    </p>
                    <p className="flex items-center gap-1 whitespace-nowrap text-xs text-muted-foreground">
                      <House className="h-3 w-3 shrink-0" />
                      {r.owner_name ?? "—"}
                    </p>
                  </td>
                  {r.readings.map((kwh, i) => (
                    <HeatCell
                      key={months[i]}
                      kwh={kwh}
                      peak={r.peak}
                      month={months[i]}
                    />
                  ))}
                  <td className="px-2 py-3 text-right font-medium tabular-nums">
                    {formatKwh(r.yearKwh)}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <div className="relative h-2 w-20 rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            r.is_active ? "bg-emerald-500" : "bg-zinc-400",
                          )}
                          style={{ width: `${(r.avg / maxAvg) * 100}%` }}
                        />
                        <div
                          aria-hidden="true"
                          className="absolute -top-1 h-4 w-0.5 bg-foreground/60"
                          style={{ left: `${(perApartment / maxAvg) * 100}%` }}
                          title="Average of active apartments"
                        />
                      </div>
                      <span className="tabular-nums">{formatKwh(r.avg)}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-right tabular-nums">
                    {formatEuro(monthlyCost(r.avg))}
                  </td>
                  <td className="px-2 py-3 text-right tabular-nums">
                    {formatEuro(r.yearCost)}
                  </td>
                  <td className="py-3 pl-2 text-right">
                    <VsOthers value={r.vsOthers} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          Values in kWh. Each month is shaded from light to dark relative to
          that apartment&apos;s peak month. Cost at{" "}
          {formatEuro(PRICE_PER_KWH_EUR)}/kWh +{" "}
          {formatEuro(MONTHLY_SUBSCRIPTION_EUR)}/month subscription (EDF Tarif
          Bleu, Base). The marker on each bar is the average of active
          apartments.
        </p>
      </section>
    </div>
  );
}

export default function ConsumptionPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-3xl tracking-tight">Consumption</h1>
        <p className="text-muted-foreground">
          Last {HISTORY_MONTHS} months: averages, costs and how each apartment
          compares with the others.
        </p>
      </div>
      <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
        <ConsumptionReport />
      </Suspense>
    </div>
  );
}
