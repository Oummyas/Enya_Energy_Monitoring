// Number of months shown on the consumption page, current month included
export const HISTORY_MONTHS = 12;

export type MeterHistory = {
  id: string;
  apartment_name: string;
  owner_name: string | null;
  consumption: number;
  is_active: boolean;
  // kWh per month, oldest first, aligned with lastMonths(); null if no reading
  readings: (number | null)[];
};

// First day of the last HISTORY_MONTHS months, oldest first, as "YYYY-MM-01"
export function lastMonths(now = new Date()) {
  return Array.from({ length: HISTORY_MONTHS }, (_, i) => {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (HISTORY_MONTHS - 1 - i), 1),
    );
    return d.toISOString().slice(0, 10);
  });
}

const monthFormat = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const shortMonthFormat = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  timeZone: "UTC",
});

// "2026-10-01" -> "Oct 2026"
export function formatMonth(value: string) {
  return monthFormat.format(new Date(value));
}

// "2026-10-01" -> "Oct"
export function formatShortMonth(value: string) {
  return shortMonthFormat.format(new Date(value));
}

// Typical monthly profile of a French household, January first: heating
// raises winter consumption, summer is the lowest. 1 = October level.
const SEASON = [1.45, 1.35, 1.2, 1.0, 0.85, 0.75, 0.72, 0.68, 0.8, 1.0, 1.2, 1.4];

// Same formula as supabase/seed/004_sample_readings.sql: the current month
// equals the meter's consumption, earlier months follow the seasonal profile
// with a per-apartment amplitude and a little monthly noise.
export function simulateReadings(
  meter: { apartment_name: string; consumption: number },
  months: string[],
) {
  const charSum = [...meter.apartment_name].reduce(
    (sum, c) => sum + c.charCodeAt(0),
    0,
  );
  const amplitude = 1 + ((charSum % 5) - 2) * 0.2;
  const current = SEASON[new Date(months[months.length - 1]).getUTCMonth()];
  return months.map((month, i) => {
    const season = SEASON[new Date(month).getUTCMonth()] / current;
    const noise =
      i === months.length - 1 ? 0 : (((charSum + i * 7) % 7) - 3) * 0.01;
    return Math.max(
      0,
      Math.round(
        Number(meter.consumption) * (1 + (season - 1) * amplitude + noise),
      ),
    );
  });
}

export function average(values: number[]) {
  return values.length
    ? values.reduce((sum, v) => sum + v, 0) / values.length
    : 0;
}

export function knownReadings(readings: (number | null)[]) {
  return readings.filter((r): r is number => r !== null);
}

// Average of the months that have a reading
export function monthlyAverage(readings: (number | null)[]) {
  return average(knownReadings(readings));
}

const kwhFormat = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });

export function formatKwh(value: number) {
  return kwhFormat.format(value);
}

// 12.34 -> "+12%", -5 -> "−5%"
export function formatPercent(value: number) {
  const rounded = Math.round(value);
  if (rounded === 0) return "0%";
  return `${rounded > 0 ? "+" : "−"}${Math.abs(rounded)}%`;
}
