import { cn } from "@/lib/utils";

// Illustrated head-and-shoulders avatar for the signed-in user
export function UserAvatar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={cn("h-9 w-9 shrink-0 rounded-full", className)}
    >
      <defs>
        <clipPath id="user-avatar-clip">
          <circle cx="20" cy="20" r="20" />
        </clipPath>
      </defs>
      <g clipPath="url(#user-avatar-clip)">
        <rect width="40" height="40" className="fill-emerald-100 dark:fill-emerald-900" />
        {/* Shoulders */}
        <path d="M5 42c0-9 6.7-14 15-14s15 5 15 14z" className="fill-emerald-600" />
        {/* Neck */}
        <path d="M16.5 24h7v5.5a3.5 3.5 0 0 1-7 0z" fill="#e0a77d" />
        {/* Face */}
        <ellipse cx="20" cy="17.5" rx="7" ry="8" fill="#f1c19b" />
        {/* Hair */}
        <path
          d="M12.6 17.5c-.9-6.2 2.6-10.5 7.6-10.5 5.3 0 8.4 4 7.3 10.3-1-3.4-3.3-5.3-6.6-5.6-2.6 1.7-5.6 2.4-8.3 5.8z"
          fill="#3f2a1d"
        />
        {/* Eyes and smile */}
        <circle cx="17.3" cy="18.2" r="0.9" fill="#3f2a1d" />
        <circle cx="22.7" cy="18.2" r="0.9" fill="#3f2a1d" />
        <path
          d="M17.6 21.6c1.4 1.2 3.4 1.2 4.8 0"
          fill="none"
          stroke="#3f2a1d"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      </g>
      <circle
        cx="20"
        cy="20"
        r="19.5"
        fill="none"
        className="stroke-emerald-600/40"
      />
    </svg>
  );
}
