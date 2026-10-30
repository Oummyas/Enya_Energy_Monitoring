"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { PAGES } from "@/lib/pages";

// "Home › Apartments › Edit": where the user is, and a way back home
export function Breadcrumb() {
  const pathname = usePathname();
  const page = PAGES.find(
    (p) => pathname === p.href || pathname.startsWith(`${p.href}/`),
  );
  if (!page) return null;

  const rest = pathname.slice(page.href.length);
  const sub = rest === "/new" ? "New" : rest.length > 1 ? "Edit" : null;
  const crumbs = [
    { href: page.href, label: page.label, current: !sub },
    ...(sub ? [{ href: pathname, label: sub, current: true }] : []),
  ];

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <li>
          <Link
            href="/home"
            className="flex items-center gap-1.5 font-medium hover:text-emerald-700 hover:underline dark:hover:text-emerald-400"
          >
            <Logo className="h-4 w-4" />
            Home
          </Link>
        </li>
        {crumbs.map((c) => (
          <li key={c.href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            {c.current ? (
              <span
                aria-current="page"
                className="font-semibold text-foreground"
              >
                {c.label}
              </span>
            ) : (
              <Link
                href={c.href}
                className="font-medium hover:text-emerald-700 hover:underline dark:hover:text-emerald-400"
              >
                {c.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
