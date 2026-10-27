"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  ListChecks,
  Settings,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavItem = { title: string; href: string; icon: LucideIcon };

const nav: Record<"main" | "footer", NavItem[]> = {
  main: [
    { title: "Dashboard", href: "/", icon: LayoutDashboard },
    { title: "Incidents", href: "/incidents", icon: TriangleAlert },
    { title: "Tasks", href: "/tasks", icon: ListChecks },
    { title: "Documents", href: "/documents", icon: FileText },
  ],
  footer: [{ title: "Settings", href: "/settings", icon: Settings }],
};

type Section = keyof typeof nav;

function isActive(href: string, pathname: string | null) {
  if (!pathname) return false;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Renders without a highlighted item when pathname is null. */
export function NavMenu({
  section,
  pathname,
}: {
  section: Section;
  pathname: string | null;
}) {
  return (
    <SidebarMenu>
      {nav[section].map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            isActive={isActive(item.href, pathname)}
            tooltip={item.title}
            render={<Link href={item.href} />}
          >
            <item.icon />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

// The URL isn't known when the shell is prerendered, so the layout wraps this
// in <Suspense> with a plain <NavMenu> as the fallback.
export function ActiveNavMenu({ section }: { section: Section }) {
  return <NavMenu section={section} pathname={usePathname()} />;
}
