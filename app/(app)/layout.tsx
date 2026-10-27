import Link from "next/link";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";

// Shell for every page that belongs to an organization. It doesn't gate
// access: layouts don't re-run on client navigation, so each page calls
// requireOrg() instead. Step 9 replaces this bar with the full sidebar shell.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-6">
          <OrganizationSwitcher
            hidePersonal
            afterCreateOrganizationUrl="/"
            organizationProfileMode="navigation"
            organizationProfileUrl="/settings"
          />
          <nav className="flex gap-4 text-sm">
            <Link href="/">Dashboard</Link>
            <Link href="/settings/organization-members">Members</Link>
          </nav>
        </div>
        <UserButton />
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </>
  );
}
