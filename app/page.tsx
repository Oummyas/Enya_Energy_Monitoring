import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

// Logged-in users go straight to their apartments
async function HomeActions() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect("/apartments");

  return (
    <div className="flex flex-col gap-3 w-full max-w-xs">
      <Button asChild size="lg">
        <Link href="/auth/login">Log in</Link>
      </Button>
      <p className="text-sm text-muted-foreground">
        No account yet?{" "}
        <Link href="/auth/sign-up" className="underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-10 p-6 text-center">
      <div className="flex flex-col items-center gap-5">
        <Logo className="h-20 w-20" />
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Enya Energy Monitoring
          </h1>
          <p className="text-muted-foreground">
            Follow your Linky meters and spot unusual consumption.
          </p>
        </div>
      </div>
      <Suspense fallback={<div className="h-[76px]" />}>
        <HomeActions />
      </Suspense>
    </main>
  );
}
