"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/form-message";
import { idleState, type FormState } from "@/lib/form-state";

export function DeleteButton({
  action,
  confirmText,
}: {
  action: (prev: FormState) => Promise<FormState>;
  confirmText: string;
}) {
  const [state, formAction, pending] = useActionState(action, idleState);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
      className="flex flex-col items-end gap-1"
    >
      <Button
        type="submit"
        size="icon"
        variant="destructive"
        disabled={pending}
        aria-label={pending ? "Deleting" : "Delete"}
        title="Delete"
        className="h-8 w-8"
      >
        <Trash2 className={pending ? "animate-pulse" : undefined} />
      </Button>
      <FormMessage state={state} />
    </form>
  );
}
