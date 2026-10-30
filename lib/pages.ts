import type { ComponentType } from "react";
import { ApartmentIcon } from "@/components/apartment-icon";
import { ConsumptionIcon, LinkyIcon } from "@/components/page-icons";

// The app's main pages, shared by the header links and the home page cards
export const PAGES: {
  href: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  // Tailwind gradient and shadow classes for the icon tile (light: the icons
  // have their own colors)
  color: string;
  // Text color matching the icon tile
  textColor: string;
}[] = [
  {
    href: "/apartments",
    label: "Apartments",
    description: "Owners, dates and appliances",
    icon: ApartmentIcon,
    color: "from-emerald-50 to-emerald-100 shadow-emerald-700/20",
    textColor: "text-emerald-700 dark:text-emerald-400",
  },
  {
    href: "/linky",
    label: "Linky meters",
    description: "Live readings, fraud and overheating",
    icon: LinkyIcon,
    color: "from-orange-50 to-orange-100 shadow-orange-600/20",
    textColor: "text-orange-600 dark:text-orange-400",
  },
  {
    href: "/consumption",
    label: "Consumption",
    description: "12 months of history and costs",
    icon: ConsumptionIcon,
    color: "from-sky-50 to-blue-100 shadow-blue-700/20",
    textColor: "text-blue-700 dark:text-sky-400",
  },
];
