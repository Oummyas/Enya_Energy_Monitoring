"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// A strip under the header that the user can close for the rest of the
// browser session. A new storageKey (e.g. a new count) shows it again.
export function DismissibleBanner({
  storageKey,
  className,
  contentClassName,
  children,
}: {
  storageKey: string;
  className?: string;
  // Overrides the default full-width layout of the inner row
  contentClassName?: string;
  children: React.ReactNode;
}) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(storageKey) === "dismissed");
    } catch {
      // Storage unavailable: keep the banner visible
    }
  }, [storageKey]);

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(storageKey, "dismissed");
    } catch {
      // Storage unavailable: hidden until the next page load only
    }
  };

  return (
    <div className={className}>
      <div
        className={cn(
          "relative mx-auto flex w-full max-w-5xl items-center justify-center px-12 py-1.5 text-sm",
          contentClassName,
        )}
      >
        {children}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
