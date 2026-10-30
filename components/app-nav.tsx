import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { DemoPanel } from "@/components/demo-panel";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { Alerts } from "@/components/alert-banners";
import { Logo, LogoWatermark } from "@/components/logo";
import { NavLinks, NavLinksFallback } from "@/components/nav-links";
import { cn } from "@/lib/utils";

// `home`: the welcome page keeps only the account box; the brand, page links
// show on the pages it leads to
export function AppNav({ home = false }: { home?: boolean }) {
  return (
    <nav className="relative z-10 w-full flex justify-center border-b border-b-foreground/10 bg-background/80 text-sm shadow-sm backdrop-blur">
      <div className={cn("w-full px-5", home ? "max-w-6xl" : "max-w-5xl")}>
        {/* Top level: brand and account */}
        <div
          className={cn(
            "flex items-center gap-4 py-3",
            home ? "justify-end" : "justify-between",
          )}
        >
          {!home && (
            <Link
              href="/home"
              className="flex items-center gap-3 text-lg font-bold tracking-tight"
            >
              <Logo className="h-11 w-11" />
              <span className="leading-tight">
                Enya
                <span className="block text-xs font-medium text-muted-foreground">
                  Energy Monitoring
                </span>
              </span>
            </Link>
          )}
          <Suspense>
            <AuthButton variant="header" />
          </Suspense>
        </div>
        {/* Second level: the app pages */}
        {!home && (
          <div className="border-t border-foreground/10">
            <Suspense fallback={<NavLinksFallback />}>
              <NavLinks />
            </Suspense>
          </div>
        )}
      </div>
    </nav>
  );
}

export function AppShell({
  children,
  home = false,
}: {
  children: React.ReactNode;
  home?: boolean;
}) {
  return (
    <main className="relative min-h-screen flex flex-col items-center overflow-hidden bg-gradient-to-b from-emerald-50 via-background to-background dark:from-emerald-950/40">
      {/* Background echoing the logo: soft green glow and a faded bolt */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/10"
      />
      <LogoWatermark className="pointer-events-none absolute -bottom-24 -right-24 h-[32rem] w-[32rem] opacity-[0.06] dark:opacity-[0.08]" />
      <AppNav home={home} />
      <div
        className={cn(
          "relative w-full flex-1 flex flex-col gap-8 px-5",
          home ? "max-w-6xl py-3" : "max-w-5xl py-4",
        )}
      >
        {/* Alert strip at the top of the content; the home page shows its
            own, below the welcome */}
        {!home && (
          <Suspense>
            <div className="-mb-4 flex flex-col">
              <Alerts />
            </div>
          </Suspense>
        )}
        {children}
      </div>
      <RealtimeRefresh />
      <DemoPanel />
    </main>
  );
}
