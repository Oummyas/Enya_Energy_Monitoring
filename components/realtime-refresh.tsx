"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Tables whose changes refresh the page, wherever they come from (the
// simulator, another tab, the Supabase dashboard...)
const LIVE_TABLES = ["linky_meters", "consumption_readings"];

export function RealtimeRefresh() {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const supabase = createClient();
    // Group bursts of changes (one per meter) into a single refresh
    const scheduleRefresh = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => router.refresh(), 400);
    };

    // A unique topic per mount: reusing one still being closed (React mounts
    // effects twice in development) would silently receive nothing
    const channel = supabase.channel(`enya-live-${crypto.randomUUID()}`);
    for (const table of LIVE_TABLES) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        scheduleRefresh,
      );
    }

    let cancelled = false;
    // Join with the user's session, otherwise RLS filters out every change
    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      if (data.session) await supabase.realtime.setAuth(data.session.access_token);
      if (!cancelled) channel.subscribe();
    });

    return () => {
      cancelled = true;
      clearTimeout(timer.current);
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
