import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ActionsTray } from "@/components/actions-tray";
import { AlertBanners } from "@/components/alert-banners";
import { ContactSection } from "@/components/contact-section";
import { TodoTray } from "@/components/todo-tray";
import { Logo } from "@/components/logo";
import { UserAvatar } from "@/components/user-avatar";
import { loadAlerts } from "@/lib/alerts";
import { loadTodos } from "@/lib/todos";
import { PAGES } from "@/lib/pages";
import { cn } from "@/lib/utils";

// "oummy_as@yahoo.fr" -> "Oummy", unless the account has a name
function displayName(claims: {
  email?: string;
  user_metadata?: Record<string, unknown>;
}) {
  const fromMetadata =
    claims.user_metadata?.full_name ?? claims.user_metadata?.name;
  if (typeof fromMetadata === "string" && fromMetadata.trim()) {
    return fromMetadata.trim();
  }
  const first = (claims.email ?? "").split("@")[0].split(/[._+-]/)[0];
  return first ? first[0].toUpperCase() + first.slice(1) : "there";
}

// One distinct part of the home page, with a small heading
function Part({
  title,
  className,
  titleClassName,
  children,
}: {
  title?: string;
  className?: string;
  titleClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-card/80 p-4 shadow-sm backdrop-blur",
        className,
      )}
    >
      {title && (
        <h2
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground",
            titleClassName,
          )}
        >
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

async function Welcome() {
  const supabase = await createClient();
  const [{ data: auth }, alerts, todos] = await Promise.all([
    supabase.auth.getClaims(),
    loadAlerts(supabase),
    loadTodos(supabase),
  ]);
  const name = auth?.claims ? displayName(auth.claims) : "there";

  return (
    <>
      <div className="flex items-center gap-4">
        <UserAvatar className="h-16 w-16 drop-shadow-md" />
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-lg font-semibold tracking-tight">
            Welcome, {name}!
          </h1>
          <div className="flex flex-wrap gap-2">
            <ActionsTray alerts={alerts} trigger="pill" />
            <TodoTray todos={todos} />
          </div>
        </div>
      </div>
      <AlertBanners alerts={alerts} />
    </>
  );
}

// Sized to fit a tablet or laptop screen without scrolling: the user and
// their alerts at the top left, then Enya with the pages in one block, and
// the contacts at the bottom
export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <Suspense
        fallback={
          <div className="flex items-center gap-4">
            <UserAvatar className="h-16 w-16" />
            <p className="text-lg font-semibold tracking-tight">Welcome!</p>
          </div>
        }
      >
        <Welcome />
      </Suspense>

      <Part
        title="Enya Energy Monitoring"
        titleClassName="text-sm font-bold tracking-[0.2em] text-emerald-700 dark:text-emerald-400 sm:text-base"
        className="flex-1 justify-between"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl"
        />
        <div className="relative flex flex-1 items-center gap-6 text-center sm:pl-4">
          <Logo className="h-20 w-20 shrink-0 drop-shadow-lg sm:-my-5 sm:h-36 sm:w-36" />
          <div className="flex flex-1 flex-col items-center gap-1.5">
            <p className="text-2xl font-bold leading-tight tracking-tight sm:text-[2.125rem] xl:text-[2.5rem]">
              Every kilowatt tells a story.{" "}
              <span className="text-emerald-700 dark:text-emerald-400">
                Enya reads it for you.
              </span>
            </p>
            <p className="text-sm text-muted-foreground xl:text-base">
              Enya follows your Linky meters in real time, flags suspected fraud
              and overheating the moment they happen, and shows what each
              apartment really consumes and costs.
            </p>
          </div>
        </div>
        <Suspense fallback={<PageCards counts={{}} />}>
          <PageCardsWithCounts />
        </Suspense>
      </Part>

      <footer className="mt-auto border-t border-foreground/10 pt-3">
        <ContactSection />
      </footer>
    </div>
  );
}

// How many apartments and meters there are, shown on their card
async function PageCardsWithCounts() {
  const supabase = await createClient();
  const [apartments, meters] = await Promise.all([
    supabase.from("apartments").select("id", { count: "exact", head: true }),
    supabase.from("linky_meters").select("id", { count: "exact", head: true }),
  ]);
  return (
    <PageCards
      counts={{
        "/apartments": { value: apartments.count ?? 0, unit: "apartments" },
        "/linky": { value: meters.count ?? 0, unit: "meters" },
      }}
    />
  );
}

function PageCards({
  counts,
}: {
  counts: Record<string, { value: number; unit: string }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {PAGES.map(
        ({ href, label, description, icon: Icon, color, textColor }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col items-center justify-center gap-2 rounded-2xl border bg-background/70 px-4 py-2 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-md hover:shadow-emerald-700/10"
          >
            <span className="flex flex-col items-center justify-center gap-2 lg:flex-row lg:gap-2.5">
              <span
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105",
                  color,
                )}
              >
                <Icon className="h-8 w-8" />
              </span>
              <span className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-lg font-semibold">{label}</span>
                {counts[href] && (
                  <span
                    title={`${counts[href].value} ${counts[href].unit}`}
                    className="rounded-full bg-emerald-600/10 px-2 py-0.5 text-sm font-bold tabular-nums text-emerald-800 dark:text-emerald-300"
                  >
                    {counts[href].value}
                  </span>
                )}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-emerald-700 transition-transform group-hover:translate-x-1 dark:text-emerald-400" />
            </span>
            <span
              className={cn(
                "max-w-full text-base font-medium lg:truncate",
                textColor,
              )}
            >
              {description}
            </span>
          </Link>
        ),
      )}
    </div>
  );
}
