"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { PAGES } from "@/lib/pages";
import { cn } from "@/lib/utils";

// "Home" comes first, with the Enya logo as its icon
const NAV = [
  {
    href: "/home",
    label: "Home",
    icon: ({ className }: { className?: string }) => (
      <Logo className={className} />
    ),
    color: "",
  },
  ...PAGES,
];

// Page links of the header; the current page is highlighted in green
export function NavLinks() {
  return <NavLinksList pathname={usePathname()} />;
}

// Same links with nothing highlighted, shown while the current page is not
// known yet (Suspense fallback during prerendering)
export function NavLinksFallback() {
  return <NavLinksList pathname="" />;
}

function NavLinksList({ pathname }: { pathname: string }) {
  return (
    <ul className="flex flex-wrap gap-x-7 gap-y-1">
      {NAV.map(({ href, label, icon: Icon, color }) => {
        const current = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={current ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-2 py-3 font-semibold transition-colors",
                current
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-foreground hover:text-emerald-700 dark:hover:text-emerald-400",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-white shadow-sm ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110",
                  color,
                )}
              >
                <Icon className={href === "/home" ? "h-6 w-6" : "h-5 w-5"} />
              </span>
              {label}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-emerald-600 transition-opacity dark:bg-emerald-400",
                  current ? "opacity-100" : "opacity-0 group-hover:opacity-40",
                )}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
