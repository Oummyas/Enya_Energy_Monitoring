import { cn } from "@/lib/utils";

// Apartments icon: a house with brown walls and a green roof
// `strokeWidth` is accepted (and ignored) so it can stand in for a lucide icon
export function ApartmentIcon({
  className,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("h-6 w-6 shrink-0", className)}
    >
      {/* Walls */}
      <rect x="5" y="10" width="14" height="11" rx="1" fill="#92400e" />
      {/* Door and window */}
      <rect x="10.25" y="14.5" width="3.5" height="6.5" rx="0.6" fill="#5b2a0a" />
      <rect x="14.75" y="12.5" width="2.5" height="2.5" rx="0.4" fill="#fde68a" />
      {/* Roof */}
      <path
        d="M2.2 11.2 11.3 3.6a1.1 1.1 0 0 1 1.4 0l9.1 7.6a.9.9 0 0 1-.6 1.6H2.8a.9.9 0 0 1-.6-1.6z"
        fill="#16a34a"
      />
    </svg>
  );
}
