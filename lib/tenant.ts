import "server-only";

import { cache } from "react";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { requireOrg } from "@/lib/auth";
import { upsertOrganization } from "@/lib/clerk-sync";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";

async function findOrganization(clerkOrgId: string) {
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.clerkOrgId, clerkOrgId));
  return org;
}

/**
 * The active organization's row in our database, for pages and actions that
 * read or write tenant data. Filter every tenant query by `organizationId`.
 */
export const requireTenant = cache(async () => {
  const session = await requireOrg();
  let org = await findOrganization(session.orgId);

  if (!org) {
    // A newly created organization can get here before Clerk's webhook does.
    const clerk = await clerkClient();
    const clerkOrg = await clerk.organizations.getOrganization({
      organizationId: session.orgId,
    });
    if (clerkOrg.raw) await upsertOrganization(db, clerkOrg.raw);
    org = await findOrganization(session.orgId);
    if (!org) throw new Error(`Organization ${session.orgId} is not synced`);
  }

  return { ...session, organizationId: org.id, organization: org };
});
