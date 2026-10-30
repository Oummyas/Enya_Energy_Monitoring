import {
  CookingPot,
  Heater,
  Laptop,
  Refrigerator,
  Tv,
  WashingMachine,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import type { Appliance } from "@/lib/appliances";
import { cn } from "@/lib/utils";

// Clothes iron, drawn in the lucide style (lucide has no iron icon)
function IronIcon({ className, ...props }: LucideProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M3 18h18v-3a6 6 0 0 0-6-6H9" />
      <path d="M8 5h7a2 2 0 0 1 2 2v2" />
      <path d="M8 5v4" />
      <path d="M7 14h1 M11 14h1" />
    </svg>
  );
}

const ICONS: Record<Appliance, LucideIcon | typeof IronIcon> = {
  tv: Tv,
  refrigerator: Refrigerator,
  stove: CookingPot,
  washing_machine: WashingMachine,
  computer: Laptop,
  iron: IronIcon,
  electric_heating: Heater,
};

export function ApplianceIcon({
  appliance,
  className,
}: {
  appliance: string;
  className?: string;
}) {
  const Icon = ICONS[appliance as Appliance];
  if (!Icon) return null;
  return (
    <Icon
      aria-hidden="true"
      className={cn("h-3.5 w-3.5 shrink-0", className)}
    />
  );
}
