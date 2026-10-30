import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DismissibleBanner } from "@/components/dismissible-banner";
import { FRAUD_THRESHOLD_KWH, isSuspectedFraud } from "@/lib/fraud";

// Shown under the header on every page while some meters look like fraud
export async function FraudBanner() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("linky_meters")
    .select("consumption, is_active");

  const count = (data ?? []).filter(isSuspectedFraud).length;
  if (count === 0) return null;

  return (
    <DismissibleBanner
      storageKey={`fraud-banner-${count}`}
      className="relative z-10 w-full border-b border-red-500/20 bg-red-50 text-red-900 dark:bg-red-950/60 dark:text-red-100"
    >
      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-600 text-white">
          <TriangleAlert className="h-3.5 w-3.5" />
        </span>
        <span>
          <strong>
            {count} suspected fraud{count > 1 ? "s" : ""}:
          </strong>{" "}
          active meter{count > 1 ? "s" : ""} below {FRAUD_THRESHOLD_KWH} kWh.
        </span>
        <Link
          href="/linky"
          className="font-semibold underline underline-offset-2 hover:text-red-700 dark:hover:text-red-300"
        >
          Check the meters
        </Link>
      </p>
    </DismissibleBanner>
  );
}
