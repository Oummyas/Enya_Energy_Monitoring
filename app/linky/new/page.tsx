import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { FormMessage } from "@/components/form-message";
import { errorState } from "@/lib/form-state";
import { LinkyForm, type ApartmentOption } from "../linky-form";
import { createLinky } from "../actions";

async function NewLinky({
  searchParams,
}: {
  searchParams: Promise<{ apartment?: string }>;
}) {
  // ?apartment=<id> preselects an apartment (from the home page To do list)
  const { apartment } = await searchParams;
  const supabase = await createClient();
  // Only apartments that don't have a meter yet
  const { data, error } = await supabase
    .from("apartments")
    .select("id, owner_name, linky_meters(id)")
    .order("created_at", { ascending: true })
    .returns<(ApartmentOption & { linky_meters: unknown })[]>();

  if (error) {
    return (
      <FormMessage
        state={errorState(`Could not load apartments: ${error.message}`)}
      />
    );
  }

  const available = data.filter(
    (a) => !a.linky_meters || (Array.isArray(a.linky_meters) && !a.linky_meters.length),
  );

  if (!available.length) {
    return (
      <p className="text-muted-foreground">
        Every apartment already has a Linky meter.{" "}
        <Link href="/apartments/new" className="underline">
          Add an apartment
        </Link>{" "}
        first.
      </p>
    );
  }

  return (
    <LinkyForm
      action={createLinky}
      apartments={available}
      defaults={
        available.some((a) => a.id === apartment)
          ? { apartment_id: apartment }
          : undefined
      }
      submitLabel="Create Linky meter"
    />
  );
}

export default function NewLinkyPage({
  searchParams,
}: {
  searchParams: Promise<{ apartment?: string }>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/linky" className="text-sm hover:underline">
        ← Back to Linky meters
      </Link>
      <h1 className="font-bold text-2xl">New Linky meter</h1>
      <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
        <NewLinky searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
