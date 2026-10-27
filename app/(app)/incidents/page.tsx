import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { requireOrg } from "@/lib/auth";

export const metadata: Metadata = { title: "Incidents" };

// Placeholder until step 10 adds the incident list and create form.
export default async function IncidentsPage() {
  await requireOrg();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PageHeader
        title="Incidents"
        description="Fires, floods, storms and other events you're recovering from"
      />
      <EmptyState
        icon={TriangleAlert}
        title="No incidents yet"
        description="Recorded incidents will appear here."
      />
    </div>
  );
}
