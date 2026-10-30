import Link from "next/link";
import { Suspense } from "react";
import { LifeBuoy } from "lucide-react";
import { AskEnya } from "@/components/ask-enya";
import { AuthButton } from "@/components/auth-button";
import { Breadcrumb } from "@/components/breadcrumb";
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
      <div className="w-full max-w-6xl px-5">
        {/* Top level: brand and account */}
        {/* Brand, the Ask Enya assistant bar next to it (like a search bar),
            then help and the account on the right */}
        <div className="flex items-center gap-4 py-3">
          {!home && (
            <Link
              href="/home"
              title="Back to home"
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
          <AskEnya className="ml-4 w-full max-w-xs flex-1 sm:ml-8" />
          <Link
            href="/home#contact"
            className="ml-auto hidden shrink-0 items-center gap-1.5 font-medium text-muted-foreground hover:text-emerald-700 md:flex dark:hover:text-emerald-400"
          >
            <LifeBuoy className="h-4 w-4" />
            Help &amp; contact
          </Link>
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
          "max-w-6xl",
          home ? "py-3" : "py-4",
        )}
      >
        {/* Breadcrumb on the left and alert strips on the right; the home
            page shows its own strips, below the welcome */}
        {!home && (
          <div className="-mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <Suspense>
              <Breadcrumb />
            </Suspense>
            <Suspense>
              <Alerts />
            </Suspense>
          </div>
        )}
        {children}
      </div>
      <RealtimeRefresh />
      <DemoPanel />
    </main>
  );
}
