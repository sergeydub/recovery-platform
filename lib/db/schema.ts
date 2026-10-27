import {
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Column names are camelCase here and snake_case in Postgres (see `casing` in
// lib/db/index.ts and drizzle.config.ts).

const createdAt = timestamp({ withTimezone: true }).notNull().defaultNow();

// --- Mirrored from Clerk by webhooks (step 8). Clerk stays the source of truth.

export const organizations = pgTable("organizations", {
  id: uuid().primaryKey().defaultRandom(),
  clerkOrgId: text().notNull().unique("organizations_clerk_org_id_unique"),
  name: text().notNull(),
  plan: text().notNull().default("free"),
  seatCount: integer().notNull().default(0),
  createdAt,
});

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  clerkUserId: text().notNull().unique("users_clerk_user_id_unique"),
  email: text().notNull(),
  name: text(),
  createdAt,
});

export const membershipRole = pgEnum("membership_role", ["admin", "member"]);

export const memberships = pgTable(
  "memberships",
  {
    organizationId: uuid()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: membershipRole().notNull().default("member"),
    createdAt,
  },
  (t) => [
    primaryKey({ columns: [t.organizationId, t.userId] }),
    index().on(t.userId),
  ],
);

// --- Owned by the app. Every row belongs to exactly one organization.

export const incidentType = pgEnum("incident_type", [
  "fire",
  "flood",
  "storm",
  "other",
]);

export const incidentStatus = pgEnum("incident_status", [
  "open",
  "in_progress",
  "resolved",
]);

export const incidents = pgTable(
  "incidents",
  {
    id: uuid().primaryKey().defaultRandom(),
    organizationId: uuid()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    title: text().notNull(),
    type: incidentType().notNull(),
    status: incidentStatus().notNull().default("open"),
    occurredAt: timestamp({ withTimezone: true }).notNull(),
    createdAt,
  },
  (t) => [index().on(t.organizationId, t.occurredAt)],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid().primaryKey().defaultRandom(),
    organizationId: uuid()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    // Kept when the user is deleted, so the history stays readable.
    userId: uuid().references(() => users.id, { onDelete: "set null" }),
    action: text().notNull(),
    createdAt,
  },
  (t) => [index().on(t.organizationId, t.createdAt)],
);
