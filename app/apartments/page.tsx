import Link from "next/link";
import { Suspense } from "react";
import { CalendarDays, House, Pencil, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/form-message";
import { DeleteButton } from "@/components/delete-button";
import { ApplianceIcon } from "@/components/appliance-icon";
import { applianceLabel } from "@/lib/appliances";
import { formatDate } from "@/lib/format";
import { errorState, successState } from "@/lib/form-state";
import { deleteApartment } from "./actions";

type ApartmentRow = {
  id: string;
  owner_name: string;
  entry_date: string | null;
  notes: string | null;
  apartment_appliances: { appliance: string }[];
};

function HouseIcon() {
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm shadow-emerald-700/30 ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105">
      <House className="h-6 w-6" strokeWidth={1.75} />
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
  const { data, error } = await supabase
    .from("apartments")
    .select("id, owner_name, entry_date, notes, apartment_appliances(appliance)")
    .order("created_at", { ascending: true })
    .returns<ApartmentRow[]>();

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
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((apt) => (
            <li
              key={apt.id}
              className="group flex flex-col gap-4 rounded-2xl border bg-card/80 p-5 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-700/10"
            >
              <div className="flex items-start gap-3">
                <HouseIcon />
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
                  size="sm"
                  variant="outline"
                  className="hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-400"
                >
                  <Link href={`/apartments/${apt.id}`}>
                    <Pencil />
                    Edit
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
