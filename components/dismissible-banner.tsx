"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

// A strip under the header that the user can close for the rest of the
// browser session. A new storageKey (e.g. a new count) shows it again.
export function DismissibleBanner({
  storageKey,
  className,
  children,
}: {
  storageKey: string;
  className?: string;
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
      <div className="relative mx-auto flex w-full max-w-5xl items-center justify-center px-12 py-2.5 text-sm">
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
