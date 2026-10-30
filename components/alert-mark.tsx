import { PirateIcon } from "@/components/pirate-icon";
import { ThermometerIcon } from "@/components/thermometer-icon";
import { cn } from "@/lib/utils";

// Alert icon shown at the top right of an apartment or meter card: pirate
// for a suspected fraud, thermometer for overheating
export function AlertMark({ kind }: { kind?: "fraud" | "overheating" }) {
  if (!kind) return null;
  const fraud = kind === "fraud";
  return (
    <span
      title={fraud ? "Suspected fraud" : "Overheating"}
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white ring-2",
        fraud ? "ring-red-500" : "ring-orange-500",
      )}
    >
      {fraud ? (
        <PirateIcon className="h-8 w-8" label="Suspected fraud" />
      ) : (
        <ThermometerIcon className="h-8 w-8" label="Overheating" />
      )}
    </span>
  );
}
