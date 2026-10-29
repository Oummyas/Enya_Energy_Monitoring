"use client";

import { startTransition, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/form-message";
import { idleState, type FormState } from "@/lib/form-state";

type ApartmentValues = {
  owner_name: string;
  entry_date: string | null;
  notes: string | null;
};

export function ApartmentForm({
  action,
  defaults,
  submitLabel,
  initialState = idleState,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaults?: ApartmentValues;
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
        <Label htmlFor="owner_name">Owner name</Label>
        <Input
          id="owner_name"
          name="owner_name"
          required
          defaultValue={defaults?.owner_name ?? ""}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="entry_date">Entry date</Label>
        <Input
          id="entry_date"
          name="entry_date"
          type="date"
          defaultValue={defaults?.entry_date ?? ""}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={defaults?.notes ?? ""}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <FormMessage state={state} />
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
