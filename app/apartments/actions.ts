"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAppliance, applianceLabel } from "@/lib/appliances";
import {
  errorState,
  successState,
  type FormState,
} from "@/lib/form-state";

function readApartmentForm(formData: FormData) {
  const ownerName = String(formData.get("owner_name") ?? "").trim();
  const entryDate = String(formData.get("entry_date") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!ownerName) return { ok: false, error: "Owner name is required." } as const;

  return {
    ok: true,
    values: {
      owner_name: ownerName,
      entry_date: entryDate || null,
      notes: notes || null,
    },
  } as const;
}

export async function createApartment(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = readApartmentForm(formData);
  if (!parsed.ok) return errorState(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apartments")
    .insert(parsed.values)
    .select("id")
    .single();

  if (error) return errorState(`Could not save the apartment: ${error.message}`);

  revalidatePath("/apartments");
  redirect(`/apartments/${data.id}?created=1`);
}

export async function updateApartment(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = readApartmentForm(formData);
  if (!parsed.ok) return errorState(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apartments")
    .update(parsed.values)
    .eq("id", id)
    .select("id");

  if (error) return errorState(`Could not save the apartment: ${error.message}`);
  if (!data?.length) return errorState("Apartment not found.");

  revalidatePath("/apartments");
  revalidatePath(`/apartments/${id}`);
  revalidatePath("/linky");
  return successState("Apartment saved.");
}

export async function deleteApartment(id: string): Promise<FormState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apartments")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) return errorState(`Could not delete: ${error.message}`);
  if (!data?.length) return errorState("Apartment not found.");

  revalidatePath("/apartments");
  revalidatePath("/linky");
  redirect("/apartments?deleted=1");
}

export async function setAppliance(
  apartmentId: string,
  appliance: string,
  selected: boolean,
): Promise<FormState> {
  if (!isAppliance(appliance)) return errorState("Unknown appliance.");

  const supabase = await createClient();
  const label = applianceLabel(appliance);

  if (selected) {
    const { error } = await supabase
      .from("apartment_appliances")
      .upsert(
        { apartment_id: apartmentId, appliance },
        { onConflict: "apartment_id,appliance", ignoreDuplicates: true },
      );
    if (error) return errorState(`Could not add ${label}: ${error.message}`);
  } else {
    const { error } = await supabase
      .from("apartment_appliances")
      .delete()
      .eq("apartment_id", apartmentId)
      .eq("appliance", appliance);
    if (error) return errorState(`Could not remove ${label}: ${error.message}`);
  }

  revalidatePath("/apartments");
  revalidatePath(`/apartments/${apartmentId}`);
  return successState(selected ? `${label} added.` : `${label} removed.`);
}
