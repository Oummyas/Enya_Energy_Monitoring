import { cn } from "@/lib/utils";

// Flat, colored icons for the Linky meters and Consumption pages, in the
// same style as ApartmentIcon. `strokeWidth` is accepted (and ignored) so
// they can stand in for lucide icons.
type IconProps = { className?: string; strokeWidth?: number };

// A Linky meter: light green box, dark screen with a reading, yellow bolt
export function LinkyIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("h-6 w-6 shrink-0", className)}
    >
      {/* Body */}
      <rect x="4" y="2" width="16" height="20" rx="3" fill="#a3e635" />
      <rect
        x="4"
        y="2"
        width="16"
        height="20"
        rx="3"
        fill="none"
        stroke="#4d7c0f"
        strokeWidth="1"
      />
      {/* Screen with a reading */}
      <rect x="6.5" y="5" width="11" height="6" rx="1" fill="#1f2937" />
      <path
        d="M8.3 9.2V6.8M10.3 9.2V7.6M12.3 9.2V6.4M14.3 9.2V7.9"
        stroke="#4ade80"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Bolt */}
      <path d="M12.8 12.8 9.8 17.3h2.3l-.9 3.4 3.6-5h-2.4z" fill="#facc15" />
      <path
        d="M12.8 12.8 9.8 17.3h2.3l-.9 3.4 3.6-5h-2.4z"
        fill="none"
        stroke="#a16207"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Consumption: blue bars of a monthly chart with a gold euro coin
export function ConsumptionIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("h-6 w-6 shrink-0", className)}
    >
      {/* Base line */}
      <rect x="2" y="20.5" width="20" height="1.5" rx="0.75" fill="#475569" />
      {/* Bars */}
      <rect x="3" y="12" width="4" height="8.5" rx="1" fill="#7dd3fc" />
      <rect x="8.5" y="7" width="4" height="13.5" rx="1" fill="#3b82f6" />
      <rect x="14" y="10" width="4" height="10.5" rx="1" fill="#1d4ed8" />
      {/* Euro coin */}
      <circle
        cx="18.5"
        cy="5.5"
        r="4"
        fill="#facc15"
        stroke="#a16207"
        strokeWidth="0.8"
      />
      <path
        d="M20 4.1a2 2 0 1 0 0 2.8M16.6 5h2.6M16.6 6.1h2.4"
        fill="none"
        stroke="#a16207"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
