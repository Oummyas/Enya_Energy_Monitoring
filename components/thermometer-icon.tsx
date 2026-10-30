import { cn } from "@/lib/utils";

// Flat red thermometer with a scale, marking an overheating meter
export function ThermometerIcon({
  className,
  label,
}: {
  className?: string;
  // Accessible name; leave empty when text next to the icon already says it
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("h-4 w-4 shrink-0", className)}
    >
      {/* Scale */}
      <path
        d="M42 8h9 M42 13h6 M42 18h9 M42 23h6 M42 28h9 M42 33h6 M42 38h9"
        stroke="#1f4e5a"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Tube and bulb, outlined */}
      <path
        d="M22 10a7 7 0 0 1 14 0v31.5a12 12 0 1 1-14 0z"
        fill="#dc3b30"
        stroke="#1f4e5a"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Empty top of the tube */}
      <path d="M24 10a5 5 0 0 1 10 0v4H24z" fill="#e5e7eb" />
      {/* Highlights */}
      <path d="M26.5 17v24" stroke="#f0857c" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M24 48a6 6 0 0 1 4-5"
        fill="none"
        stroke="#f0857c"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
