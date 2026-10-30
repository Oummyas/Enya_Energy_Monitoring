import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DismissibleBanner } from "@/components/dismissible-banner";
import { PirateIcon } from "@/components/pirate-icon";
import { ThermometerIcon } from "@/components/thermometer-icon";
import { type Alert, loadAlerts } from "@/lib/alerts";
import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/consumption";

// Alert strips shown at the top of the pages
export async function Alerts() {
  const alerts = await loadAlerts(await createClient());
  return (
    <>
      <AlertBanners alerts={alerts} />
    </>
  );
}

const ICON_TILE =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white ring-1";

// Two compact strips, right-aligned in the page content: one for suspected
// frauds (red, pirate), one for overheating (orange, thermometer). Each can
// be closed on its own. Same size on every page.
export function AlertBanners({ alerts }: { alerts: Alert[] }) {
  const frauds = alerts.filter((a) => a.kind === "fraud");
  const overheating = alerts.filter((a) => a.kind === "overheating");
  if (!frauds.length && !overheating.length) return null;

  return (
    <div className="relative z-10 flex max-w-full flex-wrap justify-end gap-2 self-end">
      {frauds.length > 0 && (
        <AlertStrip
          storageKey={`fraud-strip-${frauds.map((a) => a.meterId).join(",")}`}
          className="border-red-500/20 bg-red-50 text-red-900 dark:bg-red-950/60 dark:text-red-100"
        >
          <span className={cn(ICON_TILE, "ring-red-500/40")}>
            <PirateIcon className="h-7 w-7" />
          </span>
          <strong>
            {frauds.length} suspected fraud{frauds.length > 1 ? "s" : ""}
          </strong>
        </AlertStrip>
      )}
      {overheating.length > 0 && (
        <AlertStrip
          storageKey={`overheating-strip-${overheating.map((a) => a.meterId).join(",")}`}
          className="border-orange-500/20 bg-orange-50 text-orange-900 dark:bg-orange-950/60 dark:text-orange-100"
        >
          <span className={cn(ICON_TILE, "ring-orange-500/40")}>
            <ThermometerIcon className="h-7 w-7" />
          </span>
          <span>
            <strong>{overheating.length} overheating:</strong>{" "}
            {overheating
              .map((m) => `${m.apartmentName} ${formatPercent(m.rise!)}`)
              .join(", ")}
          </span>
        </AlertStrip>
      )}
    </div>
  );
}

function AlertStrip({
  storageKey,
  className,
  children,
}: {
  storageKey: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <DismissibleBanner
      storageKey={storageKey}
      contentClassName="py-0.5 pl-3 pr-10 text-sm"
      className={cn("w-fit max-w-full rounded-xl border shadow-sm", className)}
    >
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {children}
        <Link
          href="/linky"
          className="font-semibold text-foreground underline underline-offset-2 hover:text-emerald-700 dark:hover:text-emerald-400"
        >
          Check
        </Link>
      </p>
    </DismissibleBanner>
  );
}
