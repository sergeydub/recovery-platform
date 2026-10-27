import { OrganizationProfile } from "@clerk/nextjs";
import { requireOrg } from "@/lib/auth";

// Clerk's organization profile: General at /settings, Members (invites,
// role changes, removals) at /settings/organization-members, and Billing once
// Stripe is connected. It only shows management controls to admins. The
// catch-all route serves its sub-pages.
export default async function SettingsPage() {
  await requireOrg();

  return (
    <main className="flex flex-1 justify-center p-6">
      <OrganizationProfile path="/settings" afterLeaveOrganizationUrl="/" />
    </main>
  );
}
