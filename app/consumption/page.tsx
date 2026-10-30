import { Suspense } from "react";
import { ApartmentIcon } from "@/components/apartment-icon";
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
      {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

type ChartRow = {
  id: string;
  apartment_name: string;
  owner_name: string | null;
  avg: number;
  is_active: boolean;
  suspect: boolean;
  overheating: number | null;
};

// Bar colors: alerts stand out from the normal green
const BAR_TONES = {
  fraud: "bg-red-500",
  overheating: "bg-orange-500",
  normal: "bg-emerald-500",
  inactive: "bg-zinc-300 dark:bg-zinc-600",
};

function barTone(r: ChartRow) {
  if (!r.is_active) return "inactive";
  if (r.suspect) return "fraud";
  if (r.overheating !== null) return "overheating";
  return "normal";
}

// Average monthly consumption of each apartment, biggest first, with the
// apartments in alert in red (fraud) or orange (overheating)
function ApartmentChart({ rows, mean }: { rows: ChartRow[]; mean: number }) {
  const scale = Math.max(...rows.map((r) => r.avg), 1) * 1.05;
  const legend = [
    { tone: "fraud", label: "Suspected fraud" },
    { tone: "overheating", label: "Overheating" },
    { tone: "normal", label: "Normal" },
    { tone: "inactive", label: "Not active" },
  ] as const;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border bg-card/80 p-5 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-semibold">Average consumption per apartment</h2>
          <p className="text-xs text-muted-foreground">
            kWh per month over the last {HISTORY_MONTHS} months
          </p>
        </div>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {legend.map(({ tone, label }) => (
            <li key={tone} className="flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 rounded-sm", BAR_TONES[tone])} />
              {label}
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <span className="inline-block h-3 border-l-2 border-dashed border-foreground/50" />
            Average {formatKwh(mean)} kWh
          </li>
        </ul>
      </div>
      <ul className="relative flex flex-col gap-1.5">
        {/* Average of active apartments: label 9rem + gap, bar, gap + value 4.75rem */}
        <li
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 z-10 border-l-2 border-dashed border-foreground/40"
          style={{
            left: `calc(9.75rem + (100% - 15.25rem) * ${mean / scale})`,
          }}
        />
        {rows.map((r) => {
          const tone = barTone(r);
          return (
            <li key={r.id} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "w-36 shrink-0 truncate",
                  tone === "fraud" &&
                    "font-semibold text-red-700 dark:text-red-400",
                  tone === "overheating" &&
                    "font-semibold text-orange-700 dark:text-orange-400",
                  tone === "inactive" && "text-muted-foreground",
                )}
                title={r.owner_name ?? undefined}
              >
                Apt {r.apartment_name}
              </span>
              <span className="h-5 flex-1 rounded-md bg-muted/60">
                <span
                  className={cn(
                    "block h-full rounded-md transition-all",
                    BAR_TONES[tone],
                  )}
                  style={{ width: `${(r.avg / scale) * 100}%` }}
                  title={`Apt ${r.apartment_name}: ${formatKwh(r.avg)} kWh / month`}
                />
              </span>
              <span className="w-[4.75rem] shrink-0 text-right tabular-nums text-muted-foreground">
                {formatKwh(r.avg)} kWh
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// One month of an apartment, shaded by its share of that apartment's peak
function HeatCell({
  kwh,
  peak,
  month,
  alert,
}: {
  kwh: number | null;
  peak: number;
  month: string;
  // Rows in alert are shaded red (fraud) or orange (overheating), not green
  alert?: "fraud" | "overheating";
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
        style={{
          backgroundColor: `rgb(${alert === "fraud" ? "220 38 38" : alert === "overheating" ? "234 88 12" : "5 150 105"} / ${0.06 + ratio * 0.89})`,
        }}
        title={`${formatMonth(month)}: ${formatKwh(kwh)} kWh · ${formatEuro(monthlyCost(kwh))}`}
      >
        {formatKwh(kwh)}
      </div>
    </td>
  );
}

// Gap to the average of active apartments: above (orange), below (blue),
// or close to it (within 10%)
function VsAverage({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  const near = Math.abs(value) <= 10;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
        near
          ? "bg-muted text-muted-foreground"
          : value > 0
            ? "bg-orange-500/10 text-orange-700 dark:text-orange-400"
            : "bg-sky-500/10 text-sky-700 dark:text-sky-400",
      )}
    >
      {near ? "≈ average" : `${value > 0 ? "▲" : "▼"} ${formatPercent(value)}`}
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
      .select(
        "id, apartment_name, consumption, is_active, apartments(owner_name)",
      )
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
      return {
        ...m,
        avg,
        peak: Math.max(...known, 0),
        yearKwh: known.reduce((sum, r) => sum + r, 0),
        yearCost: known.reduce((sum, r) => sum + monthlyCost(r), 0),
        suspect: isSuspectedFraud(m),
        overheating: overheatingPercent(m, m.readings.at(-2)),
      };
    })
    // Active meters first, biggest consumers at the top
    .sort((a, b) => Number(b.is_active) - Number(a.is_active) || b.avg - a.avg);

  const activeRows = rows.filter((r) => r.is_active);
  const totalCost = activeRows.reduce((sum, r) => sum + r.yearCost, 0);
  const perApartment = average(activeRows.map((r) => r.avg));
  const top = activeRows[0];

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

      <ApartmentChart rows={rows} mean={perApartment} />

      <section className="flex flex-col gap-3 rounded-2xl border bg-card/80 p-5 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold">Comparison by apartment</h2>
          <p className="text-xs text-muted-foreground">
            “vs average” compares each apartment with the average of the active
            apartments ({formatKwh(perApartment)} kWh / month), shown in the
            last row.
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
                <th className="px-2 py-2 text-right font-medium">
                  Cost / year
                </th>
                <th className="py-2 pl-2 text-right font-medium">vs average</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className={cn(
                    "border-b last:border-0",
                    !r.is_active && "text-muted-foreground opacity-70",
                    r.suspect &&
                      "[&>td]:border-y-2 [&>td]:border-red-500 [&>td:first-child]:border-l-2 [&>td:last-child]:border-r-2",
                    r.overheating !== null &&
                      "[&>td]:border-y-2 [&>td]:border-orange-500 [&>td:first-child]:border-l-2 [&>td:last-child]:border-r-2",
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
                      <ApartmentIcon className="h-3.5 w-3.5" />
                      {r.owner_name ?? "—"}
                    </p>
                  </td>
                  {r.readings.map((kwh, i) => (
                    <HeatCell
                      key={months[i]}
                      kwh={kwh}
                      peak={r.peak}
                      month={months[i]}
                      alert={
                        r.suspect
                          ? "fraud"
                          : r.overheating !== null
                            ? "overheating"
                            : undefined
                      }
                    />
                  ))}
                  <td className="px-2 py-3 text-right font-medium tabular-nums">
                    {formatKwh(r.yearKwh)}
                  </td>
                  <td className="px-2 py-3 font-semibold tabular-nums">
                    {formatKwh(r.avg)} kWh
                  </td>
                  <td className="px-2 py-3 text-right tabular-nums">
                    {formatEuro(monthlyCost(r.avg))}
                  </td>
                  <td className="px-2 py-3 text-right tabular-nums">
                    {formatEuro(r.yearCost)}
                  </td>
                  <td className="py-3 pl-2 text-right">
                    <VsAverage
                      value={
                        r.is_active && perApartment > 0
                          ? ((r.avg - perApartment) / perApartment) * 100
                          : null
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Reference row: average of the active apartments */}
            <tfoot>
              <tr className="border-t-2 border-foreground/20 bg-muted/50 text-sm font-semibold">
                <td className="py-3 pr-3">
                  Average
                  <span className="block text-xs font-normal text-muted-foreground">
                    {active.length} active apartments
                  </span>
                </td>
                {totals.map((t, i) => (
                  <td
                    key={months[i]}
                    className="px-0.5 py-3 text-center text-xs tabular-nums"
                  >
                    {formatKwh(active.length ? t / active.length : 0)}
                  </td>
                ))}
                <td className="px-2 py-3 text-right tabular-nums">
                  {formatKwh(active.length ? totalKwh / active.length : 0)}
                </td>
                <td className="px-2 py-3 tabular-nums">
                  {formatKwh(perApartment)} kWh
                </td>
                <td className="px-2 py-3 text-right tabular-nums">
                  {formatEuro(monthlyCost(perApartment))}
                </td>
                <td className="px-2 py-3 text-right tabular-nums">
                  {formatEuro(active.length ? totalCost / active.length : 0)}
                </td>
                <td className="py-3 pl-2 text-right text-xs font-normal text-muted-foreground">
                  reference
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          Values in kWh. Each month is shaded from light to dark relative to
          that apartment&apos;s peak month. Cost at{" "}
          {formatEuro(PRICE_PER_KWH_EUR)}/kWh +{" "}
          {formatEuro(MONTHLY_SUBSCRIPTION_EUR)}/month subscription (EDF Tarif
          Bleu, Base).
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
