import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

// Sessions waiting on Clerk's "choose-organization" task count as signed in
// here, so they're sent to onboarding instead of back to sign-in.
async function getSession() {
  return auth({ treatPendingAsSignedOut: false });
}

/**
 * The single gate for tenant-scoped pages, actions and queries. Returns the
 * active organization from the Clerk session; never take an org ID from the
 * URL or request body.
 */
export const requireOrg = cache(async () => {
  const { userId, orgId, orgRole, redirectToSignIn } = await getSession();

  if (!userId) return redirectToSignIn();
  if (!orgId) redirect("/onboarding");

  return { userId, orgId, orgRole };
});

/** For pages that need a signed-in user who may not have an organization yet. */
export const requireUser = cache(async () => {
  const { userId, orgId, sessionStatus, redirectToSignIn } = await getSession();

  if (!userId) return redirectToSignIn();

  return { userId, orgId, sessionStatus };
});
