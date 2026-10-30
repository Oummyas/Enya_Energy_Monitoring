"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Minus,
  Pause,
  Play,
  RotateCcw,
  Radio,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PirateIcon } from "@/components/pirate-icon";
import { ThermometerIcon } from "@/components/thermometer-icon";
import {
  type DemoResult,
  demoFraud,
  demoHeatingPeak,
  demoReset,
  demoTick,
} from "@/app/demo/actions";
import { cn } from "@/lib/utils";

const TICK_MS = 4000;
// Kept for the browser session so the panel survives page changes
const RUNNING_KEY = "enya-demo-running";
const OPEN_KEY = "enya-demo-open";
// The close button hides the panel in this window only, e.g. the projected
// screen, which still updates live. ?demo=on shows it again, ?demo=off hides it.
const HIDDEN_KEY = "enya-demo-hidden";
// Online the panel stays hidden until a window is opened with ?demo=on;
// in development it shows by default
const HIDDEN_BY_DEFAULT = process.env.NODE_ENV === "production";

// `fallback` is used when the flag was never set in this window
function readFlag(key: string, fallback = false) {
  try {
    const value = sessionStorage.getItem(key);
    return value === null ? fallback : value === "1";
  } catch {
    return fallback;
  }
}

function writeFlag(key: string, value: boolean) {
  try {
    sessionStorage.setItem(key, value ? "1" : "0");
  } catch {
    // Storage unavailable: the state just won't survive navigation
  }
}

// Floating panel to drive a live demo: a meter simulator and scenario buttons
export function DemoPanel() {
  // Hidden until sessionStorage is read, so it never flashes on screen
  const [hidden, setHidden] = useState(true);
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<DemoResult | null>(null);
  const [pending, startTransition] = useTransition();
  const ticking = useRef(false);

  useEffect(() => {
    const demo = new URLSearchParams(window.location.search).get("demo");
    if (demo === "on") writeFlag(HIDDEN_KEY, false);
    if (demo === "off") {
      writeFlag(HIDDEN_KEY, true);
      writeFlag(RUNNING_KEY, false);
    }
    setHidden(readFlag(HIDDEN_KEY, HIDDEN_BY_DEFAULT));
    setOpen(readFlag(OPEN_KEY));
    setRunning(readFlag(RUNNING_KEY));
  }, []);

  useEffect(() => {
    if (hidden || !running) return;
    const id = setInterval(async () => {
      // Skip a beat rather than pile up requests on a slow network
      if (ticking.current) return;
      ticking.current = true;
      const result = await demoTick();
      ticking.current = false;
      if (!result.ok) {
        setMessage(result);
        setRunning(false);
        writeFlag(RUNNING_KEY, false);
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [hidden, running]);

  const toggleOpen = (value: boolean) => {
    setOpen(value);
    writeFlag(OPEN_KEY, value);
  };

  // Remove the panel from this window; its simulator stops with it
  const hide = () => {
    setHidden(true);
    setRunning(false);
    writeFlag(HIDDEN_KEY, true);
    writeFlag(RUNNING_KEY, false);
  };

  const toggleRunning = () => {
    const next = !running;
    setRunning(next);
    writeFlag(RUNNING_KEY, next);
    setMessage(
      next
        ? { ok: true, message: "Simulator started: meters update every 4 s." }
        : { ok: true, message: "Simulator paused." },
    );
  };

  const trigger = (action: () => Promise<DemoResult>) =>
    startTransition(async () => setMessage(await action()));

  if (hidden) return null;

  if (!open) {
    return (
      <div className="fixed bottom-5 right-5 z-50 flex items-center rounded-full border bg-background/90 text-sm font-semibold shadow-lg backdrop-blur">
        <button
          type="button"
          onClick={() => toggleOpen(true)}
          className="flex items-center gap-2 rounded-l-full py-2 pl-4 pr-2 hover:text-emerald-700 dark:hover:text-emerald-400"
        >
          <LiveDot running={running} />
          Live demo
        </button>
        <button
          type="button"
          onClick={hide}
          aria-label="Close the demo panel in this window"
          title="Close in this window"
          className="rounded-r-full py-2 pl-1 pr-3 opacity-60 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <section
      aria-label="Live demo"
      className="fixed bottom-5 right-5 z-50 flex w-72 flex-col gap-3 rounded-2xl border bg-background/95 p-4 text-sm shadow-xl backdrop-blur"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-semibold">
          <Radio className="h-4 w-4 text-emerald-600" />
          Live demo
          <LiveDot running={running} />
        </p>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => toggleOpen(false)}
            aria-label="Minimise"
            title="Minimise"
            className="rounded-md p-1 opacity-70 hover:opacity-100"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={hide}
            aria-label="Close the demo panel in this window"
            title="Close in this window"
            className="rounded-md p-1 opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Button
        onClick={toggleRunning}
        className={cn(
          "text-white",
          running
            ? "bg-zinc-700 hover:bg-zinc-600"
            : "bg-emerald-600 hover:bg-emerald-700",
        )}
      >
        {running ? <Pause /> : <Play />}
        {running ? "Pause simulator" : "Start simulator"}
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => trigger(demoFraud)}
          className="border-red-500/40 text-red-700 hover:bg-red-50 hover:text-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          <PirateIcon />
          Fraud
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => trigger(demoHeatingPeak)}
          className="border-orange-500/40 text-orange-700 hover:bg-orange-50 hover:text-orange-800 dark:text-orange-400 dark:hover:bg-orange-950/40"
        >
          <ThermometerIcon />
          Heating peak
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={() => trigger(demoReset)}
      >
        <RotateCcw />
        Reset demo
      </Button>

      {message?.message && (
        <p
          role="status"
          className={cn(
            "rounded-md px-2.5 py-1.5 text-xs",
            message.ok
              ? "bg-emerald-600/10 text-emerald-800 dark:text-emerald-300"
              : "bg-red-600/10 text-red-700 dark:text-red-400",
          )}
        >
          {message.message}
        </p>
      )}
    </section>
  );
}

function LiveDot({ running }: { running: boolean }) {
  return running ? (
    <span className="flex items-center gap-1 text-xs font-bold text-red-600">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
      </span>
      LIVE
    </span>
  ) : (
    <span className="h-2 w-2 rounded-full bg-zinc-400" aria-hidden="true" />
  );
}
