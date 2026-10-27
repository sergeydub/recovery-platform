import { Suspense } from "react";
import { redirect } from "next/navigation";
import { TaskChooseOrganization } from "@clerk/nextjs";
import { requireUser } from "@/lib/auth";

export default function OnboardingPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      {/* Reads the session, which isn't known at prerender time */}
      <Suspense>
        <ChooseOrganization />
      </Suspense>
    </main>
  );
}

async function ChooseOrganization() {
  const { orgId } = await requireUser();
  if (orgId) redirect("/");

  // Clerk's "choose-organization" task: lets the user create an organization
  // or join one they've been invited to, then marks the session complete.
  return <TaskChooseOrganization redirectUrlComplete="/" />;
}
