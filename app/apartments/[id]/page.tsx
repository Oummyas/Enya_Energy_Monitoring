import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { FormMessage } from "@/components/form-message";
import { errorState, idleState, successState } from "@/lib/form-state";
import { ApartmentForm } from "../apartment-form";
import { AppliancePicker } from "../appliance-picker";
import { updateApartment } from "../actions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
};

async function ApartmentDetail({ params, searchParams }: Props) {
  const { id } = await params;
  const { created } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apartments")
    .select("id, owner_name, entry_date, notes, apartment_appliances(appliance)")
    .eq("id", id)
    .maybeSingle<{
      id: string;
      owner_name: string;
      entry_date: string | null;
      notes: string | null;
      apartment_appliances: { appliance: string }[];
    }>();

  if (error) {
    return (
      <FormMessage
        state={errorState(`Could not load the apartment: ${error.message}`)}
      />
    );
  }
  if (!data) notFound();

  return (
    <>
      <section className="flex flex-col gap-4">
        <h1 className="font-bold text-2xl">{data.owner_name}</h1>
        <ApartmentForm
          action={updateApartment.bind(null, data.id)}
          defaults={data}
          submitLabel="Save changes"
          initialState={
            created ? successState("Apartment created.") : idleState
          }
        />
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="font-bold text-xl">Appliances</h2>
        <p className="text-sm text-muted-foreground">
          Tick the appliances in this apartment. Changes are saved right away.
        </p>
        <AppliancePicker
          apartmentId={data.id}
          selected={data.apartment_appliances.map((a) => a.appliance)}
        />
      </section>
    </>
  );
}

export default function ApartmentPage(props: Props) {
  return (
    <div className="flex flex-col gap-8">
      <Link href="/apartments" className="text-sm hover:underline">
        ← Back to apartments
      </Link>
      <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
        <ApartmentDetail {...props} />
      </Suspense>
    </div>
  );
}
