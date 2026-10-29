// Must match the check constraint on apartment_appliances.appliance
export const APPLIANCES = [
  { value: "tv", label: "TV" },
  { value: "refrigerator", label: "Refrigerator" },
  { value: "stove", label: "Stove" },
  { value: "washing_machine", label: "Washing machine" },
  { value: "computer", label: "Computer" },
  { value: "iron", label: "Iron" },
  { value: "electric_heating", label: "Electric heating" },
] as const;

export type Appliance = (typeof APPLIANCES)[number]["value"];

export function isAppliance(value: string): value is Appliance {
  return APPLIANCES.some((a) => a.value === value);
}

export function applianceLabel(value: string) {
  return APPLIANCES.find((a) => a.value === value)?.label ?? value;
}
