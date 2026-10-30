import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DismissibleBanner } from "@/components/dismissible-banner";
import { PirateIcon } from "@/components/pirate-icon";
import { ThermometerIcon } from "@/components/thermometer-icon";
import { formatPercent } from "@/lib/consumption";
import { FRAUD_THRESHOLD_KWH, isSuspectedFraud } from "@/lib/fraud";
import {
  OVERHEATING_THRESHOLD_PERCENT,
  overheatingPercent,
  previousMonthReadings,
} from "@/lib/overheating";

type MeterRow = {
  id: string;
  apartment_name: string;
  consumption: number;
  is_active: boolean;
};

// Shown under the header on every page while some meters look like fraud
// (red, pirate) or are overheating (orange, fire)
export async function AlertBanners() {
  const supabase = await createClient();
  const [{ data }, previous] = await Promise.all([
    supabase
      .from("linky_meters")
      .select("id, apartment_name, consumption, is_active")
      .returns<MeterRow[]>(),
    previousMonthReadings(supabase),
  ]);
  const meters = data ?? [];

  const frauds = meters.filter(isSuspectedFraud);
  const overheating = meters
    .map((m) => ({ ...m, rise: overheatingPercent(m, previous.get(m.id)) }))
    .filter((m) => m.rise !== null);

  return (
    <>
      {frauds.length > 0 && (
        <DismissibleBanner
          storageKey={`fraud-banner-${frauds.length}`}
          className="relative z-10 w-full border-b border-red-500/20 bg-red-50 text-red-900 dark:bg-red-950/60 dark:text-red-100"
        >
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white ring-1 ring-red-500/40">
              <PirateIcon className="h-6 w-6" />
            </span>
            <span>
              <strong>
                {frauds.length} suspected fraud{frauds.length > 1 ? "s" : ""}:
              </strong>{" "}
              active meter{frauds.length > 1 ? "s" : ""} below{" "}
              {FRAUD_THRESHOLD_KWH} kWh.
            </span>
            <Link
              href="/linky"
              className="font-semibold underline underline-offset-2 hover:text-red-700 dark:hover:text-red-300"
            >
              Check the meters
            </Link>
          </p>
        </DismissibleBanner>
      )}
      {overheating.length > 0 && (
        <DismissibleBanner
          storageKey={`overheating-banner-${overheating.map((m) => m.id).join(",")}`}
          className="relative z-10 w-full border-b border-orange-500/20 bg-orange-50 text-orange-900 dark:bg-orange-950/60 dark:text-orange-100"
        >
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white ring-1 ring-orange-500/40">
              <ThermometerIcon className="h-6 w-6" />
            </span>
            <span>
              <strong>Overheating:</strong>{" "}
              {overheating
                .map(
                  (m) =>
                    `apartment ${m.apartment_name} ${formatPercent(m.rise!)}`,
                )
                .join(", ")}{" "}
              vs last month (limit +{OVERHEATING_THRESHOLD_PERCENT}%).
            </span>
            <Link
              href="/linky"
              className="font-semibold underline underline-offset-2 hover:text-orange-700 dark:hover:text-orange-300"
            >
              Check the meters
            </Link>
          </p>
        </DismissibleBanner>
      )}
    </>
  );
}
