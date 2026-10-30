import Link from "next/link";
import { Suspense } from "react";
import { CalendarDays, Pencil, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/form-message";
import { DeleteButton } from "@/components/delete-button";
import { ApartmentIcon } from "@/components/apartment-icon";
import { ApplianceIcon } from "@/components/appliance-icon";
import { AlertMark } from "@/components/alert-mark";
import { applianceLabel } from "@/lib/appliances";
import { formatDate } from "@/lib/format";
import { loadAlerts } from "@/lib/alerts";
import { cn } from "@/lib/utils";
import { errorState, successState } from "@/lib/form-state";
import { deleteApartment } from "./actions";

type ApartmentRow = {
  id: string;
  owner_name: string;
  entry_date: string | null;
  notes: string | null;
  apartment_appliances: { appliance: string }[];
};

// Card background shaped like a house (roof on top). The outline is red for
// a suspected fraud, orange for overheating.
function HouseOutline({ alert }: { alert?: "fraud" | "overheating" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full drop-shadow-sm transition-[filter] duration-300 group-hover:drop-shadow-lg"
    >
      <path
        d="M1 24 L50 1.5 L99 24 V96 Q99 99 96 99 H4 Q1 99 1 96 Z"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        className={cn(
          "fill-card/90",
          alert === "fraud"
            ? "stroke-red-500 [stroke-width:2.5]"
            : alert === "overheating"
              ? "stroke-orange-500 [stroke-width:2.5]"
              : "stroke-border [stroke-width:1] group-hover:stroke-emerald-500/50",
        )}
      />
    </svg>
  );
}

function HouseIcon() {
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-sm shadow-emerald-700/20 ring-1 ring-emerald-600/20 transition-transform duration-300 group-hover:scale-105">
      <ApartmentIcon className="h-8 w-8" />
    </span>
  );
}

async function ApartmentList({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const { deleted } = await searchParams;
  const supabase = await createClient();
  const [{ data, error }, alerts] = await Promise.all([
    supabase
      .from("apartments")
      .select(
        "id, owner_name, entry_date, notes, apartment_appliances(appliance)",
      )
      .order("created_at", { ascending: true })
      .returns<ApartmentRow[]>(),
    loadAlerts(supabase),
  ]);
  // Apartments whose meter is in alert get a colored outline
  const alertByApartment = new Map(alerts.map((a) => [a.apartmentId, a.kind]));
  // Suspected frauds first, then overheating, then the others (creation order)
  const rank = (id: string) => {
    const kind = alertByApartment.get(id);
    return kind === "fraud" ? 0 : kind === "overheating" ? 1 : 2;
  };
  const apartments = data
    ? [...data].sort((a, b) => rank(a.id) - rank(b.id))
    : [];

  if (error) {
    return (
      <FormMessage
        state={errorState(`Could not load apartments: ${error.message}`)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {deleted && <FormMessage state={successState("Apartment deleted.")} />}
      <p className="text-sm text-muted-foreground">
        {data.length} apartment{data.length === 1 ? "" : "s"}
      </p>
      {data.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-card/70 p-10 text-center backdrop-blur">
          <HouseIcon />
          <p className="text-muted-foreground">
            No apartments yet. Add your first one.
          </p>
        </div>
      ) : (
        <ul className="grid gap-x-4 gap-y-8 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          {apartments.map((apt) => (
            <li
              key={apt.id}
              className="group relative isolate flex flex-col gap-4 px-5 pb-5 pt-14 transition-transform duration-300 hover:-translate-y-1"
            >
              <HouseOutline alert={alertByApartment.get(apt.id)} />
              {/* The house icon sits in the roof */}
              <ApartmentIcon className="absolute left-1/2 top-0 h-9 w-9 -translate-x-1/2 -translate-y-1/2 drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <Link
                    href={`/apartments/${apt.id}`}
                    className="truncate font-semibold leading-tight hover:text-emerald-700 dark:hover:text-emerald-400"
                  >
                    {apt.owner_name}
                  </Link>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(apt.entry_date) ?? "No entry date"}
                  </p>
                </div>
                <AlertMark kind={alertByApartment.get(apt.id)} />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {apt.apartment_appliances.length ? (
                  apt.apartment_appliances.map((a) => (
                    <span
                      key={a.appliance}
                      className="flex items-center gap-1 rounded-full bg-emerald-600/10 px-2.5 py-0.5 text-xs text-emerald-800 dark:text-emerald-300"
                    >
                      <ApplianceIcon appliance={a.appliance} />
                      {applianceLabel(a.appliance)}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No appliances
                  </span>
                )}
              </div>

              {apt.notes && (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {apt.notes}
                </p>
              )}

              <div className="mt-auto flex items-start justify-between gap-2 border-t pt-4">
                <Button
                  asChild
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-400"
                >
                  <Link
                    href={`/apartments/${apt.id}`}
                    aria-label="Edit"
                    title="Edit"
                  >
                    <Pencil />
                  </Link>
                </Button>
                <DeleteButton
                  action={deleteApartment.bind(null, apt.id)}
                  confirmText={`Delete the apartment of ${apt.owner_name}? Its appliances and Linky meter will be deleted too.`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ApartmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-bold text-3xl tracking-tight">My apartments</h1>
          <p className="text-muted-foreground">
            Owners, entry dates and the appliances in each apartment.
          </p>
        </div>
        <Button
          asChild
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Link href="/apartments/new">
            <Plus />
            Add apartment
          </Link>
        </Button>
      </div>
      <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
        <ApartmentList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
