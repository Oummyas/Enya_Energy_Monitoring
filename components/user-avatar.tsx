import { cn } from "@/lib/utils";

// Flat head-and-shoulders avatar of the signed-in user, with a green check
// badge showing they are connected
export function UserAvatar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={cn("h-9 w-9 shrink-0", className)}
    >
      <defs>
        <clipPath id="user-avatar-clip">
          <circle cx="20" cy="20" r="20" />
        </clipPath>
      </defs>
      <g clipPath="url(#user-avatar-clip)">
        <rect
          width="40"
          height="40"
          className="fill-sky-50 dark:fill-sky-950"
        />
        {/* Shirt and collar */}
        <path d="M4 42c0-9 7-14.5 16-14.5S36 33 36 42z" fill="#4fc3f7" />
        <path
          d="M14.5 28.8a7 7 0 0 0 11 0"
          fill="none"
          stroke="#1565c0"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Neck */}
        <path d="M16.5 23h7v5.5a3.5 3.5 0 0 1-7 0z" fill="#f2b705" />
        {/* Ears and face */}
        <circle cx="11.6" cy="17.5" r="2.2" fill="#f2b705" />
        <circle cx="28.4" cy="17.5" r="2.2" fill="#f2b705" />
        <path d="M12.5 13.5h15v6.5a7.5 7.5 0 0 1-15 0z" fill="#ffca28" />
        {/* Hair */}
        <path
          d="M11.6 17.5V12c0-5 3.8-8 8.6-8 1.4 0 2 .6 2.4 1.6 3.4.4 5.8 3 5.8 6.6v5.3l-1.6-4.6c-3.2 0-6.4-1.6-8.4-4.2-1.4 2.6-3.8 4.2-6.8 4.6z"
          fill="#424242"
        />
        {/* Eyes */}
        <circle cx="16.9" cy="17" r="1.1" fill="#6d4c1f" />
        <circle cx="23.1" cy="17" r="1.1" fill="#6d4c1f" />
      </g>
      {/* "Connected" check badge */}
      <circle
        cx="31"
        cy="31"
        r="8"
        fill="#43a047"
        stroke="white"
        strokeWidth="1.5"
      />
      <path
        d="M27.3 31.2l2.6 2.6 4.8-5"
        fill="none"
        stroke="#dcedc8"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
