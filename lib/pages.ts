import { ChartColumn, Gauge, House, type LucideIcon } from "lucide-react";

// The app's main pages, shared by the header links and the home page cards
export const PAGES: {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  // Tailwind gradient and shadow classes for the icon tile
  color: string;
  // Text color matching the icon tile
  textColor: string;
}[] = [
  {
    href: "/apartments",
    label: "Apartments",
    description: "Owners, dates and appliances",
    icon: House,
    color: "from-sky-500 to-blue-700 shadow-blue-700/30",
    textColor: "text-blue-700 dark:text-sky-400",
  },
  {
    href: "/linky",
    label: "Linky meters",
    description: "Live readings, fraud and overheating",
    icon: Gauge,
    color: "from-orange-400 to-orange-600 shadow-orange-600/30",
    textColor: "text-orange-600 dark:text-orange-400",
  },
  {
    href: "/consumption",
    label: "Consumption",
    description: "12 months of history and costs",
    icon: ChartColumn,
    color: "from-yellow-300 to-yellow-500 shadow-yellow-500/30",
    textColor: "text-yellow-600 dark:text-yellow-300",
  },
];
