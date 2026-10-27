import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import {
  deleteMembership,
  deleteOrganization,
  deleteUser,
  upsertMembership,
  upsertOrganization,
  upsertUser,
} from "@/lib/clerk-sync";
import { db } from "@/lib/db";

// Clerk calls this for user, organization and membership changes. Requests are
// authenticated by their signature (CLERK_WEBHOOK_SIGNING_SECRET), not by a
// session, so nothing else may happen here.
export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (evt.type) {
      case "user.created":
      case "user.updated":
        await upsertUser(db, evt.data);
        break;
      case "user.deleted":
        if (evt.data.id) await deleteUser(db, evt.data.id);
        break;
      case "organization.created":
      case "organization.updated":
        await upsertOrganization(db, evt.data);
        break;
      case "organization.deleted":
        if (evt.data.id) await deleteOrganization(db, evt.data.id);
        break;
      case "organizationMembership.created":
      case "organizationMembership.updated":
        await upsertMembership(db, evt.data);
        break;
      case "organizationMembership.deleted":
        await deleteMembership(db, evt.data);
        break;
    }
  } catch (err) {
    // A non-2xx response makes Clerk retry the event later.
    console.error(`Clerk webhook ${evt.type} failed`, err);
    return new Response("Sync failed", { status: 500 });
  }

  return new Response("OK");
}
