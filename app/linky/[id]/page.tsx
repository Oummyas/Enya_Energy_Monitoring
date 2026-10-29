import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { FormMessage } from "@/components/form-message";
import { errorState, idleState, successState } from "@/lib/form-state";
import { LinkyForm, type ApartmentOption } from "../linky-form";
import { updateLinky } from "../actions";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
};

async function LinkyDetail({ params, searchParams }: Props) {
  const { id } = await params;
  const { created } = await searchParams;
  const supabase = await createClient();

  const [meter, apartments] = await Promise.all([
    supabase
      .from("linky_meters")
      .select("id, apartment_id, apartment_name, consumption, is_active")
      .eq("id", id)
      .maybeSingle<{
        id: string;
        apartment_id: string;
        apartment_name: string;
        consumption: number;
        is_active: boolean;
      }>(),
    supabase
      .from("apartments")
      .select("id, owner_name")
      .order("created_at", { ascending: true })
      .returns<ApartmentOption[]>(),
  ]);

  const error = meter.error ?? apartments.error;
  if (error) {
    return (
      <FormMessage
        state={errorState(`Could not load the Linky meter: ${error.message}`)}
      />
    );
  }
  if (!meter.data) notFound();

  return (
    <>
      <h1 className="font-bold text-2xl">
        Linky meter — apartment {meter.data.apartment_name}
      </h1>
      <LinkyForm
        action={updateLinky.bind(null, meter.data.id)}
        apartments={apartments.data ?? []}
        defaults={{
          ...meter.data,
          consumption: Number(meter.data.consumption),
        }}
        submitLabel="Save changes"
        initialState={
          created ? successState("Linky meter created.") : idleState
        }
      />
    </>
  );
}

export default function LinkyMeterPage(props: Props) {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/linky" className="text-sm hover:underline">
        ← Back to Linky meters
      </Link>
      <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
        <LinkyDetail {...props} />
      </Suspense>
    </div>
  );
}
