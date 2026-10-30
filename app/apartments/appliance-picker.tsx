"use client";

import { useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/form-message";
import { ApplianceIcon } from "@/components/appliance-icon";
import { APPLIANCES } from "@/lib/appliances";
import { idleState, errorState, type FormState } from "@/lib/form-state";
import { setAppliance } from "./actions";

export function AppliancePicker({
  apartmentId,
  selected,
}: {
  apartmentId: string;
  selected: string[];
}) {
  const [checked, setChecked] = useState(() => new Set(selected));
  const [state, setState] = useState<FormState>(idleState);
  const [pending, startTransition] = useTransition();

  function toggle(appliance: string, value: boolean) {
    const previous = new Set(checked);
    const next = new Set(checked);
    if (value) next.add(appliance);
    else next.delete(appliance);
    setChecked(next);

    startTransition(async () => {
      try {
        const result = await setAppliance(apartmentId, appliance, value);
        if (result.status === "error") setChecked(previous);
        setState(result);
      } catch {
        setChecked(previous);
        setState(errorState("Something went wrong. Please try again."));
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {APPLIANCES.map((a) => (
          <div key={a.value} className="flex items-center gap-2">
            <Checkbox
              id={`appliance-${a.value}`}
              checked={checked.has(a.value)}
              disabled={pending}
              onCheckedChange={(v) => toggle(a.value, v === true)}
            />
            <Label
              htmlFor={`appliance-${a.value}`}
              className="flex items-center gap-1.5"
            >
              <ApplianceIcon
                appliance={a.value}
                className="h-4 w-4 text-emerald-700 dark:text-emerald-400"
              />
              {a.label}
            </Label>
          </div>
        ))}
      </div>
      <FormMessage state={state} />
    </div>
  );
}
