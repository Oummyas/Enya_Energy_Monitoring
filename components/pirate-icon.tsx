import { cn } from "@/lib/utils";

// Flat pirate face (tricorn hat with skull, eyepatch, red beard) marking a
// suspected fraud
export function PirateIcon({
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
      {/* Ears and face */}
      <circle cx="15.5" cy="39" r="4.5" fill="#f59e0b" />
      <circle cx="48.5" cy="39" r="4.5" fill="#f59e0b" />
      <ellipse cx="32" cy="40" rx="16" ry="18" fill="#fbbf4d" />
      {/* Sideburns and beard */}
      <path d="M16 30h4v12h-4z M44 30h4v12h-4z" fill="#c2410c" />
      <path
        d="M16 40c0 15 8 22 16 22s16-7 16-22c-3 6-8 8-16 8s-13-2-16-8z"
        fill="#c2410c"
      />
      <path d="M26.5 51h11a5.5 4.5 0 0 1-11 0z" fill="#fbbf4d" />
      {/* Brow and eye */}
      <path d="M20 33.5l9-1.5v3l-9 1z" fill="#c2410c" />
      <circle cx="25" cy="40" r="2.6" fill="#7c3f12" />
      {/* Eyepatch and its strap */}
      <path
        d="M22 27l20 9"
        stroke="#171717"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="40.5" cy="39.5" r="6.5" fill="#171717" />
      {/* Tricorn hat */}
      <path d="M14 26c0-14 8-22 18-22s18 8 18 22z" fill="#171717" />
      <path
        d="M2 21c10 6 18 6.5 30 6.5S52 27 62 21c-3 8-11 11-30 11S5 29 2 21z"
        fill="#171717"
      />
      {/* Skull on the hat */}
      <circle cx="32" cy="15" r="6" fill="#fff" />
      <rect x="28.5" y="18" width="7" height="5" rx="1.5" fill="#fff" />
      <circle cx="29.6" cy="15" r="1.7" fill="#171717" />
      <circle cx="34.4" cy="15" r="1.7" fill="#171717" />
      <path d="M30.5 20.5v2.5 M33.5 20.5v2.5" stroke="#171717" strokeWidth="1" />
    </svg>
  );
}
