import { cn } from "@/lib/utils";
import type { FormState } from "@/lib/form-state";

export function FormMessage({ state }: { state: FormState }) {
  if (state.status === "idle") return null;

  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={cn(
        "text-sm rounded-md px-3 py-2 border",
        state.status === "success"
          ? "border-green-600/30 bg-green-600/10 text-green-700 dark:text-green-400"
          : "border-red-600/30 bg-red-600/10 text-red-700 dark:text-red-400",
      )}
    >
      {state.message}
    </p>
  );
}
