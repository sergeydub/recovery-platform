"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Organization and Members are sub-pages of Clerk's <OrganizationProfile />
// mounted at /settings; Billing is our own page.
const tabs = [
  { title: "Organization", href: "/settings" },
  { title: "Members", href: "/settings/organization-members" },
  { title: "Billing", href: "/settings/billing" },
];

/** Renders without a selected tab when pathname is null. */
export function SettingsTabs({ pathname }: { pathname: string | null }) {
  return (
    <nav className="flex gap-1 border-b">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.title}
          </Link>
        );
      })}
    </nav>
  );
}

// The URL isn't known when the page is prerendered, so the layout wraps this
// in <Suspense> with a plain <SettingsTabs> as the fallback.
export function ActiveSettingsTabs() {
  return <SettingsTabs pathname={usePathname()} />;
}
