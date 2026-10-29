"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PostgrestError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  errorState,
  successState,
  type FormState,
} from "@/lib/form-state";

function readLinkyForm(formData: FormData) {
  const apartmentId = String(formData.get("apartment_id") ?? "").trim();
  const apartmentName = String(formData.get("apartment_name") ?? "").trim();
  const consumptionRaw = String(formData.get("consumption") ?? "").trim();
  const consumption = consumptionRaw === "" ? 0 : Number(consumptionRaw);

  if (!apartmentId) {
    return { ok: false, error: "Please choose an apartment." } as const;
  }
  if (!apartmentName) {
    return { ok: false, error: "Apartment name is required." } as const;
  }
  if (!Number.isFinite(consumption) || consumption < 0) {
    return { ok: false, error: "Consumption must be a number of 0 or more." } as const;
  }

  return {
    ok: true,
    values: {
      apartment_id: apartmentId,
      apartment_name: apartmentName,
      consumption,
      is_active: formData.get("is_active") === "on",
    },
  } as const;
}

function saveError(error: PostgrestError) {
  if (error.code === "23505") {
    return errorState("This apartment already has a Linky meter.");
  }
  return errorState(`Could not save the Linky meter: ${error.message}`);
}

export async function createLinky(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = readLinkyForm(formData);
  if (!parsed.ok) return errorState(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("linky_meters")
    .insert(parsed.values)
    .select("id")
    .single();

  if (error) return saveError(error);

  revalidatePath("/linky");
  redirect(`/linky/${data.id}?created=1`);
}

export async function updateLinky(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = readLinkyForm(formData);
  if (!parsed.ok) return errorState(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("linky_meters")
    .update(parsed.values)
    .eq("id", id)
    .select("id");

  if (error) return saveError(error);
  if (!data?.length) return errorState("Linky meter not found.");

  revalidatePath("/linky");
  revalidatePath(`/linky/${id}`);
  return successState("Linky meter saved.");
}

export async function deleteLinky(id: string): Promise<FormState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("linky_meters")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) return errorState(`Could not delete: ${error.message}`);
  if (!data?.length) return errorState("Linky meter not found.");

  revalidatePath("/linky");
  redirect("/linky?deleted=1");
}
