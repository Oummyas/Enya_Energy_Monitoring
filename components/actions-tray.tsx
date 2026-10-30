"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, CircleCheck } from "lucide-react";
import { PirateIcon } from "@/components/pirate-icon";
import { SideDrawer } from "@/components/side-drawer";
import { ThermometerIcon } from "@/components/thermometer-icon";
import type { Alert } from "@/lib/alerts";
import { formatKwh, formatPercent } from "@/lib/consumption";
import { cn } from "@/lib/utils";

// Alerts already shown in this window, so only later ones are marked new
const SEEN_KEY = "enya-actions-seen";
const FLASH_MS = 4000;

const alertKey = (a: Alert) => `${a.kind}:${a.meterId}`;

function readSeen(): Set<string> | null {
  try {
    const raw = sessionStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : null;
  } catch {
    return null;
  }
}

function writeSeen(keys: Set<string>) {
  try {
    sessionStorage.setItem(SEEN_KEY, JSON.stringify([...keys]));
  } catch {
    // Storage unavailable: alerts are just never marked new
  }
}

// Collapsible "ACTIONS" tray listing alerts that link to their meter. It
// opens from a tab on the left edge, or from a pill (home page).
export function ActionsTray({
  alerts,
  trigger = "tab",
}: {
  alerts: Alert[];
  trigger?: "tab" | "pill";
}) {
  const [open, setOpen] = useState(false);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [flash, setFlash] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Mark alerts that appeared since the window opened, and flash the tab
  useEffect(() => {
    const keys = new Set(alerts.map(alertKey));
    const seen = readSeen();
    if (seen === null) {
      writeSeen(keys);
      return;
    }
    const added = [...keys].filter((k) => !seen.has(k));
    setFresh((prev) => new Set([...prev, ...added].filter((k) => keys.has(k))));
    if (added.length) {
      setFlash(true);
      clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlash(false), FLASH_MS);
    }
    writeSeen(new Set([...seen, ...keys]));
  }, [alerts]);

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  const close = useCallback(() => setOpen(false), []);

  // New alerts first, then frauds, then overheating
  const sorted = [...alerts].sort(
    (a, b) => Number(fresh.has(alertKey(b))) - Number(fresh.has(alertKey(a))),
  );

  return (
    <>
      {trigger === "pill" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="actions-tray"
          className={cn(
            "flex items-center gap-2 rounded-full border bg-background/90 py-1.5 pl-3 pr-4 text-sm font-semibold shadow-lg backdrop-blur transition-transform hover:scale-105",
            alerts.length
              ? "border-red-500/40 text-red-800 dark:text-red-200"
              : "border-emerald-500/40 text-emerald-800 dark:text-emerald-200",
            flash && "animate-pulse ring-4 ring-red-500/40",
          )}
        >
          {alerts.length ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
            </span>
          ) : (
            <CircleCheck className="h-4 w-4 text-emerald-600" />
          )}
          <span className="tabular-nums">{alerts.length}</span>
          <span className="font-medium">
            {alerts.length === 1 ? "alert" : "alerts"}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="actions-tray"
          className={cn(
            "fixed left-0 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-2 rounded-r-xl border border-l-0 px-1.5 py-3 shadow-md transition-all hover:pl-2.5",
            alerts.length
              ? "border-red-500/40 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
              : "border-emerald-500/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
            flash && "animate-pulse ring-4 ring-red-500/40",
          )}
        >
          <span className="text-xs font-bold tracking-[0.15em] [writing-mode:vertical-rl] rotate-180">
            ACTIONS
          </span>
          <span
            className={cn(
              "min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs font-bold",
              alerts.length
                ? "bg-red-600 text-white"
                : "bg-emerald-600 text-white",
            )}
          >
            {alerts.length}
          </span>
        </button>
      )}

      <SideDrawer
        id="actions-tray"
        title="Actions"
        count={alerts.length}
        open={open}
        onClose={close}
      >
        {alerts.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
            <CircleCheck className="h-8 w-8 text-emerald-600" />
            Nothing to handle: no fraud or overheating right now.
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto">
            {sorted.map((a) => {
              const fraud = a.kind === "fraud";
              const isNew = fresh.has(alertKey(a));
              return (
                <li key={alertKey(a)} className="border-b">
                  <Link
                    href={`/linky/${a.meterId}`}
                    onClick={close}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 transition-colors",
                      fraud
                        ? "hover:bg-red-50 dark:hover:bg-red-950/40"
                        : "hover:bg-orange-50 dark:hover:bg-orange-950/40",
                      isNew && "bg-amber-50/70 dark:bg-amber-950/30",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white ring-1",
                        fraud ? "ring-red-500/40" : "ring-orange-500/40",
                      )}
                    >
                      {fraud ? (
                        <PirateIcon className="h-7 w-7" />
                      ) : (
                        <ThermometerIcon className="h-7 w-7" />
                      )}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <span className="truncate">Apt {a.apartmentName}</span>
                        {isNew && (
                          <span className="rounded-full bg-amber-500 px-1.5 py-px text-[10px] font-bold uppercase text-white">
                            New
                          </span>
                        )}
                      </span>
                      <span
                        className={cn(
                          "truncate text-xs",
                          fraud
                            ? "text-red-700 dark:text-red-400"
                            : "text-orange-700 dark:text-orange-400",
                        )}
                      >
                        {fraud
                          ? `Suspected fraud · ${formatKwh(a.consumption)} kWh`
                          : `Overheating · ${formatPercent(a.rise ?? 0)} vs last month`}
                      </span>
                      {a.ownerName && (
                        <span className="truncate text-xs text-muted-foreground">
                          {a.ownerName}
                        </span>
                      )}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </SideDrawer>
    </>
  );
}
