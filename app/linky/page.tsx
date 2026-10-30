import Link from "next/link";
import { Suspense } from "react";
import { Gauge, House, Pencil, Plus } from "lucide-react";
import { PirateIcon } from "@/components/pirate-icon";
import { ThermometerIcon } from "@/components/thermometer-icon";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/form-message";
import { DeleteButton } from "@/components/delete-button";
import { errorState, successState } from "@/lib/form-state";
import { FRAUD_THRESHOLD_KWH, isSuspectedFraud } from "@/lib/fraud";
import {
  OVERHEATING_THRESHOLD_PERCENT,
  overheatingPercent,
  previousMonthReadings,
} from "@/lib/overheating";
import { formatPercent } from "@/lib/consumption";
import { cn } from "@/lib/utils";
import { deleteLinky } from "./actions";

type LinkyRow = {
  id: string;
  apartment_name: string;
  consumption: number;
  is_active: boolean;
  apartments: { owner_name: string } | null;
};

function Stat({
  label,
  value,
  danger = false,
  warning = false,
}: {
  label: string;
  value: number;
  danger?: boolean;
  warning?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card/80 px-4 py-3 shadow-sm backdrop-blur",
        danger && "border-red-500/40 bg-red-50/80 dark:bg-red-950/30",
        warning && "border-orange-500/40 bg-orange-50/80 dark:bg-orange-950/30",
      )}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-3xl font-semibold tracking-tight",
          danger && "text-red-700 dark:text-red-400",
          warning && "text-orange-700 dark:text-orange-400",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function MeterIcon({
  tone,
}: {
  tone: "active" | "inactive" | "suspect" | "overheating";
}) {
  return (
    <span
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105",
        tone === "active" &&
          "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-700/30",
        tone === "suspect" &&
          "bg-gradient-to-br from-red-500 to-red-700 shadow-red-700/30",
        tone === "overheating" &&
          "bg-gradient-to-br from-amber-400 to-orange-600 shadow-orange-600/30",
        tone === "inactive" && "bg-gradient-to-br from-zinc-400 to-zinc-600",
      )}
    >
      <Gauge className="h-6 w-6" strokeWidth={1.75} />
    </span>
  );
}

