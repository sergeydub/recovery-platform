import { OrganizationProfile } from "@clerk/nextjs";
import { requireOrg } from "@/lib/auth";

// Clerk's organization profile: General at /settings and Members (invites,
// role changes, removals) at /settings/organization-members. It only shows
// management controls to admins. The settings tabs replace Clerk's own
// sidebar, and the catch-all route serves its sub-pages.
export default async function SettingsPage() {
  await requireOrg();

  return (
    <OrganizationProfile
      path="/settings"
      afterLeaveOrganizationUrl="/"
      // `!` because Clerk's own styles otherwise win over Tailwind's
      appearance={{
        elements: {
          rootBox: "w-full!",
          // One column: the first was Clerk's navbar
          cardBox:
            "h-auto! min-h-0! w-full! max-w-none! grid-cols-1! shadow-none!",
          navbar: "hidden!",
          navbarMobileMenuRow: "hidden!",
        },
      }}
    />
  );
}
