import { and, eq, inArray, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type {
  OrganizationJSON,
  OrganizationMembershipJSON,
  UserJSON,
} from "@clerk/backend";
import * as schema from "@/lib/db/schema";

const { memberships, organizations, users } = schema;

// Mirrors Clerk's users, organizations and memberships into Postgres. Used by
// the webhook (app/api/webhooks/clerk) and the backfill (scripts/sync-clerk.ts).
// Writes are upserts keyed on Clerk IDs, so replayed and out-of-order events
// are harmless. Clerk stays the source of truth.

type Db = NodePgDatabase<typeof schema>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

function fullName(first: string | null, last: string | null) {
  return [first, last].filter(Boolean).join(" ") || null;
}

// Membership events embed snapshots of the organization and user that can be
// older than those records' own events, so with keepExisting they only fill
// in a missing row and never overwrite one.
type UpsertOptions = { keepExisting?: boolean };

async function upsertOrganizationRow(
  tx: Tx,
  org: OrganizationJSON,
  { keepExisting = false }: UpsertOptions = {},
) {
  const [row] = await tx
    .insert(organizations)
    .values({ clerkOrgId: org.id, name: org.name })
    .onConflictDoUpdate({
      target: organizations.clerkOrgId,
      set: { name: keepExisting ? sql`${organizations.name}` : org.name },
    })
    .returning({ id: organizations.id });
  return row.id;
}

async function upsertUserRow(
  tx: Tx,
  user: { clerkUserId: string; email: string; name: string | null },
  { keepExisting = false }: UpsertOptions = {},
) {
  const [row] = await tx
    .insert(users)
    .values(user)
    .onConflictDoUpdate({
      target: users.clerkUserId,
      set: keepExisting
        ? { email: sql`${users.email}` }
        : { email: user.email, name: user.name },
    })
    .returning({ id: users.id });
  return row.id;
}

// Seat count follows the mirrored memberships rather than Clerk's
// members_count, which can lag behind the event that changed it.
async function refreshSeatCounts(tx: Tx, organizationIds: string[]) {
  if (organizationIds.length === 0) return;
  await tx
    .update(organizations)
    .set({
      seatCount: sql`(select count(*) from ${memberships} where ${memberships.organizationId} = ${organizations.id})`,
    })
    .where(inArray(organizations.id, organizationIds));
}

export async function upsertOrganization(db: Db, org: OrganizationJSON) {
  await db.transaction((tx) => upsertOrganizationRow(tx, org));
}

export async function deleteOrganization(db: Db, clerkOrgId: string) {
  // Cascades to the organization's memberships, incidents and audit log.
  await db.delete(organizations).where(eq(organizations.clerkOrgId, clerkOrgId));
}

export async function upsertUser(db: Db, user: UserJSON) {
  const email =
    user.email_addresses.find((e) => e.id === user.primary_email_address_id)
      ?.email_address ??
    user.email_addresses[0]?.email_address ??
    "";

  await db.transaction((tx) =>
    upsertUserRow(tx, {
      clerkUserId: user.id,
      email,
      name: fullName(user.first_name, user.last_name),
    }),
  );
}

export async function deleteUser(db: Db, clerkUserId: string) {
  await db.transaction(async (tx) => {
    const affected = await tx
      .select({ organizationId: memberships.organizationId })
      .from(memberships)
      .innerJoin(users, eq(users.id, memberships.userId))
      .where(eq(users.clerkUserId, clerkUserId));

    await tx.delete(users).where(eq(users.clerkUserId, clerkUserId));
    await refreshSeatCounts(
      tx,
      affected.map((m) => m.organizationId),
    );
  });
}

export async function upsertMembership(
  db: Db,
  membership: OrganizationMembershipJSON,
) {
  const { organization, public_user_data: member } = membership;
  const role = membership.role === "org:admin" ? "admin" : "member";

  await db.transaction(async (tx) => {
    // The organization and user events may not have arrived yet.
    const keepExisting = { keepExisting: true };
    const organizationId = await upsertOrganizationRow(
      tx,
      organization,
      keepExisting,
    );
    const userId = await upsertUserRow(
      tx,
      {
        clerkUserId: member.user_id,
        email: member.identifier,
        name: fullName(member.first_name, member.last_name),
      },
      keepExisting,
    );

    await tx
      .insert(memberships)
      .values({ organizationId, userId, role })
      .onConflictDoUpdate({
        target: [memberships.organizationId, memberships.userId],
        set: { role },
      });
    await refreshSeatCounts(tx, [organizationId]);
  });
}

export async function deleteMembership(
  db: Db,
  membership: OrganizationMembershipJSON,
) {
  await db.transaction(async (tx) => {
    const [org] = await tx
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.clerkOrgId, membership.organization.id));
    if (!org) return;

    const userIds = tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, membership.public_user_data.user_id));

    await tx
      .delete(memberships)
      .where(
        and(
          eq(memberships.organizationId, org.id),
          inArray(memberships.userId, userIds),
        ),
      );
    await refreshSeatCounts(tx, [org.id]);
  });
}
