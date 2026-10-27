import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Search } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

// Shell for every page that belongs to an organization. It doesn't gate
// access: layouts don't re-run on client navigation, so each page calls
// requireOrg() or requireTenant() instead.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-5" />
          <OrganizationSwitcher
            hidePersonal
            afterCreateOrganizationUrl="/"
            organizationProfileMode="navigation"
            organizationProfileUrl="/settings"
          />
          <div className="mx-auto hidden w-full max-w-md md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              {/* Placeholder until there's something to search */}
              <Input
                type="search"
                placeholder="Search incidents, tasks and documents"
                aria-label="Search"
                className="pl-8"
                disabled
              />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <ThemeToggle />
            <UserButton />
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
