// Copies every Clerk user, organization and membership into Postgres. Webhooks
// only carry changes, so run this once after connecting a database, or any time
// the mirror may have missed events: npm run db:sync-clerk
//
// Safe to re-run: it only upserts. It does not remove rows for things already
// deleted in Clerk.

import { loadEnvConfig } from "@next/env";
import { createClerkClient } from "@clerk/backend";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  upsertMembership,
  upsertOrganization,
  upsertUser,
} from "@/lib/clerk-sync";
import * as schema from "@/lib/db/schema";

loadEnvConfig(process.cwd());

const PAGE = 100;

async function* paginate<T>(
  fetchPage: (offset: number) => Promise<{ data: T[] }>,
) {
  for (let offset = 0; ; offset += PAGE) {
    const { data } = await fetchPage(offset);
    yield* data;
    if (data.length < PAGE) return;
  }
}

async function main() {
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool, schema, casing: "snake_case" });
  const counts = { users: 0, organizations: 0, memberships: 0 };

  try {
    for await (const user of paginate((offset) =>
      clerk.users.getUserList({ limit: PAGE, offset }),
    )) {
      if (!user.raw) continue;
      await upsertUser(db, user.raw);
      counts.users++;
    }

    for await (const org of paginate((offset) =>
      clerk.organizations.getOrganizationList({ limit: PAGE, offset }),
    )) {
      if (!org.raw) continue;
      await upsertOrganization(db, org.raw);
      counts.organizations++;

      for await (const membership of paginate((offset) =>
        clerk.organizations.getOrganizationMembershipList({
          organizationId: org.id,
          limit: PAGE,
          offset,
        }),
      )) {
        if (!membership.raw) continue;
        await upsertMembership(db, membership.raw);
        counts.memberships++;
      }
    }
  } finally {
    await pool.end();
  }

  console.log(
    `Synced ${counts.users} users, ${counts.organizations} organizations, ${counts.memberships} memberships.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
