import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { Logo, LogoWatermark } from "@/components/logo";

export function AppNav() {
  return (
    <nav className="relative z-10 w-full flex justify-center border-b border-b-foreground/10 h-16 bg-background/70 backdrop-blur">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center">
          <Link
            href="/apartments"
            className="flex items-center gap-2 font-semibold"
          >
            <Logo className="h-7 w-7" />
            Enya Energy Monitoring
          </Link>
          <Link href="/apartments" className="hover:underline">
            Apartments
          </Link>
          <Link href="/linky" className="hover:underline">
            Linky meters
          </Link>
        </div>
        <Suspense>
          <AuthButton />
        </Suspense>
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen flex flex-col items-center overflow-hidden bg-gradient-to-b from-emerald-50 via-background to-background dark:from-emerald-950/40">
      {/* Background echoing the logo: soft green glow and a faded bolt */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/10"
      />
      <LogoWatermark className="pointer-events-none absolute -bottom-24 -right-24 h-[32rem] w-[32rem] opacity-[0.06] dark:opacity-[0.08]" />
      <AppNav />
      <div className="relative w-full max-w-5xl flex-1 flex flex-col gap-8 p-5">
        {children}
      </div>
    </main>
  );
}
