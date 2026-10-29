import { cn } from "@/lib/utils";

// A lightning bolt over a meter dial
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="Enya Energy Monitoring logo"
      className={cn("h-8 w-8", className)}
    >
      <rect width="48" height="48" rx="12" className="fill-emerald-600" />
      <path
        d="M11 31a13 13 0 0 1 26 0"
        fill="none"
        stroke="white"
        strokeOpacity="0.45"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M26 11 17 27h6l-2 10 10-15h-6l1-11z" fill="white" />
    </svg>
  );
}

// Large faded version of the logo, used as a page background
export function LogoWatermark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={cn("text-emerald-600", className)}
    >
      <path
        d="M11 31a13 13 0 0 1 26 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M26 11 17 27h6l-2 10 10-15h-6l1-11z" fill="currentColor" />
    </svg>
  );
}