async function LinkyList({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const { deleted } = await searchParams;
  const supabase = await createClient();
  const [{ data, error }, previous] = await Promise.all([
    supabase
      .from("linky_meters")
      .select("id, apartment_name, consumption, is_active, apartments(owner_name)")
      .order("created_at", { ascending: true })
      .returns<LinkyRow[]>(),
    previousMonthReadings(supabase),
  ]);

  if (error) {
    return (
      <FormMessage
        state={errorState(`Could not load Linky meters: ${error.message}`)}
      />
    );
  }

  // Suspected fraud first, then overheating, otherwise keep the creation order
  const meters = data
    .map((m) => ({
      ...m,
      suspect: isSuspectedFraud(m),
      overheating: overheatingPercent(m, previous.get(m.id)),
    }))
    .sort(
      (a, b) =>
        Number(b.suspect) - Number(a.suspect) ||
        Number(b.overheating !== null) - Number(a.overheating !== null),
    );
  const activeCount = meters.filter((m) => m.is_active).length;
  const suspectCount = meters.filter((m) => m.suspect).length;
  const overheatingCount = meters.filter((m) => m.overheating !== null).length;

  return (
    <div className="flex flex-col gap-4">
      {deleted && <FormMessage state={successState("Linky meter deleted.")} />}
      {meters.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-card/70 p-10 text-center backdrop-blur">
          <MeterIcon tone="active" />
          <p className="text-muted-foreground">No Linky meters yet.</p>
        </div>
      ) : (
        <>
          <FormMessage
            state={
              suspectCount
                ? errorState(
                    `${suspectCount} active meter${suspectCount > 1 ? "s" : ""} below ${FRAUD_THRESHOLD_KWH} kWh. Check for possible fraud.`,
                  )
                : successState("No suspected fraud.")
            }
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Meters" value={meters.length} />
            <Stat label="Active" value={activeCount} />
            <Stat
              label="Suspected fraud"
              value={suspectCount}
              danger={suspectCount > 0}
            />
            <Stat
              label="Overheating"
              value={overheatingCount}
              warning={overheatingCount > 0}
            />
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {meters.map((m) => (
              <li
                key={m.id}
                className={cn(
                  "group flex flex-col gap-4 rounded-2xl border bg-card/80 p-5 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                  m.suspect
                    ? "border-red-500/50 bg-red-50/80 hover:shadow-red-700/10 dark:bg-red-950/30"
                    : m.overheating !== null
                      ? "border-orange-500/50 bg-orange-50/80 hover:shadow-orange-700/10 dark:bg-orange-950/30"
                      : "hover:border-emerald-500/40 hover:shadow-emerald-700/10",
                )}
              >
                <div className="flex items-start gap-3">
                  <MeterIcon
                    tone={
                      m.suspect
                        ? "suspect"
                        : m.overheating !== null
                          ? "overheating"
                          : m.is_active
                            ? "active"
                            : "inactive"
                    }
                  />
                  <div className="flex min-w-0 flex-col gap-1">
                    <Link
                      href={`/linky/${m.id}`}
                      className={cn(
                        "truncate font-semibold leading-tight",
                        m.suspect
                          ? "text-red-700 hover:underline dark:text-red-400"
                          : m.overheating !== null
                            ? "text-orange-700 hover:underline dark:text-orange-400"
                            : "hover:text-emerald-700 dark:hover:text-emerald-400",
                      )}
                    >
                      Apartment {m.apartment_name}
                    </Link>
                    <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                      <House className="h-3.5 w-3.5 shrink-0" />
                      {m.apartments?.owner_name ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-2">
                  <p
                    className={cn(
                      "text-3xl font-semibold tracking-tight",
                      m.suspect && "text-red-700 dark:text-red-400",
                      m.overheating !== null &&
                        "text-orange-700 dark:text-orange-400",
                    )}
                  >
                    {Number(m.consumption)}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      kWh
                    </span>
                  </p>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                        m.is_active
                          ? "bg-emerald-600/10 text-emerald-800 dark:text-emerald-300"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {m.is_active ? "Active" : "Not active"}
                    </span>
                    {m.suspect && (
                      <span className="flex items-center gap-1 rounded-full bg-red-600 py-0.5 pl-0.5 pr-2.5 text-xs font-medium text-white">
                        <span className="rounded-full bg-white p-px">
                          <PirateIcon className="h-4 w-4" />
                        </span>
                        Suspected fraud
                      </span>
                    )}
                    {m.overheating !== null && (
                      <span className="flex items-center gap-1 rounded-full bg-orange-600 py-0.5 pl-0.5 pr-2.5 text-xs font-medium text-white">
                        <span className="rounded-full bg-white p-px">
                          <ThermometerIcon className="h-4 w-4" />
                        </span>
                        Overheating
                      </span>
                    )}
                  </div>
                </div>
                {m.suspect && (
                  <p className="text-xs text-red-700 dark:text-red-400">
                    Below {FRAUD_THRESHOLD_KWH} kWh while active.
                  </p>
                )}
                {m.overheating !== null && (
                  <p className="text-xs text-orange-700 dark:text-orange-400">
                    {formatPercent(m.overheating)} vs last month (limit +
                    {OVERHEATING_THRESHOLD_PERCENT}%).
                  </p>
                )}

                <div className="mt-auto flex items-start justify-between gap-2 border-t pt-4">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-400"
                  >
                    <Link href={`/linky/${m.id}`}>
                      <Pencil />
                      Edit
                    </Link>
                  </Button>
                  <DeleteButton
                    action={deleteLinky.bind(null, m.id)}
                    confirmText={`Delete the Linky meter of apartment ${m.apartment_name}?`}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default function LinkyPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-3xl tracking-tight">
            My Linky meters
          </h1>
          <p className="text-muted-foreground">
            Consumption per apartment. Suspected fraud is shown first.
          </p>
        </div>
        <Button
          asChild
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Link href="/linky/new">
            <Plus />
            Add Linky meter
          </Link>
        </Button>
      </div>
      <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
        <LinkyList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
