import type { Metadata } from "next";
import { ListChecks } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { requireOrg } from "@/lib/auth";

export const metadata: Metadata = { title: "Tasks" };

export default async function TasksPage() {
  await requireOrg();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PageHeader title="Tasks" description="Recovery work and who owns it" />
      <EmptyState
        icon={ListChecks}
        title="Tasks are coming soon"
        description="Recovery task lists arrive with the first domain features."
      />
    </div>
  );
}
