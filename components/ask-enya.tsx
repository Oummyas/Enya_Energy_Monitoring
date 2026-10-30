"use client";

import { useCallback, useState } from "react";
import { SendHorizontal, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { SideDrawer } from "@/components/side-drawer";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "Which meters are in fraud?",
  "How much did OCEAN consume in January?",
  "Which apartment costs the most?",
];

// "Ask Enya" bar of the header, opening the assistant panel on the right.
// The assistant itself is not connected yet: the panel says so.
export function AskEnya({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="ask-enya"
        className={cn(
          "group flex min-w-0 items-center gap-2 rounded-full border border-emerald-500/40 bg-background/90 py-2 pl-3 pr-4 text-left text-sm text-muted-foreground shadow-sm transition-colors hover:border-emerald-500 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30",
          className,
        )}
      >
        <Sparkles className="h-4 w-4 shrink-0 text-emerald-600 transition-transform group-hover:scale-110" />
        <span className="truncate">
          <span className="font-semibold text-foreground">Ask Enya…</span>
        </span>
      </button>

      <SideDrawer
        id="ask-enya"
        title="Ask Enya"
        side="right"
        open={open}
        onClose={close}
        badge={
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] tracking-normal text-amber-800 dark:text-amber-300">
            Coming soon
          </span>
        }
      >
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          {/* Welcome message from the assistant */}
          <div className="flex items-start gap-2">
            <Logo className="h-8 w-8 shrink-0" />
            <p className="rounded-2xl rounded-tl-sm bg-emerald-50 px-3 py-2 text-sm text-emerald-950 dark:bg-emerald-950/50 dark:text-emerald-100">
              Hi! I&apos;m Enya, your energy assistant. Soon I&apos;ll answer
              questions about your apartments, Linky meters, alerts and
              consumption.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              You&apos;ll be able to ask, for example:
            </p>
            {EXAMPLES.map((q) => (
              <span
                key={q}
                className="self-start rounded-full border bg-muted/50 px-3 py-1 text-sm text-muted-foreground"
              >
                {q}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 border-t p-3">
          <input
            disabled
            placeholder="The assistant is coming soon"
            className="h-10 flex-1 rounded-full border bg-muted/40 px-4 text-sm"
          />
          <button
            type="button"
            disabled
            aria-label="Send"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white opacity-50"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </div>
      </SideDrawer>
    </>
  );
}
