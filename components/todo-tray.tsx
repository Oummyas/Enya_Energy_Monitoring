"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  CircleCheck,
  ClipboardList,
  Gauge,
  PowerOff,
} from "lucide-react";
import { SideDrawer } from "@/components/side-drawer";
import type { Todo } from "@/lib/todos";
import { cn } from "@/lib/utils";

// "To do" pill opening the list of pending set-up work
export function TodoTray({ todos }: { todos: Todo[] }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="todo-tray"
        className={cn(
          "flex items-center gap-2 rounded-full border bg-background/90 py-1.5 pl-3 pr-4 text-sm font-semibold shadow-lg backdrop-blur transition-transform hover:scale-105",
          todos.length
            ? "border-sky-500/40 text-sky-800 dark:text-sky-200"
            : "border-emerald-500/40 text-emerald-800 dark:text-emerald-200",
        )}
      >
        {todos.length ? (
          <ClipboardList className="h-4 w-4 text-sky-600" />
        ) : (
          <CircleCheck className="h-4 w-4 text-emerald-600" />
        )}
        <span className="tabular-nums">{todos.length}</span>
        <span className="font-medium">To do</span>
      </button>

      <SideDrawer
        id="todo-tray"
        title="To do"
        count={todos.length}
        open={open}
        onClose={close}
      >
        {todos.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
            <CircleCheck className="h-8 w-8 text-emerald-600" />
            All set: every apartment has an active meter.
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto">
            {todos.map((t) => {
              const Icon = t.kind === "no_meter" ? Gauge : PowerOff;
              return (
                <li key={t.key} className="border-b">
                  <Link
                    href={t.href}
                    onClick={close}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-sky-50 dark:hover:bg-sky-950/40"
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white",
                        t.kind === "no_meter"
                          ? "bg-gradient-to-br from-amber-400 to-orange-600"
                          : "bg-gradient-to-br from-zinc-400 to-zinc-600",
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-semibold">
                        {t.title}
                      </span>
                      <span className="truncate text-xs text-sky-700 dark:text-sky-400">
                        {t.detail}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t.kind === "no_meter"
                          ? "Add a Linky meter"
                          : "Check or reactivate the meter"}
                      </span>
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
