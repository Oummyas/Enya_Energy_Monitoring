import Link from "next/link";
import { Suspense } from "react";
import { Pencil, Plus } from "lucide-react";
import { AlertMark } from "@/components/alert-mark";
import { ApartmentIcon } from "@/components/apartment-icon";
import { LinkyIcon } from "@/components/page-icons";
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
        danger && "border-2 border-red-500",
        warning && "border-2 border-orange-500",
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

// Card background shaped like a Linky meter: a box with rounded top
// corners and a narrower terminal cover at the bottom. The outline is red
// for a suspected fraud, orange for overheating.
function MeterOutline({ alert }: { alert?: "fraud" | "overheating" }) {
  const stroke =
    alert === "fraud"
      ? "stroke-red-500 [stroke-width:2.5]"
      : alert === "overheating"
        ? "stroke-orange-500 [stroke-width:2.5]"
        : "stroke-border [stroke-width:1] group-hover:stroke-emerald-500/50";
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full drop-shadow-sm transition-[filter] duration-300 group-hover:drop-shadow-lg"
    >
      <path
        d="M7 1 H93 Q99 1 99 6 V78 L91 99 H9 L1 78 V6 Q1 1 7 1 Z"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        className={cn("fill-card/90", stroke)}
      />
      {/* Line between the meter body and its terminal cover */}
      <path
        d="M1 78 H99"
        vectorEffect="non-scaling-stroke"
        className={cn("fill-none opacity-60", stroke)}
      />
    </svg>
  );
}

function MeterIcon({
  tone,
}: {
  tone: "active" | "inactive" | "suspect" | "overheating";
}) {
  return (
    // Same Linky icon as the menu and home page; the ring tells the state
    <span
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 shadow-sm transition-transform duration-300 group-hover:scale-105",
        tone === "active" && "ring-1 ring-orange-600/20",
        tone === "suspect" && "ring-2 ring-red-500",
        tone === "overheating" && "ring-2 ring-orange-500",
        tone === "inactive" && "opacity-60 ring-1 ring-zinc-400/40 grayscale",
      )}
    >
      <LinkyIcon className="h-8 w-8" />
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
      .select(
        "id, apartment_name, consumption, is_active, apartments(owner_name)",
      )
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
                className="group relative isolate flex flex-col gap-4 px-5 pb-4 pt-5 transition-transform duration-300 hover:-translate-y-1"
              >
                <MeterOutline
                  alert={
                    m.suspect
                      ? "fraud"
                      : m.overheating !== null
                        ? "overheating"
                        : undefined
                  }
                />
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
                      <ApartmentIcon className="h-3.5 w-3.5" />
                      {m.apartments?.owner_name ?? "—"}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <AlertMark
                      kind={
                        m.suspect
                          ? "fraud"
                          : m.overheating !== null
                            ? "overheating"
                            : undefined
                      }
                    />
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
                  </div>
                </div>
                {m.suspect && (
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    Below {FRAUD_THRESHOLD_KWH} kWh while active.
                  </p>
                )}
                {m.overheating !== null && (
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                    {formatPercent(m.overheating)} vs last month (limit +
                    {OVERHEATING_THRESHOLD_PERCENT}%).
                  </p>
                )}

                {/* Buttons sit in the lower cover of the meter, narrower */}
                <div className="mt-auto flex items-start justify-between gap-2 px-4 pt-4">
                  <Button
                    asChild
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-400"
                  >
                    <Link
                      href={`/linky/${m.id}`}
                      aria-label="Edit"
                      title="Edit"
                    >
                      <Pencil />
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
          <h1 className="font-bold text-3xl tracking-tight">My Linky meters</h1>
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
