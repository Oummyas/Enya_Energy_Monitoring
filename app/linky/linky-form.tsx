"use client";

import { startTransition, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/form-message";
import { idleState, type FormState } from "@/lib/form-state";

export type ApartmentOption = { id: string; owner_name: string };

type LinkyValues = {
  apartment_id: string;
  apartment_name: string;
  consumption: number;
  is_active: boolean;
};

export function LinkyForm({
  action,
  apartments,
  defaults,
  submitLabel,
  initialState = idleState,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  apartments: ApartmentOption[];
  defaults?: LinkyValues;
  submitLabel: string;
  initialState?: FormState;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form
      // Submit manually so React does not reset the fields after saving
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => formAction(formData));
      }}
      className="flex flex-col gap-4 max-w-md"
    >
      <div className="grid gap-2">
        <Label htmlFor="apartment_id">Apartment</Label>
        <select
          id="apartment_id"
          name="apartment_id"
          required
          defaultValue={defaults?.apartment_id ?? ""}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="" disabled>
            Choose an apartment
          </option>
          {apartments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.owner_name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="apartment_name">Apartment name</Label>
        <Input
          id="apartment_name"
          name="apartment_name"
          required
          defaultValue={defaults?.apartment_name ?? ""}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="consumption">Consumption (kWh)</Label>
        <Input
          id="consumption"
          name="consumption"
          type="number"
          min="0"
          step="0.01"
          defaultValue={defaults?.consumption ?? 0}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="is_active"
          name="is_active"
          type="checkbox"
          defaultChecked={defaults?.is_active ?? true}
          className="h-4 w-4 accent-primary"
        />
        <Label htmlFor="is_active">Active</Label>
      </div>
      <FormMessage state={state} />
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
