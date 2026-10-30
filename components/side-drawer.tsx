"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Panel sliding in from the left over the page, closed with the X button,
// Escape or a click on the dimmed page. `side` picks the edge it opens from;
// `badge` replaces the count next to the title.
export function SideDrawer({
  id,
  title,
  count,
  badge,
  side = "left",
  open,
  onClose,
  children,
}: {
  id: string;
  title: string;
  count?: number;
  badge?: React.ReactNode;
  side?: "left" | "right";
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  // Rendered into <body>: a parent with a backdrop blur (like the header)
  // would otherwise trap these fixed elements inside its own box
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/20 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        id={id}
        aria-label={title}
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "fixed inset-y-0 z-50 flex w-80 max-w-[85vw] flex-col bg-background shadow-xl transition-transform duration-300",
          side === "left" ? "left-0 border-r" : "right-0 w-96 border-l",
          open
            ? "translate-x-0"
            : side === "left"
              ? "-translate-x-full"
              : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em]">
            {title}
            {badge ??
              (count !== undefined && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs tracking-normal">
                  {count}
                </span>
              ))}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title.toLowerCase()}`}
            className="rounded-md p-1 opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </aside>
    </>,
    document.body,
  );
}
