import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DismissibleBanner } from "@/components/dismissible-banner";
import { PirateIcon } from "@/components/pirate-icon";
import { ThermometerIcon } from "@/components/thermometer-icon";
import { ActionsTray } from "@/components/actions-tray";
import { type Alert, loadAlerts } from "@/lib/alerts";
import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/consumption";

// Alert strip plus the ACTIONS tray, from a single query
export async function Alerts({ tray = true }: { tray?: boolean }) {
  const alerts = await loadAlerts(await createClient());
  return (
    <>
      <AlertBanners alerts={alerts} />
      {tray && <ActionsTray alerts={alerts} />}
    </>
  );
}

// Compact strip, right-aligned in the page content, while some meters look
// like fraud (red, pirate) or are overheating (orange, thermometer). Same
// size on every page.
export function AlertBanners({ alerts }: { alerts: Alert[] }) {
  const frauds = alerts.filter((a) => a.kind === "fraud");
  const overheating = alerts.filter((a) => a.kind === "overheating");
  if (!frauds.length && !overheating.length) return null;
  const iconTile =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white ring-1";
  const icon = "h-7 w-7";

  return (
    <DismissibleBanner
      storageKey={`alert-banner-${alerts.map((a) => a.meterId).join(",")}`}
      contentClassName="gap-x-4 py-0.5 pl-3 pr-10 text-base"
      className={cn(
        "relative z-10 w-fit max-w-full self-end rounded-xl border shadow-sm",
        frauds.length && overheating.length
          ? "border-red-500/20 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/60 dark:to-orange-950/60"
          : frauds.length
            ? "border-red-500/20 bg-red-50 dark:bg-red-950/60"
            : "border-orange-500/20 bg-orange-50 dark:bg-orange-950/60",
      )}
    >
      <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-center">
        {frauds.length > 0 && (
          <span className="flex items-center gap-2 text-red-900 dark:text-red-100">
            <span className={cn(iconTile, "ring-red-500/40")}>
              <PirateIcon className={icon} />
            </span>
            <span>
              <strong>
                {frauds.length} suspected fraud{frauds.length > 1 ? "s" : ""}
              </strong>
            </span>
          </span>
        )}
        {overheating.length > 0 && (
          <span className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
            <span className={cn(iconTile, "ring-orange-500/40")}>
              <ThermometerIcon className={icon} />
            </span>
            <span>
              <strong>{overheating.length} overheating:</strong>{" "}
              {overheating
                .map((m) => `${m.apartmentName} ${formatPercent(m.rise!)}`)
                .join(", ")}
            </span>
          </span>
        )}
        <Link
          href="/linky"
          className="font-semibold text-foreground underline underline-offset-2 hover:text-emerald-700 dark:hover:text-emerald-400"
        >
          Check the meters
        </Link>
      </p>
    </DismissibleBanner>
  );
}
